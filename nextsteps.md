# AgentSuite — Next Steps Execution Plan

## Objetivo de esta etapa

La siguiente etapa no es "terminar todo el MVP", sino llevar AgentSuite a una version mucho mas cercana al MVP con una base solida de producto.

La apuesta correcta es:

- **Finance** como primer modulo real, persistente y operable.
- **Procurement, Inventory, Sales, Operations, HR, Projects y Analytics** como **preview visual** para comunicar el rumbo del Agentic ERP.

El objetivo no es abrir mas procesos todavia, sino volver durable y demostrable el modulo que ya existe.

---

## North star

AgentSuite debe presentarse como **The Agentic ERP**:

- agentes que ejecutan procesos operativos,
- humanos que revisan, aprueban y gobiernan excepciones,
- workflows auditables,
- base lista para crecer a multiples modulos.

En esta fase, el producto debe evolucionar de **demo funcional** a **Finance MVP candidate**.

---

## Estado actual

### Ya existe

- **Console** en React + Vite + Tailwind.
- **Agent Core** en Python + FastAPI + LangGraph.
- **Payments Gateway** en Node + Express.
- 3 procesos activos en Finance:
  - bank reconciliation,
  - supplier payments,
  - budget control.
- UI con otros modulos en estado visual de "Coming Soon".

### Gaps principales

- no hay persistencia real,
- los runs y audit logs viven en memoria,
- los inputs demo no estan modelados como datos durables,
- no hay auth ni roles reales,
- no hay base de despliegue endurecida,
- la experiencia sigue muy orientada a demo y no a operacion continua.

---

## Resultado esperado al cierre de esta etapa

AgentSuite debe quedar con:

1. **Finance persistente** con los mismos procesos actuales.
2. **Historial durable** de runs, auditoria e inputs.
3. **Capacidad para inputs medianos y bases de datos medianas**.
4. **Acceso controlado** para usuarios y roles basicos.
5. **Base de despliegue y operacion** suficiente para demos serias y primeros pilotos.
6. **Resto de modulos visibles como roadmap de producto**, no como funcionalidad ya operativa.

---

## Decisiones de arquitectura y producto

Estas decisiones quedan fijadas para arrancar con una base profesional y evitar dispersion:

| Area | Decision |
| --- | --- |
| **Modulo operativo** | **Finance** sera el unico modulo operativo real en esta etapa. |
| **Modulos restantes** | Procurement, Inventory, Sales, Operations, HR, Projects y Analytics quedan como **Preview / Coming Soon**. |
| **Tenancy** | **Single-workspace por deploy** al inicio, pero con `company_id` en todas las tablas para quedar listo para multi-tenant despues. |
| **Base de datos** | **PostgreSQL** como base principal. |
| **ORM y migraciones** | **SQLAlchemy 2 + Alembic**. |
| **Backend** | Mantener **FastAPI** como core monolitico de producto. |
| **Ejecucion** | Runs persistentes con estados `queued`, `running`, `completed`, `requires_review`, `blocked`, `failed`. |
| **Workers** | Worker durable apoyado en PostgreSQL antes de introducir Redis/Celery. |
| **Auth** | **Invite-only auth** sin registro publico. |
| **Sesion** | **HttpOnly cookies** con refresh flow; no tokens en `localStorage`. |
| **Passwords** | **Argon2** para hashing. |
| **Roles iniciales** | `finance_admin`, `accountant`, `treasurer`, `viewer`. |
| **LLM** | Uso solo como fallback y desambiguacion; la logica principal sigue siendo deterministica. |
| **API** | Introducir versionado tipo **`/api/v1`** antes de endurecer integraciones externas. |
| **Observabilidad** | Logs estructurados con `request_id`, `run_id` y trazabilidad por etapa. |
| **Infra** | **Docker Compose** para entorno de desarrollo y pilotos; no Kubernetes. |
| **CI** | GitHub Actions con lint, tests y build desde la primera fase de endurecimiento. |

---

## Roadmap de ejecucion

### Fase 1: Persistencia base

**Objetivo:** sacar el nucleo del estado en memoria.

**Entregables:**

- PostgreSQL como base principal.
- SQLAlchemy 2 + Alembic para modelo y migraciones.
- Reemplazo de `InMemoryRunRepository`.
- Persistencia de:
  - runs,
  - audit events,
  - companies/workspaces,
  - users.
- Configuracion por entorno para desarrollo y despliegue.
- Introduccion de rutas versionadas para el backend (`/api/v1`).

**Criterio de salida:** reiniciar el backend ya no borra historial ni resultados.

### Fase 2: Modelo persistente de Finance

