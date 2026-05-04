FROM python:3.12-slim

WORKDIR /app

COPY pyproject.toml ./
COPY alembic.ini ./
COPY alembic ./alembic
COPY src ./src

RUN python -m pip install --upgrade pip && \
    pip install -e ".[dev]"

EXPOSE 8000

CMD ["agentsuite-agent"]
