# AgentSuite

> **The Agentic ERP. Autonomous operations, human oversight.**

AgentSuite is a next-generation **Agentic ERP** — not a traditional dashboard with forms, but an autonomous operations platform where AI agents execute business processes in the background while humans review, approve, and steer.

Traditional ERPs are passive databases. AgentSuite is active: agents run reconciliation, evaluate supplier payments, monitor budgets, and surface decisions for approval. You operate through intent, not clicks.

---

## What makes it Agentic

| Traditional ERP | AgentSuite |
| --- | --- |
| Manual data entry | Agents ingest and normalize inputs automatically |
| Static reports | Agents analyze and flag exceptions in real time |
| Rigid workflows | Agents route decisions through policy + human approval |
| Module silos | Cross-module agents that understand context |

Every process follows an autonomous pipeline:

```
Intent → Intake → Normalize → Skill Selection → Analysis → Policy → Action → Response
```

Humans intervene at **policy** (thresholds) and **action** (approvals). Everything else runs autonomously.

---

## Modules

| Module | Status | Agent Capabilities |
| --- | --- | --- |
| **Finance** | Live | Bank reconciliation, supplier payment evaluation, budget control |
| **Procurement** | Coming Soon | Purchase order optimization, vendor scoring, contract renewal alerts |
| **Inventory** | Coming Soon | Demand forecasting, reorder automation, stock reconciliation |
| **Sales & CRM** | Coming Soon | Lead scoring, quote generation, pipeline risk detection |
| **Operations** | Coming Soon | Production scheduling, quality control, maintenance predictions |
| **Human Resources** | Coming Soon | Payroll validation, expense compliance, headcount forecasting |
| **Projects** | Coming Soon | Budget vs. actual tracking, milestone risk, resource allocation |
| **Analytics** | Coming Soon | Natural language queries, anomaly detection, predictive alerts |

Each module exposes three execution modes:

- **Evaluate** — Run analysis without side effects. See what the agent would do.
- **Simulate** — Execute against test data or sandbox environments.
- **Execute** — Run with real credentials, requiring human approval at critical gates.

---

## Live Capabilities

### 1. Bank Reconciliation
- Ingests CSV statements
- Matches transactions against invoices and expenses using heuristic scoring + LLM disambiguation
- Returns matches, unmatched movements, ledger orphans, and manual review items

### 2. Supplier Payments
- Evaluates early-payment discounts against cash position and policy thresholds
- Generates one-time virtual payment credentials via Stripe Link (or mock mode for local dev)
- Requires human approval for execution; simulates safely for testing

### 3. Budget Control
- Tracks expenses against monthly budgets
- Auto-categorizes via keyword rules + LLM fallback
- Surfaces preventive alerts and hard blocks when thresholds are exceeded

---

## Architecture

AgentSuite is composed of three independent services designed for production deployment and fast local development.

| Service | Stack | Responsibility |
| --- | --- | --- |
| **Agent Core** | Python, FastAPI, LangGraph | Workflow engine, process services, LLM orchestration |
| **Payments Gateway** | Node.js, Express | Wrapper around Stripe Link CLI for secure one-time credentials |
| **Console** | React, Vite, Tailwind | Human interface for intent, review, approval, and audit |

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

The ERP console now uses a **free enterprise UI stack** based on:

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

Keep these local. Never commit `.env` files.

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

All tests run against mock dependencies. No Stripe account or network calls required.

---

## CI

GitHub Actions now validates the repo with:

- backend tests,
- frontend lint + build,
- payments service build.

Workflow file: `.github/workflows/ci.yml`

---

## Roadmap

- [x] Finance agent (reconciliation, payments, budgets)
- [ ] Procurement agent (PO optimization, vendor scoring)
- [ ] Inventory agent (demand forecasting, auto-reorder)
- [ ] Sales agent (lead scoring, quote generation)
- [ ] Cross-module context sharing
- [x] Persistent run history (database-backed)
- [ ] Multi-tenant workspace support
- [ ] Audit trail with cryptographic signatures

---

## License

MIT
