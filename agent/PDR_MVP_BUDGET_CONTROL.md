# PDR: MVP de Control Autonomo de Gastos vs. Presupuesto

## Objetivo

Monitorear gastos operacionales contra presupuesto mensual por categoria, alertar riesgo de sobrepaso y bloquear o escalar gastos cuando se crucen umbrales criticos.

## Disparadores

- alta o carga de presupuesto mensual,
- ingreso de un gasto nuevo,
- reevaluacion programada del acumulado mensual.

## Entradas requeridas

- presupuesto por categoria
- gasto nuevo o lote de gastos
- reglas de categorizacion
- umbrales de alerta y bloqueo
- historico del mes

## Flujo de ejecucion

1. Ingestar presupuesto desde formulario o CSV.
2. Normalizar categorias financieras.
3. Categorizar gasto nuevo con reglas simples primero y LLM solo si hay texto ambiguo.
4. Actualizar acumulado mensual por categoria.
5. Calcular porcentaje usado.
6. Proyectar cierre de mes segun ritmo actual.
7. Aplicar politica:
   - informar,
   - alertar,
   - solicitar aprobacion,
   - bloquear.
8. Registrar evento para historial y panel.

## Skills esperadas

- `budget-categorization.md`
- `budget-threshold-policy.md`
- `budget-blocking-policy.md`

## Salida requerida

- categoria afectada
- monto del gasto
- acumulado actual
- presupuesto total
- porcentaje usado
- proyeccion fin de mes
- estado: aprobado, alertado, bloqueado, pendiente de aprobacion
- mensaje corto para panel financiero

## Politicas

- Reglas simples tienen prioridad sobre inferencia del LLM.
- A partir del 100% del presupuesto se bloquea o escala segun configuracion.
- Entre 90% y 99% se emite alerta preventiva con proyeccion.
- El historial debe explicar por que un gasto fue aprobado o detenido.

## Casos borde

- categorias inexistentes o mal escritas
- gastos con descripcion ambigua
- presupuestos cargados a mitad de mes
- ajustes manuales posteriores
- reembolsos negativos

## Criterios de aceptacion

- El acumulado y porcentaje usado son consistentes.
- La proyeccion de cierre es visible para el usuario.
- Las alertas y bloqueos quedan auditados por categoria y fecha.

