# PDR: MVP de Pagos a Proveedores con Descuento

## Objetivo

Permitir que el agente identifique facturas de proveedor con descuento por pronto pago, valide liquidez y ejecute el pago en Monad cuando la politica lo permita.

## Disparador

Usuario tesorero activa la regla: pagar proveedores estrategicos cuando el descuento sea mayor a `1.5%`.

## Entradas requeridas

- facturas de proveedor pendientes
- terminos de pago
- porcentaje de descuento
- fecha limite de descuento
- lista de proveedores estrategicos
- saldo disponible
- pronostico de entradas futuras
- politica de aprobacion

## Flujo de ejecucion

1. Detectar facturas elegibles por proveedor, fecha y descuento.
2. Calcular ahorro absoluto y relativo.
3. Evaluar flujo de caja disponible y proyectado.
4. Aplicar politica:
   - si cumple descuento y liquidez, continuar;
   - si hay riesgo de caja, detener o requerir aprobacion.
5. Construir `payment_intent`.
6. Ejecutar pago via contrato inteligente en Monad.
7. Registrar `tx_hash`, monto final pagado y ahorro logrado.
8. Marcar factura como completada o pendiente de revision.

## Skills esperadas

- `supplier-discount-policy.md`
- `supplier-cash-check.md`
- `supplier-payment-execution.md`

## Salida requerida

- decision por factura: pagar, esperar, escalar
- justificacion financiera
- monto original
- descuento aplicado
- monto final pagado
- saldo resultante
- referencia onchain

## Politicas

- Nunca ejecutar pago si la politica exige aprobacion y no existe aprobacion valida.
- El agente debe optimizar descuento sin comprometer obligaciones cercanas.
- La salida al usuario debe mostrar ahorro y saldo, no detalles tecnicos de wallet.

## Requisitos Monad

- `chainId = 10143`
- registrar `tx_hash`
- exponer enlace al explorer solo para auditoria o demo interna
- el contrato debe abstraer la liberacion de fondos de la cuenta empresa

## Casos borde

- descuento expira durante la corrida
- saldo disponible alto pero flujo proyectado insuficiente
- factura duplicada
- proveedor fuera de la lista estrategica
- fallo onchain o transaccion pendiente

## Criterios de aceptacion

- El agente solo paga cuando la politica y la liquidez lo permiten.
- Toda ejecucion queda auditada.
- La UI recibe una narrativa financiera entendible y el estado final de la factura.

