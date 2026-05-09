# AgentSuite

> **The Agentic ERP — Under Construction**
>
> Autonomous operations, human oversight. Currently a **work-in-progress MVP candidate** focused on the Finance module.

AgentSuite is an autonomous operations platform where AI agents execute business processes in the background while humans review, approve, and steer. Unlike traditional ERPs that are passive databases, AgentSuite is active: agents run reconciliation, evaluate supplier payments, and monitor budgets — surfacing decisions for human approval at critical gates.

**Current state:** The Finance module is the first and only operational module. All other modules are visual previews that communicate the product direction.

---

## What Works Today

### Finance Module (Operational)

The Finance agent runs three persistent, database-backed processes:

| Process | Status | Description |
| --- | --- | --- |
| **Bank Reconciliation** | Working | Ingests CSV statements, matches transactions against invoices/expenses using heuristic scoring + LLM disambiguation, returns matches, unmatched movements, ledger orphans, and manual review items. |
| **Supplier Payments** | Working | Evaluates early-payment discounts against cash position and policy thresholds. Supports evaluate, simulate, and execute modes. Integrates with Stripe Link for virtual payment credentials (or mock mode for local dev). |
| **Budget Control** | Working | Tracks expenses against monthly budgets, auto-categorizes via keyword rules + LLM fallback, surfaces preventive alerts and hard blocks when thresholds are exceeded. |

Every process follows an autonomous pipeline:

```
Intent → Intake → Normalize → Skill Selection → Analysis → Policy → Action → Response
```

Humans intervene at **policy** (thresholds) and **action** (approvals). Everything else runs autonomously.

Each process supports three execution modes:
- **Evaluate** — Run analysis without side effects. See what the agent would do.
- **Simulate** — Execute against test data or sandbox environments.
- **Execute** — Run with real credentials, requiring human approval at critical gates.

### Infrastructure That Works

- **Persistent runs and audit logs** — All runs, decisions, and audit events are stored in PostgreSQL (or SQLite for local dev). Restarting the backend does not lose history.
- **Invite-only authentication** — HttpOnly cookie sessions with refresh flow, Argon2 password hashing, and role-based access control (`finance_admin`, `accountant`, `treasurer`, `viewer`).
- **Versioned API** — Backend routes under `/api/v1`.
- **Docker Compose stack** — One-command local demo with PostgreSQL, migrations, and mock payments.
- **CI pipeline** — GitHub Actions runs backend tests, frontend lint + build, and payments service build on every push.

---

## What Is Coming Soon

The following modules exist as **visual previews** in the UI to communicate the product roadmap. They are not yet operational:

| Module | Status | Planned Capabilities |
| --- | --- | --- |
| **Procurement** | Preview | Purchase order optimization, vendor scoring, contract renewal alerts |
| **Inventory** | Preview | Demand forecasting, reorder automation, stock reconciliation |
| **Sales & CRM** | Preview | Lead scoring, quote generation, pipeline risk detection |
| **Operations** | Preview | Production scheduling, quality control, maintenance predictions |
| **Human Resources** | Preview | Payroll validation, expense compliance, headcount forecasting |
| **Projects** | Preview | Budget vs. actual tracking, milestone risk, resource allocation |
| **Analytics** | Preview | Natural language queries, anomaly detection, predictive alerts |

---

## Architecture

AgentSuite is composed of three independent services designed for production deployment and fast local development.

| Service | Stack | Responsibility |
| --- | --- | --- |
| **Agent Core** | Python, FastAPI, LangGraph, SQLAlchemy 2, Alembic | Workflow engine, process services, LLM orchestration, persistence |
| **Payments Gateway** | Node.js, Express | Wrapper around Stripe Link CLI for secure one-time credentials |
| **Console** | React, Vite, Tailwind, Ant Design | Human interface for intent, review, approval, and audit |

```
┌─────────────┐     HTTP      ┌──────────────┐     HTTP      ┌─────────────────┐
│   Console   │──────────────→│  Agent Core  │──────────────→│ Payments Gateway│
│  (React)    │               │(FastAPI+Graph)│               │ (Stripe Link)   │
└─────────────┘               └──────────────┘               └─────────────────┘
                                     ↓
                              ┌──────────────┐
                              │  LLM (OpenAI)│
                              │(disambiguate,│
                              │ categorize)  │
                              └──────────────┘
```

### Frontend UI system

The ERP console uses a **free enterprise UI stack** based on:

- **Ant Design** for core components,
- **Ant Design ProComponents** for backoffice patterns such as enterprise tables,
- **Tailwind** only for layout and fine-grained visual adjustments.

UI implementation follows an **Atomic Design** hierarchy:

