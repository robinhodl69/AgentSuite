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

Actualmente el historial vive en memoria del backend. Mientras el proceso siga corriendo, la UI puede consultar ejecuciones, auditoria y output. Si reinicias el backend, ese historial se pierde.

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

## Limitaciones actuales del MVP

- el historial no persiste entre reinicios,
- los pagos reales estan conectados a Monad testnet, no mainnet,
- el contrato de pagos usa tesoreria del contrato,
- la persistencia de runs y auditoria aun no usa base de datos.
