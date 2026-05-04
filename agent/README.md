# AgentSuite Agent

Backend del agente financiero de AgentSuite. Expone una API con FastAPI y orquesta procesos con LangGraph para ejecutar tareas operativas y devolver resultados auditables para la UI del ERP.

## Como funciona

El agente corre una secuencia fija por cada corrida:

1. `intake`
2. `normalize`
3. `skill_selection`
4. `analysis`
5. `policy`
6. `action`
7. `response`

Cada corrida genera:

- `run_id`
- `process_type`
- `status`
- `final_output`
- `audit_log`

El backend ya puede persistir corridas y auditoria en base de datos. Para despliegues o pilotos la ruta recomendada es PostgreSQL; en desarrollo local tambien puede auto-crear una base SQLite si no configuras `DATABASE_URL`.

## Tareas que ejecuta hoy

### 1. Conciliacion bancaria

Endpoint:

- `POST /agent/runs/reconciliation`

Que hace:

- recibe un CSV de movimientos bancarios,
- lo cruza contra facturas de venta y registros de gasto,
- detecta coincidencias, faltantes y casos ambiguos,
- devuelve conteos, resumen ejecutivo y detalle estructurado.

### 2. Pagos a proveedores

Endpoints:

- `POST /agent/runs/payments/evaluate`
- `POST /agent/runs/payments/approve`

Que hace:

- evalua facturas de proveedor con descuento por pronto pago,
- revisa caja disponible y politica de aprobacion,
- marca facturas como `wait`, `ready_to_pay`, `pending_approval` o `blocked`,
- puede simular o ejecutar el pago.

Estado actual:

- `evaluate`: funcional
- `simulate`: funcional
- `execute`: funcional en Monad testnet usando `SupplierPaymentExecutor`

Para `execute`, cada factura debe incluir `beneficiary_address` y el payload debe usar `cash_position.currency = "MON"`.

### 3. Control presupuestal

Endpoint:

- `POST /agent/runs/budgets`

Que hace:

- revisa gastos nuevos contra presupuesto mensual,
- categoriza cuando hace falta,
- genera alertas, aprobaciones o bloqueos,
- devuelve resumen y resultados estructurados por gasto.

## Endpoints disponibles

- `GET /api/v1/health`
- `GET /api/v1/agent/runs`
- `GET /api/v1/agent/runs/{run_id}`
- `GET /api/v1/agent/runs/{run_id}/audit`
- `POST /api/v1/agent/runs/reconciliation`
- `POST /api/v1/agent/runs/payments/evaluate`
- `POST /api/v1/agent/runs/payments/approve`
- `POST /api/v1/agent/runs/budgets`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/users`
- `GET /health`
- `GET /agent/runs`
- `GET /agent/runs/{run_id}`
- `GET /agent/runs/{run_id}/audit`
- `POST /agent/runs/reconciliation`
- `POST /agent/runs/payments/evaluate`
- `POST /agent/runs/payments/approve`
- `POST /agent/runs/budgets`

## Variables de entorno

Crea tu archivo `.env` a partir del ejemplo:

```bash
cd agent
cp .env.example .env
```

Variables actuales:

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=
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
AGENT_CORS_ORIGIN_REGEX=https://.*\\.vercel\\.app
MONAD_CHAIN_ID=10143
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_EXPLORER_URL=https://testnet.monadexplorer.com
MONAD_FAUCET_URL=https://faucet.monad.xyz
MONAD_DEPLOYER_PRIVATE_KEY=
MONAD_PAYMENT_CONTRACT_ADDRESS=0x260d0957B70B1dAcD534AcB23A6893396F2e06e3
```

## Importante sobre secretos

- No pongas private keys ni API keys en archivos versionados.
- `agent/.env` ya esta ignorado por Git.
- Nunca copies tus credenciales a este `README`.

## Requisitos para correr

- Python 3.12+
- virtualenv en `agent/.venv`
- credenciales de OpenAI
- para pagos reales, una wallet con fondos en Monad testnet y el contrato ya desplegado

## Instalacion

Si ya existe `.venv`:

```bash
cd /home/robinhodl/projectsAi/agentsuite/agent
source .venv/bin/activate
pip install -e ".[dev]"
```

## Migraciones

Para una base PostgreSQL real:

```bash
cd /home/robinhodl/projectsAi/agentsuite/agent
source .venv/bin/activate
alembic upgrade head
```

Si trabajas sin `DATABASE_URL`, el backend puede auto-crear una base SQLite local cuando `DATABASE_AUTO_CREATE=true`.

## Acceso inicial

El backend crea un workspace y un usuario administrador inicial usando `BOOTSTRAP_COMPANY_ID`, `BOOTSTRAP_COMPANY_NAME`, `BOOTSTRAP_ADMIN_EMAIL` y `BOOTSTRAP_ADMIN_PASSWORD`.

Flujo recomendado:

1. configura esas tres variables en `agent/.env`,
2. opcionalmente ajusta `BOOTSTRAP_COMPANY_NAME` para el nombre del workspace demo,
3. corre `alembic upgrade head`,
4. levanta el backend y entra al frontend,
5. inicia sesion con ese usuario para crear el resto de cuentas via `POST /api/v1/auth/users`.

## Observabilidad minima

- cada respuesta HTTP devuelve `x-request-id`,
- el backend escribe logs estructurados por request y por cambio de estado de run,
- `GET /api/v1/health` valida conectividad con la base y responde `{"status":"ok","database":"ok"}` cuando todo esta sano.

## Docker Compose

Desde la raiz del repo:

```bash
cp .env.compose.example .env.compose
docker compose --env-file .env.compose up --build
```

El stack levanta PostgreSQL, payments, agent y frontend con health checks y migraciones en arranque.

## Levantar el backend

```bash
cd /home/robinhodl/projectsAi/agentsuite/agent
source .venv/bin/activate
agentsuite-agent
```

Alternativa con Uvicorn:

```bash
uvicorn agentsuite_agent.api:create_app --factory --host 0.0.0.0 --port 8000
```

## Verificar que esta arriba

```bash
curl http://localhost:8000/health
```

Respuesta esperada:

```json
{"status":"ok"}
```

## Correr pruebas

```bash
cd /home/robinhodl/projectsAi/agentsuite/agent
source .venv/bin/activate
pytest -q
```

## Flujo con el frontend

1. Levanta este backend.
2. Levanta el frontend.
3. Entra a `/erp/finanzas`.
4. Ejecuta un proceso.
5. Revisa el output en la consola y en `/erp/finanzas/historial`.
6. Si tu rol es `viewer`, el frontend queda en modo solo lectura.

## Demo con frontend en Vercel

La forma mas simple para demo es:

1. levantar este backend en local,
2. abrir un tunel HTTPS con `ngrok http 8000` o `cloudflared`,
3. agregar el dominio publico del tunel y el dominio de Vercel en `AGENT_CORS_ORIGINS`,
4. configurar `VITE_AGENT_API_URL` en Vercel apuntando al tunel.

Ejemplo:

```env
AGENT_CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://abc123.ngrok-free.app
AGENT_CORS_ORIGIN_REGEX=https://.*\\.vercel\\.app
```

## Limitaciones actuales del MVP

- Finance es el unico modulo operativo real; los demas siguen como previews del roadmap,
- los pagos reales estan conectados a Monad testnet, no mainnet,
- el contrato de pagos usa tesoreria del contrato.