| Layer | Responsibility |
| --- | --- |
| `pages/` | Route-level data loading and composition |
| `templates/` | Page structure and shell composition |
| `organisms/` | Complex ERP surfaces like module catalogs, workbenches, selectors, and list-detail screens |
| `molecules/` | Small reusable interaction groups |
| `atoms/` | Wrapped visual primitives aligned to the theme |

Governance rules:

1. Prefer wrappers from `frontend/src/components/ui/` or `frontend/src/components/atoms/` over scattering raw `antd` usage.
2. Keep theme tokens centralized in `frontend/src/lib/ui-theme.tsx`.
3. Reuse existing organisms and templates before creating page-specific one-off components.
4. Treat Tailwind as a layout aid, not as a parallel design system.

Reference file: `frontend/src/lib/ui-governance.ts`

---

## Local Development

AgentSuite runs 100% on your machine. No cloud dependencies required.

### Prerequisites
- Python 3.12+
- Node.js 20+
- OpenAI API key (for LLM disambiguation and categorization)
- PostgreSQL for durable run history in deployed environments

### 1. Payments Gateway

```bash
cd agent/payments
npm install
```

**Option A — Mock mode (no Stripe required):**
```bash
MOCK_PAYMENTS=true npm run dev
```

**Option B — Real Stripe Link (requires authentication):**
```bash
npm run dev
# Then authenticate:
# node node_modules/.bin/link-cli auth login
```

Service runs at `http://127.0.0.1:3001` (localhost only, never exposed).

### 2. Agent Core

```bash
cd agent
cp .env.example .env
# Edit .env and add OPENAI_API_KEY
# Configure DATABASE_URL and bootstrap admin credentials

source .venv/bin/activate
pip install -e ".[dev]"
alembic upgrade head
agentsuite-agent
```

Healthcheck:
```bash
curl http://localhost:8000/health
```

### 3. Console

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Docker Compose demo stack

For a controlled demo or pilot-like local environment:

```bash
cp .env.compose.example .env.compose
# Edit .env.compose and set OPENAI_API_KEY plus bootstrap credentials
docker compose --env-file .env.compose up --build
```

Services:

- **Console**: `http://localhost:4173`
- **Agent Core**: `http://localhost:8000`
- **Payments Gateway**: `http://localhost:3001`
- **PostgreSQL**: `localhost:5432`

The compose stack runs:

- PostgreSQL with health checks,
- Agent Core with Alembic migrations on startup,
- Payments in mock mode by default,
- Console built for direct API access using `VITE_AGENT_API_URL`,
- a bootstrap admin and demo workspace from `.env.compose`.

---

## Environment Variables

Keep these local. Never commit `.env` files. The repo ignores all `.env`, `*.db`, and generated build artifacts by default.

### Agent Core (`agent/.env`)
```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL_FAST=gpt-4.1-mini
OPENAI_MODEL_REASONING=gpt-4.1
OPENAI_TEMPERATURE=0.1
DATABASE_URL=postgresql+psycopg://agentsuite:agentsuite@127.0.0.1:5432/agentsuite
DATABASE_ECHO=false
DATABASE_AUTO_CREATE=false
SESSION_COOKIE_NAME=agentsuite_session
SESSION_TTL_HOURS=12
SESSION_COOKIE_SECURE=false
BOOTSTRAP_COMPANY_ID=demo-company
BOOTSTRAP_COMPANY_NAME=AgentSuite Demo Workspace
BOOTSTRAP_ADMIN_EMAIL=finance@company.com
BOOTSTRAP_ADMIN_PASSWORD=change-this-password
AGENT_CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173
PAYMENTS_SERVICE_URL=http://127.0.0.1:3001
```

### Console (`frontend/.env`)
```env
VITE_AGENT_API_URL=http://127.0.0.1:8000
```

---

## Testing

```bash
cd agent
source .venv/bin/activate
pytest test/test_api.py -v
```

All core API tests pass. Tests run against mock dependencies — no Stripe account or network calls required.

---

## CI

GitHub Actions validates the repo with:

- backend tests,
- frontend lint + build,
- payments service build.

Workflow file: `.github/workflows/ci.yml`

---

## Roadmap

- [x] Finance agent (reconciliation, payments, budgets)
- [x] Persistent run history (database-backed)
- [x] Invite-only auth with roles
- [ ] Procurement agent (PO optimization, vendor scoring)
- [ ] Inventory agent (demand forecasting, auto-reorder)
- [ ] Sales agent (lead scoring, quote generation)
- [ ] Cross-module context sharing
- [ ] Multi-tenant workspace support
- [ ] Audit trail with cryptographic signatures

---

## License

MIT
