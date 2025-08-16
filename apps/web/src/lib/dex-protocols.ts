/**
 * ไฟล์นี้เก็บข้อมูลเกี่ยวกับ DEX (Decentralized Exchange) และ Liquidity Pools
 * บน Monad Testnet สำหรับการซื้อขายและแลกเปลี่ยน tokens
 */

/**
 * Interface สำหรับข้อมูล DEX Protocol
 * DEX = Decentralized Exchange (ตลาดแลกเปลี่ยนแบบกระจายอำนาจ)
 */
export interface DEXProtocol {
  name: string;                    // ชื่อของ DEX เช่น "Uniswap", "SushiSwap"
  website: string;                 // เว็บไซต์หลักของ DEX
  factoryAddress?: string;         // Contract address ของ Factory (สร้าง liquidity pools)
  routerAddress?: string;          // Contract address ของ Router (ทำการ swap tokens)
  subgraphUrl?: string;           // URL สำหรับดึงข้อมูลจาก The Graph (optional)
  apiUrl?: string;                // API endpoint สำหรับดึงข้อมูล (optional)
  isActive: boolean;              // สถานะว่า DEX นี้ใช้งานได้หรือไม่
}

/**
 * Interface สำหรับข้อมูล Liquidity Pool
 * Liquidity Pool = กองเงินที่ใช้สำหรับการแลกเปลี่ยน tokens
 */
/**
 * Interface สำหรับข้อมูล Token
 */
export interface TokenInfo {
  address: string;              // Contract address ของ token
  symbol: string;               // สัญลักษณ์ เช่น "ETH", "USDC"
  decimals: number;             // จำนวนทศนิยม เช่น 18 สำหรับ ETH
  name: string;                 // ชื่อเต็มของ token เช่น "Ethereum", "USD Coin"
}

/**
 * Interface สำหรับข้อมูล Liquidity Pool
 * Liquidity Pool = กองเงินที่ใช้สำหรับการแลกเปลี่ยน tokens
 */
export interface LiquidityPool {
  address: string;                // Contract address ของ pool
  token0: TokenInfo;              // Token แรกใน pool
  token1: TokenInfo;              // Token ที่สองใน pool
  reserve0: string;               // จำนวน token0 ที่มีใน pool (เป็น string เพราะเป็นเลขใหญ่)
  reserve1: string;               // จำนวน token1 ที่มีใน pool
  totalSupply: string;            // จำนวน LP tokens ทั้งหมดที่ออกให้
  fee: number;                    // ค่าธรรมเนียมใน basis points (30 = 0.3%)
  protocol: string;               // ชื่อ DEX ที่ pool นี้อยู่
}

/**
 * รายการ DEX Protocols ที่มีบน Monad Testnet
 * ⚠️ หมายเหตุ: Contract addresses เหล่านี้เป็นตัวอย่าง ต้องหาจริงจาก Monad community
 */
export const MONAD_TESTNET_DEX_PROTOCOLS: DEXProtocol[] = [
  {
    name: 'MonadSwap',                    // DEX หลักของ Monad (สมมติ)
    website: 'https://monadswap.xyz',
    factoryAddress: '0x...',             // ⚠️ ต้องหา address จริงจาก Monad docs
    routerAddress: '0x...',              // ⚠️ ต้องหา address จริงจาก Monad docs
    isActive: true,                      // เปิดใช้งาน
  },
  {
    name: 'Uniswap V2 Fork',             // DEX ที่ copy มาจาก Uniswap V2
    website: 'https://testnet-dex.monad.xyz',
    factoryAddress: '0x...',             // ⚠️ ตัวอย่าง - ต้องหา address จริง
    routerAddress: '0x...',              // ⚠️ ตัวอย่าง - ต้องหา address จริง
    isActive: true,
  },
  // 📝 TODO: เพิ่ม DEX อื่นๆ ตามที่มีบน Monad Testnet
  // เช่น SushiSwap fork, PancakeSwap fork, etc.
];

/**
 * Token addresses ที่ใช้บ่อยบน Monad Testnet
 * ⚠️ หมายเหตุ: เป็นตัวอย่าง ต้องหา addresses จริงจาก Monad testnet
 */
export const MONAD_TESTNET_TOKENS = {
  WMON: '0x...',  // Wrapped MON (MON ที่ wrap เป็น ERC-20 token)
  USDC: '0x...',  // USD Coin testnet version
  USDT: '0x...',  // Tether testnet version  
  WETH: '0x...',  // Wrapped Ethereum testnet version
  DAI: '0x...',   // DAI stablecoin testnet version
} as const;

/**
 * คู่การซื้อขายที่นิยม (Trading Pairs)
 * แต่ละคู่จะมี liquidity pool สำหรับแลกเปลี่ยนกัน
 */
export const POPULAR_PAIRS = [
  ['WMON', 'USDC'],  // MON กับ USDC (คู่หลัก)
  ['WMON', 'USDT'],  // MON กับ USDT
  ['WMON', 'WETH'],  // MON กับ ETH
  ['USDC', 'USDT'],  // Stablecoin pair
  ['WETH', 'USDC'],  // ETH กับ USDC
] as const;