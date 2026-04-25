# AgentSuite

AgentSuite es un demo full-stack para operaciones financieras asistidas por agentes. El proyecto combina un backend con FastAPI y LangGraph, un contrato inteligente en Monad testnet para pagos de proveedor y un frontend React para operar procesos desde una consola tipo ERP.

## Estructura del proyecto

| Carpeta | Propósito |
| --- | --- |
| `agent/` | Backend del agente financiero. Ejecuta conciliación bancaria, pagos a proveedores y control presupuestal. |
| `contracts/` | Workspace Foundry para el contrato `SupplierPaymentExecutor` en Monad testnet. |
| `frontend/` | Interfaz React/Vite para disparar procesos, ver output, auditoría e historial. |

## Qué hace hoy

### 1. Conciliación bancaria

- recibe un CSV de movimientos,
- cruza contra ventas y gastos,
- devuelve coincidencias, faltantes y casos que requieren revisión.

### 2. Pagos a proveedores

- evalúa descuento por pronto pago,
- aplica políticas de caja y aprobación,
- puede **evaluar**, **simular** o **ejecutar** el pago,
- en `execute`, envía una transacción real en **Monad testnet** a través de `SupplierPaymentExecutor`.

### 3. Control presupuestal

- revisa gastos contra presupuestos mensuales,
- categoriza cuando hace falta,
- marca gastos como aprobados, alertados, pendientes o bloqueados.

## Cómo se conectan las partes

1. El usuario opera desde `frontend/`.
2. El frontend llama al backend en `agent/`.
3. El backend corre una workflow con etapas `intake -> normalize -> skill_selection -> analysis -> policy -> action -> response`.
4. Para pagos reales, el backend firma y envía una llamada al contrato desplegado en `contracts/`.
5. La UI muestra resumen, output estructurado, auditoría e historial de la sesión.

## Levantar el proyecto

### Backend del agente

```bash
cd agent
cp .env.example .env
# llena OPENAI_API_KEY y, para pagos reales, MONAD_DEPLOYER_PRIVATE_KEY

source .venv/bin/activate
pip install -e ".[dev]"
agentsuite-agent
```

Healthcheck:

```bash
curl http://localhost:8000/health
```

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

La consola financiera queda en:

- `http://localhost:5173/erp/finanzas`
- historial: `http://localhost:5173/erp/finanzas/historial`

## Demo con frontend en Vercel

La opcion mas simple para demo es mantener `agent/` corriendo en local y exponerlo con un tunel HTTPS.

Pasos:

1. levantar el backend local,
2. abrir un tunel como `ngrok http 8000`,
3. agregar el dominio del tunel y el dominio de Vercel a `AGENT_CORS_ORIGINS`,
4. configurar en Vercel `VITE_AGENT_API_URL=https://tu-tunel-publico`.

Ejemplo en `agent/.env`:

```env
AGENT_CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://tu-app.vercel.app,https://abc123.ngrok-free.app
```

### Contratos

```bash
cd contracts
forge build
forge test
```

## Variables sensibles

No subas secretos al repositorio. Estos archivos ya deben mantenerse locales:

- `agent/.env`
- `frontend/.env`
- `contracts/.env`

## Estado actual del MVP

- los 3 procesos ya se pueden ejecutar desde el frontend,
- pagos reales funcionan en Monad testnet,
- el output incluye `tx_hash` y link al explorer,
- el historial funciona mientras el backend siga corriendo,
- la persistencia de corridas todavía es en memoria.
