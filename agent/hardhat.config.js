require('@nomicfoundation/hardhat-toolbox')
require('dotenv').config()

const MONAD_RPC_URL = process.env.MONAD_RPC_URL ?? 'https://testnet-rpc.monad.xyz'
const MONAD_CHAIN_ID = Number(process.env.MONAD_CHAIN_ID ?? '10143')
const MONAD_DEPLOYER_PRIVATE_KEY = process.env.MONAD_DEPLOYER_PRIVATE_KEY

/** @type {import('hardhat/config').HardhatUserConfig} */
module.exports = {
  solidity: {
    version: '0.8.28',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    monadTestnet: {
      url: MONAD_RPC_URL,
      chainId: MONAD_CHAIN_ID,
      accounts: MONAD_DEPLOYER_PRIVATE_KEY ? [MONAD_DEPLOYER_PRIVATE_KEY] : [],
    },
  },
}
