from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from uuid import uuid4

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import Depends, HTTPException, Request, Response, status
from sqlalchemy import delete, select
from sqlalchemy.orm import joinedload

from .config import Settings
from .database import DatabaseManager
from .models import AuthSessionResponse, AuthUser, CreateUserRequest, LoginRequest, UserRole
from .persistence_models import AuthSessionModel, CompanyModel, UserModel


@dataclass(slots=True)
class CurrentUser:
    user_id: str
    company_id: str
    email: str
    role: UserRole


@dataclass(slots=True)
class IssuedSession:
    session_id: str
    response: AuthSessionResponse


class AuthService:
    def __init__(self, database_manager: DatabaseManager, settings: Settings) -> None:
        self.database_manager = database_manager
        self.settings = settings
        self.password_hasher = PasswordHasher()

    def ensure_bootstrap_admin(self) -> None:
        if not self.settings.bootstrap_admin_email or not self.settings.bootstrap_admin_password:
            return

        with self.database_manager.create_session() as session:
            company = session.get(CompanyModel, self.settings.bootstrap_company_id)
            if company is None:
                company = CompanyModel(
                    company_id=self.settings.bootstrap_company_id,
                    display_name=self.settings.bootstrap_company_name,
                )
                session.add(company)

            existing_user = session.execute(
                select(UserModel).where(UserModel.email == self.settings.bootstrap_admin_email)
            ).scalar_one_or_none()
            if existing_user is None:
                session.add(
                    UserModel(
                        user_id=uuid4().hex,
                        company_id=self.settings.bootstrap_company_id,
                        email=self.settings.bootstrap_admin_email,
                        password_hash=self.password_hasher.hash(
                            self.settings.bootstrap_admin_password
                        ),
                        role=UserRole.FINANCE_ADMIN.value,
                        is_active=True,
                    )
                )
            session.commit()

    def authenticate(self, payload: LoginRequest) -> IssuedSession:
        with self.database_manager.create_session() as session:
            user = session.execute(
                select(UserModel).where(UserModel.email == payload.email)
            ).scalar_one_or_none()
            if user is None or not user.password_hash or not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials.",
                )

            try:
                self.password_hasher.verify(user.password_hash, payload.password)
            except VerifyMismatchError as exc:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials.",
                ) from exc

            auth_session = AuthSessionModel(
                session_id=uuid4().hex,
                user_id=user.user_id,
                company_id=user.company_id,
                expires_at=self._expires_at(),
            )
            session.add(auth_session)
            session.commit()

            return IssuedSession(
                session_id=auth_session.session_id,
                response=AuthSessionResponse(
                    user=AuthUser(
                        user_id=user.user_id,
                        company_id=user.company_id,
                        email=user.email or "",
                        role=UserRole(user.role),
                    )
                )
            )

    def create_user(self, current_user: CurrentUser, payload: CreateUserRequest) -> AuthUser:
        with self.database_manager.create_session() as session:
            existing_user = session.execute(
                select(UserModel).where(UserModel.email == payload.email)
            ).scalar_one_or_none()
            if existing_user is not None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="A user with that email already exists.",
                )

            user = UserModel(
                user_id=uuid4().hex,
                company_id=current_user.company_id,
                email=payload.email,
                password_hash=self.password_hasher.hash(payload.password),
                role=payload.role.value,
                is_active=True,
            )
            session.add(user)
            session.commit()
            return AuthUser(
                user_id=user.user_id,
                company_id=user.company_id,
                email=user.email or "",
                role=UserRole(user.role),
            )

    def get_current_user(self, session_id: str | None) -> CurrentUser:
        if not session_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required.",
            )

        with self.database_manager.create_session() as session:
            auth_session = session.execute(
                select(AuthSessionModel)
                .options(joinedload(AuthSessionModel.user))
                .where(AuthSessionModel.session_id == session_id)
            ).scalar_one_or_none()

            if auth_session is None or auth_session.user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required.",
                )

            if self._is_expired(auth_session.expires_at):
                session.delete(auth_session)
                session.commit()
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Session expired.",
                )

            user = auth_session.user
            if not user.is_active or not user.email:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required.",
                )

            return CurrentUser(
                user_id=user.user_id,
                company_id=user.company_id,
                email=user.email,
                role=UserRole(user.role),
            )

    def refresh_session(self, session_id: str | None) -> AuthSessionResponse:
        if not session_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication required.",
            )
        with self.database_manager.create_session() as session:
            auth_session = session.execute(
                select(AuthSessionModel)
                .options(joinedload(AuthSessionModel.user))
                .where(AuthSessionModel.session_id == session_id)
            ).scalar_one_or_none()
            if auth_session is None or auth_session.user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required.",
                )
            if self._is_expired(auth_session.expires_at):
                session.delete(auth_session)
                session.commit()
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Session expired.",
                )

            auth_session.expires_at = self._expires_at()
            session.commit()
            user = auth_session.user
            return AuthSessionResponse(
                user=AuthUser(
                    user_id=user.user_id,
                    company_id=user.company_id,
                    email=user.email or "",
                    role=UserRole(user.role),
                )
            )

    def delete_session(self, session_id: str | None) -> None:
        if not session_id:
            return
        with self.database_manager.create_session() as session:
            session.execute(
                delete(AuthSessionModel).where(AuthSessionModel.session_id == session_id)
            )
            session.commit()

    def set_session_cookie(self, response: Response, session_id: str) -> None:
        response.set_cookie(
            key=self.settings.session_cookie_name,
            value=session_id,
            httponly=True,
            secure=self.settings.session_cookie_secure,
            samesite="lax",
            max_age=self.settings.session_ttl_hours * 3600,
            path="/",
        )

    def clear_session_cookie(self, response: Response) -> None:
        response.delete_cookie(
            key=self.settings.session_cookie_name,
            path="/",
            samesite="lax",
        )

    def _expires_at(self) -> datetime:
        return datetime.now(UTC) + timedelta(hours=self.settings.session_ttl_hours)

    def _is_expired(self, value: datetime) -> bool:
        normalized = value if value.tzinfo is not None else value.replace(tzinfo=UTC)
        return normalized <= datetime.now(UTC)


def get_auth_service(request: Request) -> AuthService:
    auth_service = getattr(request.app.state, "auth_service", None)
    if auth_service is None:
        raise RuntimeError("Auth service is not configured.")
    return auth_service


def get_current_user(
    request: Request,
    auth_service: AuthService = Depends(get_auth_service),
) -> CurrentUser:
    session_id = request.cookies.get(auth_service.settings.session_cookie_name)
    return auth_service.get_current_user(session_id)


def require_roles(*allowed_roles: UserRole):
    def dependency(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if allowed_roles and current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action.",
            )
        return current_user

    return dependency
