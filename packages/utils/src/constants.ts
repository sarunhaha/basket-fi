/**
 * @fileoverview Constants - ค่าคงที่ที่ใช้ทั่วทั้งแอป
 * 
 * ไฟล์นี้รวมค่าคงที่สำหรับ:
 * - Supported blockchains: เครือข่าย blockchain ที่รองรับ
 * - Default tokens: Token addresses ที่ใช้บ่อย
 * - API endpoints: URLs ของ external APIs
 * - Rebalance thresholds: เกณฑ์สำหรับการ rebalance
 * - Supported languages/currencies: ภาษาและสกุลเงินที่รองรับ
 * 
 * ใช้ 'as const' เพื่อให้ TypeScript infer เป็น literal types
 */

/**
 * Blockchain networks ที่ Basket.fi รองรับ
 * รวม RPC URLs และ block explorers
 */
export const SUPPORTED_CHAINS = {
  MONAD_TESTNET: {
    id: 41454,                                        // Chain ID สำหรับ Monad Testnet
    name: "Monad Testnet",                           // ชื่อที่แสดงใน UI
    rpcUrl: "https://testnet-rpc.monad.xyz",         // RPC endpoint
    blockExplorer: "https://testnet-explorer.monad.xyz", // Block explorer URL
  },
  ETHEREUM_SEPOLIA: {
    id: 11155111,                                    // Chain ID สำหรับ Ethereum Sepolia
    name: "Ethereum Sepolia",                        // ชื่อที่แสดงใน UI
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY", // RPC endpoint (ต้องใส่ Infura key)
    blockExplorer: "https://sepolia.etherscan.io",   // Block explorer URL
  },
} as const;

/**
 * Token addresses ที่ใช้บ่อยๆ
 * ⚠️ หมายเหตุ: ต้องอัพเดทด้วย addresses จริงเมื่อ deploy
 */
export const DEFAULT_TOKENS = {
  WETH: "0x...", // Wrapped Ethereum - จะอัพเดทด้วย address จริง
  USDC: "0x...", // USD Coin - จะอัพเดทด้วย address จริง
  USDT: "0x...", // Tether USD - จะอัพเดทด้วย address จริง
} as const;

/**
 * External API endpoints ที่ใช้ดึงข้อมูลราคาและตลาด
 */
export const API_ENDPOINTS = {
  COINGECKO: "https://api.coingecko.com/api/v3",     // สำหรับข้อมูลราคา token
  DEFILLAMA: "https://api.llama.fi",                 // สำหรับข้อมูล DeFi protocols
} as const;

/**
 * เกณฑ์สำหรับการแจ้งเตือน rebalancing
 * เมื่อสัดส่วน token เบี่ยงเบนจากเป้าหมายเกินกว่านี้
 */
export const REBALANCE_THRESHOLDS = {
  MINOR: 5,      // 5% deviation - แจ้งเตือนเบาๆ
  MAJOR: 10,     // 10% deviation - แจ้งเตือนปานกลาง
  CRITICAL: 20,  // 20% deviation - แจ้งเตือนเร่งด่วน
} as const;

/**
 * ภาษาที่รองรับในแอป
 */
export const SUPPORTED_LANGUAGES = ["en", "th"] as const;

/**
 * สกุลเงินที่รองรับในแอป
 */
export const SUPPORTED_CURRENCIES = ["USD", "THB"] as const;