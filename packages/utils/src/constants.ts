export const SUPPORTED_CHAINS = {
  MONAD_TESTNET: {
    id: 41454,
    name: "Monad Testnet",
    rpcUrl: "https://testnet-rpc.monad.xyz",
    blockExplorer: "https://testnet-explorer.monad.xyz",
  },
  ETHEREUM_SEPOLIA: {
    id: 11155111,
    name: "Ethereum Sepolia",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    blockExplorer: "https://sepolia.etherscan.io",
  },
} as const;

export const DEFAULT_TOKENS = {
  WETH: "0x...", // Will be updated with actual addresses
  USDC: "0x...",
  USDT: "0x...",
} as const;

export const API_ENDPOINTS = {
  COINGECKO: "https://api.coingecko.com/api/v3",
  DEFILLAMA: "https://api.llama.fi",
} as const;

export const REBALANCE_THRESHOLDS = {
  MINOR: 5, // 5% deviation
  MAJOR: 10, // 10% deviation
  CRITICAL: 20, // 20% deviation
} as const;

export const SUPPORTED_LANGUAGES = ["en", "th"] as const;
export const SUPPORTED_CURRENCIES = ["USD", "THB"] as const;