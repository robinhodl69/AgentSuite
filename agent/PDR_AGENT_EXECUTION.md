# PDR: Ejecucion del Agente AgentSuite

## Objetivo

Definir como debe ejecutarse el agente MVP de AgentSuite en backend para operar tres procesos financieros empresariales:

1. conciliacion inteligente de extractos bancarios,
2. pagos optimizados a proveedores,
3. control autonomo de gastos vs. presupuesto.

La UX debe permanecer estilo fintech/ERP tradicional: el usuario ve decisiones, resultados, alertas y estados; nunca wallets, gas ni detalles cripto.

## Decision de IA

- **Proveedor LLM:** OpenAI
- **Motivo:** rapidez de integracion, buen soporte con LangGraph y disponibilidad inmediata via creditos del proyecto.
- **Politica:** el proveedor debe estar abstraido detras de un cliente interno para permitir cambio futuro sin rehacer nodos del grafo.

## Variables de entorno requeridas

- `OPENAI_API_KEY`
- `OPENAI_MODEL_FAST`
- `OPENAI_MODEL_REASONING`
- `OPENAI_TEMPERATURE`
- `MONAD_CHAIN_ID=10143`
- `MONAD_RPC_URL=https://testnet-rpc.monad.xyz`
- `MONAD_EXPLORER_URL=https://testnet.monadexplorer.com`
- `MONAD_DEPLOYER_PRIVATE_KEY`

## Alcance MVP

Incluye:

- ingestar CSVs financieros,
- normalizar y validar datos,
- ejecutar reglas y razonamiento asistido por LLM,
- producir resultados auditables,
- disparar pagos onchain para el flujo de proveedores,
- devolver salidas listas para panel financiero.

No incluye:

- integraciones ERP complejas,
- login/SSO,
- multiempresa,
- entrenamiento de modelos,
- autonomia irrestricta sin politicas ni aprobaciones.

## Arquitectura de ejecucion

## 1. Entrada

El frontend envia archivos, parametros y acciones a una API backend del agente. La API crea una corrida con:

- `run_id`
- `process_type`
- `actor_role`
- `input_payload`
- `execution_mode`
- `approval_policy`

## 2. Normalizacion

Antes de invocar el grafo, el backend transforma entradas a estructuras canonicas:

- transacciones bancarias,
- facturas de venta,
- facturas de proveedor,
- gastos,
- presupuestos,
- saldo y pronostico de caja.

## 3. Registro de skills

Las skills se cargan desde `agent/skills/*.md`. Cada skill debe declarar:

- `skill_id`
- `process`
- `purpose`
- `required_inputs`
- `decision_rules`
- `approval_requirements`
- `output_contract`
- `failure_modes`

Las skills no contienen secretos ni endpoints; solo politica operativa y criterios de decision.

## 4. Orquestacion LangGraph

El grafo MVP debe seguir esta secuencia logica:

1. `intake_node`: valida payload y contexto.
2. `normalize_node`: limpia datos y produce estructuras canonicas.
3. `skill_selection_node`: carga skills aplicables segun proceso.
4. `analysis_node`: aplica reglas deterministicas y usa OpenAI para clasificacion, matching o explicacion.
5. `policy_node`: decide si continua, alerta, requiere aprobacion o bloquea.
6. `action_node`: ejecuta cambios internos o pago en Monad.
7. `audit_node`: registra razonamiento resumido, evidencias y resultado.
8. `response_node`: construye salida para UI.

## 5. Persistencia minima requerida

Aunque sea MVP, cada corrida debe guardar:

- inputs originales,
- datos normalizados,
- skills usadas,
- decisiones tomadas,
- evidencias usadas,
- acciones ejecutadas,
- `tx_hash` si hubo operacion Monad,
- resumen final para usuario.

## Contrato de estado del grafo

Estado minimo compartido entre nodos:

- `run_id`
- `process_type`
- `company_id`
- `actor_role`
- `raw_inputs`
- `normalized_inputs`
- `selected_skills`
- `rule_results`
- `llm_findings`
- `policy_decisions`
- `actions`
- `audit_log`
- `final_output`

## Estrategia de OpenAI

Separar dos clases de llamadas:

- **modelo rapido:** extraccion, clasificacion, categorizacion y generacion de etiquetas,
- **modelo de razonamiento:** explicaciones, resolucion de ambiguedades y narrativa final.

Uso recomendado:

- no usar LLM para aritmetica critica si una regla deterministica basta,
- usar LLM solo donde aporta interpretacion de texto libre o empates ambiguos,
- registrar siempre el resultado de reglas antes del texto del modelo.

## API backend propuesta

- `POST /agent/runs/reconciliation`
- `POST /agent/runs/payments/evaluate`
- `POST /agent/runs/payments/approve`
- `POST /agent/runs/budgets`
- `GET /agent/runs/{run_id}`
- `GET /agent/runs/{run_id}/audit`

## Modelo de datos minimo

- `BankTransaction`
- `SalesInvoice`
- `SupplierInvoice`
- `ExpenseRecord`
- `BudgetLimit`
- `CashPosition`
- `CashForecast`
- `ReconciliationResult`
- `PaymentDecision`
- `BudgetAlert`
- `ApprovalRequest`
- `AuditEvent`

## Politicas transversales

- Ninguna accion monetaria se ejecuta sin dejar evidencia auditable.
- Los pagos deben respetar umbrales de riesgo y reglas de aprobacion.
- La UI recibe siempre salidas explicadas en lenguaje financiero, no tecnico.
- El agente debe preferir reglas deterministicas antes que inferencias libres.

## Skills que deben existir despues

- `reconciliation-match.md`
- `reconciliation-exceptions.md`
- `supplier-discount-policy.md`
- `supplier-cash-check.md`
- `supplier-payment-execution.md`
- `budget-categorization.md`
- `budget-threshold-policy.md`
- `budget-blocking-policy.md`

## Criterios de aceptacion

- Cada proceso corre como una corrida trazable.
- Cada salida incluye resumen ejecutivo y detalle estructurado.
- Los pagos generan referencia verificable en Monad.
- Las decisiones criticas pueden explicarse con reglas y evidencias.

