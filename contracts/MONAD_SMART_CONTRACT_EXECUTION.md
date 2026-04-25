# Monad Smart Contract Execution Guide

## Que hace el contrato del MVP

El contrato recomendado para el MVP es `SupplierPaymentExecutor`.

Su objetivo es ejecutar pagos aprobados por el backend del agente en Monad testnet y dejar evidencia onchain. El backend decide si una factura esta lista para pago; el contrato se encarga de custodiar fondos, evitar pagos duplicados y emitir eventos auditables.

## Responsabilidades del contrato

1. Recibir fondos para la tesoreria operativa del agente.
2. Ejecutar pagos a `beneficiary_address` cuando una factura ya fue aprobada.
3. Evitar doble pago de la misma factura usando un identificador unico como `invoice_id` o su hash.
4. Emitir eventos con `invoice_id`, beneficiario, monto, `run_id` y ejecutor.
5. Permitir consultar si una factura ya fue pagada.

## Arquitectura MVP

- **Backend del agente**: analiza facturas, caja y politicas; decide `ready_to_pay`.
- **Wallet del agente**: firma deploys y transacciones operativas.
- **Contrato `SupplierPaymentExecutor`**: ejecuta pagos y registra evidencia onchain.
- **Monad testnet**: red por defecto para deploy, pruebas y verificacion.

## Reglas Monad para este proyecto

- Usar **Monad testnet** por defecto.
- `chainId = 10143`
- RPC: `https://testnet-rpc.monad.xyz`
- Framework: **Foundry**
- EVM: **prague**
- Solidity: **0.8.28**
- Verificar contratos despues del deployment usando primero la API de verificacion.

## Wallet del agente

Si se genera una wallet nueva, debe persistirse inmediatamente.

### Crear wallet

```bash
cast wallet new
```

### Guardar credenciales

Opciones recomendadas:

1. Guardar en `~/.monad-wallet` con permisos `chmod 600`
2. Guardar en un `.env` no versionado del proyecto

Ejemplo de variables:

```bash
MONAD_DEPLOYER_PRIVATE_KEY=0x...
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
MONAD_CHAIN_ID=10143
```

### Fondear wallet en testnet

```bash
curl -X POST https://agents.devnads.com/v1/faucet \
  -H "Content-Type: application/json" \
  -d '{"chainId": 10143, "address": "0xYOUR_ADDRESS"}'
```

Si ese faucet falla, pedir al usuario que fondee desde el faucet oficial: `https://faucet.monad.xyz`.

## Instalacion de Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

## Estructura recomendada en `/contracts`

```text
contracts/
  foundry.toml
  src/
    SupplierPaymentExecutor.sol
  script/
    DeploySupplierPaymentExecutor.s.sol
  test/
    SupplierPaymentExecutor.t.sol
```

## Configuracion de Foundry

Crear `foundry.toml` con:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
evm_version = "prague"
solc_version = "0.8.28"
```

## Deployment workflow

Usar `forge script`, no `forge create`.

### Script de deploy base

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/SupplierPaymentExecutor.sol";

contract DeploySupplierPaymentExecutor is Script {
    function run() external {
        vm.startBroadcast();
        SupplierPaymentExecutor executor = new SupplierPaymentExecutor();
        console.log("SupplierPaymentExecutor deployed at:", address(executor));
        vm.stopBroadcast();
    }
}
```

### Deploy en Monad testnet

```bash
forge script script/DeploySupplierPaymentExecutor.s.sol:DeploySupplierPaymentExecutor \
  --rpc-url https://testnet-rpc.monad.xyz \
  --private-key $MONAD_DEPLOYER_PRIVATE_KEY \
  --broadcast
```

## Verificacion del contrato

Siempre intentar primero la API de verificacion.

### 1. Generar standard input

```bash
forge verify-contract <CONTRACT_ADDRESS> src/SupplierPaymentExecutor.sol:SupplierPaymentExecutor \
  --chain 10143 \
  --show-standard-json-input > /tmp/standard-input.json
```

### 2. Extraer metadata y version del compilador

```bash
cat out/SupplierPaymentExecutor.sol/SupplierPaymentExecutor.json | jq '.metadata' > /tmp/metadata.json
COMPILER_VERSION=$(jq -r '.metadata | fromjson | .compiler.version' out/SupplierPaymentExecutor.sol/SupplierPaymentExecutor.json)
```

### 3. Construir request de verificacion

```bash
STANDARD_INPUT=$(cat /tmp/standard-input.json)
FOUNDRY_METADATA=$(cat /tmp/metadata.json)

cat > /tmp/verify.json << EOF
{
  "chainId": 10143,
  "contractAddress": "<CONTRACT_ADDRESS>",
  "contractName": "src/SupplierPaymentExecutor.sol:SupplierPaymentExecutor",
  "compilerVersion": "v${COMPILER_VERSION}",
  "standardJsonInput": $STANDARD_INPUT,
  "foundryMetadata": $FOUNDRY_METADATA
}
EOF
```

### 4. Llamar API de verificacion

```bash
curl -X POST https://agents.devnads.com/v1/verify \
  -H "Content-Type: application/json" \
  -d @/tmp/verify.json
```

### Fallback manual

```bash
forge verify-contract <CONTRACT_ADDRESS> src/SupplierPaymentExecutor.sol:SupplierPaymentExecutor \
  --chain 10143 \
  --verifier sourcify \
  --verifier-url "https://sourcify-api-monad.blockvision.org/"
```

## Flujo operativo esperado del backend

1. El backend evalua facturas y decide cuales estan `ready_to_pay`.
2. El backend toma `invoice_id`, `beneficiary_address`, monto final y `run_id`.
3. La wallet del agente firma una transaccion hacia `SupplierPaymentExecutor`.
4. El contrato ejecuta el pago y emite el evento de auditoria.
5. El backend guarda `tx_hash`, `explorer_url` y estado final de la factura.

## Campos minimos que deberia recibir el contrato

- `invoiceId` o `invoiceHash`
- `beneficiary`
- `amount`
- `runId` o referencia de corrida

## Explorers utiles

- Socialscan: `https://monad-testnet.socialscan.io`
- MonadVision: `https://testnet.monadvision.com`
- Monadscan: `https://testnet.monadscan.com`

## Notas importantes

- No hardcodear la wallet en `vm.startBroadcast(...)`.
- No usar `forge create` como flujo principal.
- No subir private keys al repositorio.
- La wallet del agente puede servir para deploy y operacion en testnet durante el MVP.
- Para produccion convendra separar wallet de deploy y wallet operativa.