**Objetivo:** que los procesos actuales operen sobre datos durables, no solo payloads efimeros.

**Entregables:**

- Tablas para entidades base del modulo:
  - bank transactions,
  - sales invoices,
  - expense records,
  - supplier invoices,
  - budget limits,
  - budget expenses.
- Tablas para resultados de procesos:
  - reconciliation matches,
  - reconciliation review items,
  - payment decisions,
  - payment executions.
- Relacion de todo con `company_id` y `source_run_id`.
- Retencion de inputs y outputs por corrida.

**Criterio de salida:** cada corrida deja trazabilidad completa de datos de entrada, decisiones y resultado.

### Fase 3: Ejecucion durable y soporte para volumen mediano

**Objetivo:** que Finance soporte datasets mas grandes sin depender de una corrida totalmente efimera.

**Entregables:**

- Estados persistentes de run:
  - `queued`,
  - `running`,
  - `completed`,
  - `requires_review`,
  - `blocked`,
  - `failed`.
- Worker durable apoyado en PostgreSQL cuando la corrida no deba vivir dentro del request.
- Idempotencia basica para reintentos.
- Batch inserts y procesamiento por chunks.
- Indices para consultas frecuentes.
- Paginacion y filtros para historial y resultados.
- Uso de LLM solo en casos ambiguos o de fallback.

**Criterio de salida:** el modulo puede procesar inputs medianos y conservar tiempos razonables de respuesta y consulta.

### Fase 4: Access, roles y workspace real

**Objetivo:** que el modulo se use como producto y no solo como demo abierta.

**Entregables:**

- Auth invite-only funcional.
- Workspace/company real por deploy como paso inicial.
- Roles basicos con enforcement real:
  - `finance_admin`,
  - `accountant`,
  - `treasurer`,
  - `viewer`.
- Sesiones con cookies HttpOnly y refresh flow.
- Password hashing con Argon2.
- Proteccion de endpoints y guards en frontend.
- `company_id` deja de ser decorativo.

**Criterio de salida:** usuarios distintos ven y ejecutan solo lo que su rol permite.

### Fase 5: Finance UX hardening

**Objetivo:** volver operable el modulo vivo con mejor experiencia de uso.

**Entregables:**

- Inputs reales desde UI en lugar de solo payloads demo.
- Historial persistente con filtros.
- Vista de detalle de run con auditoria util.
- Flujos mas claros de evaluate, simulate y execute.
- Mejor manejo de errores, vacios y estados intermedios.
- Presentacion de resultados lista para demo comercial y review operativa.

**Criterio de salida:** Finance ya se percibe como modulo usable, no solo como showcase tecnico.

### Fase 6: Deployment readiness

**Objetivo:** dejar una base seria de operacion.

**Entregables:**

- Docker Compose o packaging equivalente para servicios + DB.
- CI basica para lint, tests y build.
- Health checks reales.
- Logging estructurado con `request_id` y `run_id`.
- Manejo de secrets y variables por entorno.
- Seed/demo workspace para demos controladas.

**Criterio de salida:** el producto se puede levantar, validar y demostrar sin depender de pasos manuales fragiles.

---

## Lo que se mantiene como preview

Los demas modulos deben permanecer visibles en la UI para comunicar la direccion de AgentSuite, pero tratados explicitamente como:

- **Coming Soon**
- **Preview**
- **Future workflows**

No deben competir con el foco de ejecucion de esta etapa, que es **cerrar Finance como primer modulo real**.

---

## Principios de ejecucion

1. **Persistencia antes que expansion funcional**
   - primero endurecer Finance,
   - despues abrir mas capacidades.

2. **Un modulo real vale mas que varios mockups operativos a medias**
   - Finance debe convertirse en referencia de calidad del producto.

3. **Cada decision debe acercar al ERP a una operacion profesional**
   - seguridad,
   - trazabilidad,
   - durabilidad,
   - performance razonable para volumen mediano.

---

## Orden exacto recomendado

```text
1. PostgreSQL + migraciones
2. Persistencia de runs, audit logs, users y companies
3. Modelo persistente de datos de Finance
4. Ejecucion durable + estados de run + performance basica
5. Auth invite-only + workspace + roles
6. UX operativa de Finance
7. CI + containers + observabilidad + seed demo
```

---

## Regla de enfoque

Si una tarea no ayuda a que **Finance sea persistente, durable, auditable y demostrable**, no debe estar en el centro de esta etapa.

El objetivo es simple:

**convertir AgentSuite de una demo funcional a un Finance module listo para pilotear dentro de la narrativa de The Agentic ERP.**
