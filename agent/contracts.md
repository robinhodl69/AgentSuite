# Contracts

## Estado actual

- **Network:** Monad testnet
- **Chain ID:** `10143`
- **RPC URL:** `https://testnet-rpc.monad.xyz`
- **Contrato activo:** `SupplierPaymentExecutor`
- **Contract address:** `0x260d0957B70B1dAcD534AcB23A6893396F2e06e3`
- **Owner onchain:** `0x4ead8C47Aa0B3Ff749BB78AdC6bCe9f303694407`
- **Deploy tx:** `0xc4e8c8edb8d0fa65852cf83f527f5c7cd5e9e565c0a6619665f502cbb78d648b`
- **Deploy block:** `27753714`
- **Treasury balance del contrato:** `1 MON`
- **Treasury funding tx:** `0x97eb3a62d771675f8c3fe48d7022f406d715e64fb758f1a02111ccc9f944eca1`

## Wallet del agente

- **Address:** `0x4ead8C47Aa0B3Ff749BB78AdC6bCe9f303694407`
- **Balance actual aprox.:** `0.747734701602060991 MON`
- **Secretos persistidos en:**
  - `~/.monad-wallet`
  - `contracts/.env`
- **Nota:** la private key existe solo en esos archivos locales con permisos `600`. No replicarla en archivos versionados del repositorio.

## Codigo fuente relevante

- **Contrato:** `contracts/src/SupplierPaymentExecutor.sol`
- **Script de deploy:** `contracts/script/DeploySupplierPaymentExecutor.s.sol`
- **Tests:** `contracts/test/SupplierPaymentExecutor.t.sol`
- **Artefacto broadcast:** `contracts/broadcast/DeploySupplierPaymentExecutor.s.sol/10143/run-latest.json`

## Comandos utiles

### Compilar

```bash
cd contracts
forge build
```

### Tests

```bash
cd contracts
forge test
```

### Deploy

```bash
cd contracts
set -a
. ./.env
set +a
forge script script/DeploySupplierPaymentExecutor.s.sol:DeploySupplierPaymentExecutor \
  --rpc-url "$MONAD_RPC_URL" \
  --private-key "$MONAD_DEPLOYER_PRIVATE_KEY" \
  --broadcast
```

### Verificacion por API

```bash
cd contracts
forge verify-contract 0x260d0957B70B1dAcD534AcB23A6893396F2e06e3 \
  src/SupplierPaymentExecutor.sol:SupplierPaymentExecutor \
  --chain 10143 \
  --show-standard-json-input > /tmp/standard-input.json
```

### Verificacion fallback

```bash
cd contracts
forge verify-contract 0x260d0957B70B1dAcD534AcB23A6893396F2e06e3 \
  src/SupplierPaymentExecutor.sol:SupplierPaymentExecutor \
  --chain 10143 \
  --verifier sourcify \
  --verifier-url "https://sourcify-api-monad.blockvision.org/"
```

## Explorers

- **Socialscan:** `https://monad-testnet.socialscan.io/address/0x260d0957B70B1dAcD534AcB23A6893396F2e06e3`
- **Monadscan:** `https://testnet.monadscan.com/address/0x260d0957B70B1dAcD534AcB23A6893396F2e06e3`
- **MonadVision:** `https://testnet.monadvision.com/address/0x260d0957B70B1dAcD534AcB23A6893396F2e06e3`

## Estado de verificacion

- **Monad API:** verificado en Socialscan y Monadscan
- **Sourcify fallback:** verificado

## Siguiente integracion

El backend debe construir la llamada a `executePayment(invoiceId, beneficiary, amount, runId)` cuando una factura quede `ready_to_pay`, y luego guardar `tx_hash`, explorer URL y estado final de la factura.
