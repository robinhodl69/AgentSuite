# PDR: MVP de Conciliacion Inteligente

## Objetivo

Conciliar un extracto bancario empresarial en CSV contra ventas y gastos registrados para producir tres listas:

1. transacciones conciliadas,
2. movimientos bancarios sin contabilizacion,
3. registros contables sin movimiento bancario.

## Disparador

Usuario contador o administrador sube un CSV desde "Subir estado de cuenta".

## Entradas requeridas

- CSV del banco
- facturas de venta pendientes o cobradas
- gastos registrados en contabilidad
- configuracion de matching

## Campos minimos normalizados

Para cada transaccion bancaria:

- fecha
- monto
- descripcion
- referencia
- contraparte si existe

Para cada registro contable:

- tipo de documento
- fecha
- monto
- referencia
- RFC o identificador
- folio o numero de factura
- estado

## Flujo de ejecucion

1. Parsear CSV y validar columnas.
2. Normalizar fechas, signos, monedas y referencias.
3. Ejecutar matching deterministico por:
   - monto exacto o tolerancia `+-0.01`,
   - fecha `+-1 dia`,
   - referencia, RFC o numero de factura.
4. Si hay ambiguedad, usar LLM solo para interpretar texto libre de descripcion.
5. Clasificar resultados en:
   - conciliado,
   - banco sin libro,
   - libro sin banco,
   - requiere revision manual.
6. Generar resumen ejecutivo y detalle por excepcion.

## Skills esperadas

- `reconciliation-match.md`
- `reconciliation-exceptions.md`

## Salida requerida

- conteo total por bucket
- lista de conciliados con evidencia de matching
- lista de cargos o abonos no registrados
- lista de registros contables sin respaldo bancario
- resumen explicativo para UI

## Politicas

- No marcar como conciliado si hay doble match posible sin evidencia suficiente.
- Comisiones bancarias y cargos recurrentes pueden sugerirse, pero deben quedar etiquetados como pendientes de registro.
- Debe preservarse traza de por que un movimiento cayo en cada bucket.

## Casos borde

- multiples cargos con mismo monto el mismo dia
- reembolsos y contracargos
- depositos parciales
- CSV con columnas no estandar
- montos negativos invertidos por formato bancario

## Criterios de aceptacion

- El agente produce los tres buckets esperados.
- Cada match tiene razon visible.
- Las excepciones incluyen recomendacion accionable para el usuario.

