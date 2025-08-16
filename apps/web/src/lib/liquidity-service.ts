/**
 * ไฟล์นี้เป็น Service สำหรับติดต่อกับ Liquidity Pools บน blockchain
 * ใช้ viem library เพื่อเรียก smart contracts และดึงข้อมูล pools
 */

import { createPublicClient, http, getContract } from 'viem';
import { monadTestnet } from './chains';
import { MONAD_TESTNET_DEX_PROTOCOLS, LiquidityPool, TokenInfo } from './dex-protocols';

/**
 * ABI (Application Binary Interface) สำหรับ Uniswap V2 Factory Contract
 * ABI = คำอธิบายว่า contract มี functions อะไรบ้าง และรับ parameters อะไร
 * Factory = contract ที่ใช้สร้างและจัดการ liquidity pools
 */
const FACTORY_ABI = [
  {
    // Function: หา pool address จาก 2 token addresses
    inputs: [
      { name: 'tokenA', type: 'address' },  // Address ของ token แรก
      { name: 'tokenB', type: 'address' }   // Address ของ token ที่สอง
    ],
    name: 'getPair',                        // ชื่อ function
    outputs: [{ name: 'pair', type: 'address' }], // Return pool address
    stateMutability: 'view',                // Read-only function
    type: 'function'
  },
  {
    // Function: ดูจำนวน pools ทั้งหมดที่มี
    inputs: [],
    name: 'allPairsLength',
    outputs: [{ name: '', type: 'uint256' }], // Return จำนวน pools
    stateMutability: 'view',
    type: 'function'
  },
  {
    // Function: ดู pool address ตาม index
    inputs: [{ name: '', type: 'uint256' }], // Index ของ pool
    name: 'allPairs',
    outputs: [{ name: 'pair', type: 'address' }], // Return pool address
    stateMutability: 'view',
    type: 'function'
  }
] as const;

/**
 * ABI สำหรับ Uniswap V2 Pair Contract
 * Pair = liquidity pool ที่เก็บ 2 tokens สำหรับการแลกเปลี่ยน
 */
const PAIR_ABI = [
  {
    // Function: ดูจำนวน tokens ที่มีใน pool
    inputs: [],
    name: 'getReserves',
    outputs: [
      { name: 'reserve0', type: 'uint112' },      // จำนวน token0 ใน pool
      { name: 'reserve1', type: 'uint112' },      // จำนวน token1 ใน pool
      { name: 'blockTimestampLast', type: 'uint32' } // Timestamp ล่าสุดที่อัพเดท
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    // Function: ดู address ของ token แรกใน pool
    inputs: [],
    name: 'token0',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    // Function: ดู address ของ token ที่สองใน pool
    inputs: [],
    name: 'token1',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    // Function: ดูจำนวน LP tokens ทั้งหมดที่ออกให้
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

/**
 * ABI สำหรับ ERC20 Token Contract
 * ใช้ดูข้อมูลพื้นฐานของ token เช่น symbol, decimals, name
 */
const ERC20_ABI = [
  {
    // Function: ดูสัญลักษณ์ของ token เช่น "ETH", "USDC"
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    // Function: ดูจำนวนทศนิยมของ token เช่น 18 สำหรับ ETH
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    // Function: ดูชื่อเต็มของ token เช่น "Ethereum", "USD Coin"
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

/**
 * LiquidityService Class
 * ใช้สำหรับติดต่อกับ blockchain และดึงข้อมูล liquidity pools
 */
export class LiquidityService {
  private client; // Viem client สำหรับติดต่อ blockchain

  constructor() {
    // สร้าง client เพื่อติดต่อกับ Monad Testnet
    this.client = createPublicClient({
      chain: monadTestnet,        // ใช้ Monad Testnet
      transport: http()           // ใช้ HTTP transport
    });
  }

  /**
   * หา liquidity pools ที่มี 2 tokens ที่ระบุ
   * @param tokenA Address ของ token แรก
   * @param tokenB Address ของ token ที่สอง
   * @returns Array ของ pools ที่พบ
   */
  async findLiquidityPools(tokenA: string, tokenB: string): Promise<LiquidityPool[]> {
    const pools: LiquidityPool[] = []; // Array เก็บ pools ที่พบ

    // วนลูปผ่านทุก DEX protocols
    for (const protocol of MONAD_TESTNET_DEX_PROTOCOLS) {
      // ข้าม protocol ที่ไม่ active หรือไม่มี factory address
      if (!protocol.isActive || !protocol.factoryAddress) continue;

      try {
        // สร้าง contract instance สำหรับ factory
        const factory = getContract({
          address: protocol.factoryAddress as `0x${string}`,
          abi: FACTORY_ABI,
          client: this.client
        });

        // เรียก getPair function เพื่อหา pool address
        const pairAddress = await factory.read.getPair([
          tokenA as `0x${string}`,
          tokenB as `0x${string}`
        ]);

        // ถ้าพบ pool (address ไม่ใช่ zero address)
        if (pairAddress !== '0x0000000000000000000000000000000000000000') {
          // ดึงข้อมูลของ pool
          const poolData = await this.getPoolData(pairAddress, protocol.name);
          if (poolData) {
            pools.push(poolData); // เพิ่มเข้า array
          }
        }
      } catch (error) {
        // ถ้าเกิด error ให้ log warning แต่ไม่หยุดการทำงาน
        console.warn(`Failed to fetch pool from ${protocol.name}:`, error);
      }
    }

    return pools; // Return pools ที่พบทั้งหมด
  }

  /**
   * ดึงข้อมูลของ liquidity pool
   * @param pairAddress Address ของ pool contract
   * @param protocolName ชื่อ DEX protocol
   * @returns ข้อมูล pool หรือ null ถ้าเกิด error
   */
  private async getPoolData(pairAddress: string, protocolName: string): Promise<LiquidityPool | null> {
    try {
      const pair = getContract({
        address: pairAddress as `0x${string}`,
        abi: PAIR_ABI,
        client: this.client
      });

      const [reserves, token0Address, token1Address, totalSupply] = await Promise.all([
        pair.read.getReserves(),
        pair.read.token0(),
        pair.read.token1(),
        pair.read.totalSupply()
      ]);

      // ดึงข้อมูล token พร้อม error handling
      const [token0Data, token1Data] = await Promise.all([
        this.getTokenData(token0Address).catch(error => {
          console.warn(`Failed to get token0 data for ${token0Address}:`, error);
          // Return fallback data ถ้าดึงข้อมูล token ไม่ได้
          return {
            address: token0Address,
            symbol: 'UNKNOWN',
            decimals: 18,
            name: 'Unknown Token'
          };
        }),
        this.getTokenData(token1Address).catch(error => {
          console.warn(`Failed to get token1 data for ${token1Address}:`, error);
          return {
            address: token1Address,
            symbol: 'UNKNOWN',
            decimals: 18,
            name: 'Unknown Token'
          };
        })
      ]);

      return {
        address: pairAddress,
        token0: token0Data,
        token1: token1Data,
        reserve0: reserves[0].toString(),
        reserve1: reserves[1].toString(),
        totalSupply: totalSupply.toString(),
        fee: 30, // 0.3% default for Uniswap V2 style
        protocol: protocolName
      };
    } catch (error) {
      console.error(`Failed to get pool data for ${pairAddress}:`, error);
      return null;
    }
  }

  /**
   * ดึงข้อมูล ERC20 token พร้อมการ validate และ sanitize
   * @param tokenAddress Address ของ token ที่ต้องการดึงข้อมูล
   * @returns ข้อมูล token หรือ throw error ถ้าไม่ valid
   */
  async getTokenData(tokenAddress: string): Promise<TokenInfo> {
    // Validate และ sanitize token address
    const sanitizedAddress = this.validateAndSanitizeTokenAddress(tokenAddress);
    
    try {
      const token = getContract({
        address: sanitizedAddress,
        abi: ERC20_ABI,
        client: this.client
      });

      // ดึงข้อมูลพื้นฐานของ token
      const [symbol, decimals, name] = await Promise.all([
        token.read.symbol().catch(() => 'UNKNOWN'), // ถ้าไม่มี symbol ให้ใช้ UNKNOWN
        token.read.decimals().catch(() => 18),      // ถ้าไม่มี decimals ให้ใช้ 18 (default)
        // เพิ่ม name field สำหรับข้อมูลเพิ่มเติม
        this.getTokenName(token).catch(() => 'Unknown Token')
      ]);

      return {
        address: sanitizedAddress,
        symbol: symbol as string,
        decimals: decimals as number,
        name: name as string
      };
    } catch (error) {
      // Handle different types of errors
      if (error instanceof Error) {
        if (error.message.includes('execution reverted')) {
          throw new Error(`Token at address ${sanitizedAddress} is not a valid ERC20 token`);
        }
        if (error.message.includes('call exception')) {
          throw new Error(`Token at address ${sanitizedAddress} does not exist or is not accessible`);
        }
      }
      
      throw new Error(`Failed to retrieve token data for ${sanitizedAddress}: ${error}`);
    }
  }

  /**
   * Validate token address (public method)
   * @param address Token address ที่ต้องการ validate
   * @returns true ถ้า valid, false ถ้าไม่ valid
   */
  isValidTokenAddress(address: string): boolean {
    try {
      this.validateAndSanitizeTokenAddress(address);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate และ sanitize token address
   * @param address Token address ที่ต้องการ validate
   * @returns Sanitized address หรือ throw error ถ้าไม่ valid
   */
  private validateAndSanitizeTokenAddress(address: string): `0x${string}` {
    if (!address) {
      throw new Error('Token address is required');
    }

    // Remove whitespace และแปลงเป็น lowercase
    const sanitized = address.trim().toLowerCase();

    // ตรวจสอบว่าเป็น hex address format
    if (!/^0x[a-f0-9]{40}$/i.test(sanitized)) {
      throw new Error(`Invalid token address format: ${address}. Address must be a valid Ethereum address (0x followed by 40 hex characters)`);
    }

    // ตรวจสอบว่าไม่ใช่ zero address
    if (sanitized === '0x0000000000000000000000000000000000000000') {
      throw new Error('Token address cannot be the zero address');
    }

    return sanitized as `0x${string}`;
  }

  /**
   * ดึงข้อมูล tokens หลายตัวพร้อมกัน (batch processing)
   * @param tokenAddresses Array ของ token addresses
   * @returns Array ของ token data หรือ null ถ้า token ไม่ valid
   */
  async getBatchTokenData(tokenAddresses: string[]): Promise<(TokenInfo | null)[]> {
    const promises = tokenAddresses.map(async (address) => {
      try {
        return await this.getTokenData(address);
      } catch (error) {
        console.warn(`Failed to get token data for ${address}:`, error);
        return null;
      }
    });

    return Promise.all(promises);
  }

  /**
   * ดึงชื่อของ token (optional field)
   * @param tokenContract Contract instance ของ token
   * @returns ชื่อของ token หรือ undefined ถ้าไม่มี
   */
  private async getTokenName(tokenContract: any): Promise<string | undefined> {
    try {
      // บาง tokens อาจไม่มี name function
      return await tokenContract.read.name();
    } catch {
      // ถ้าไม่มี name function ให้ return undefined
      return undefined;
    }
  }

  // ดึง all pools จาก factory
  async getAllPools(protocolName?: string): Promise<LiquidityPool[]> {
    const pools: LiquidityPool[] = [];
    const protocols = protocolName 
      ? MONAD_TESTNET_DEX_PROTOCOLS.filter(p => p.name === protocolName)
      : MONAD_TESTNET_DEX_PROTOCOLS;

    for (const protocol of protocols) {
      if (!protocol.isActive || !protocol.factoryAddress) continue;

      try {
        const factory = getContract({
          address: protocol.factoryAddress as `0x${string}`,
          abi: FACTORY_ABI,
          client: this.client
        });

        const pairsLength = await factory.read.allPairsLength();
        const batchSize = 10; // ดึงทีละ 10 pairs

        for (let i = 0; i < Number(pairsLength); i += batchSize) {
          const batch = [];
          const end = Math.min(i + batchSize, Number(pairsLength));

          for (let j = i; j < end; j++) {
            batch.push(factory.read.allPairs([BigInt(j)]));
          }

          const pairAddresses = await Promise.all(batch);
          
          const poolDataPromises = pairAddresses.map(address => 
            this.getPoolData(address, protocol.name)
          );

          const poolsData = await Promise.all(poolDataPromises);
          pools.push(...poolsData.filter(Boolean) as LiquidityPool[]);
        }
      } catch (error) {
        console.warn(`Failed to fetch all pools from ${protocol.name}:`, error);
      }
    }

    return pools;
  }

  /**
   * คำนวณ price impact สำหรับการ swap
   * Compatible with ES5 - ใช้ string arithmetic
   * @param inputAmount จำนวน token ที่จะ swap (as string)
   * @param inputReserve reserve ของ input token (as string)
   * @param outputReserve reserve ของ output token (as string)
   * @returns price impact เป็น percentage
   */
  calculatePriceImpact(
    inputAmount: string,
    inputReserve: string,
    outputReserve: string
  ): number {
    try {
      // ใช้ JavaScript Number สำหรับการคำนวณ (อาจมีความแม่นยำน้อยกว่า BigInt)
      const inputAmountNum = parseFloat(inputAmount);
      const inputReserveNum = parseFloat(inputReserve);
      const outputReserveNum = parseFloat(outputReserve);

      // คำนวณ output amount ด้วย Uniswap V2 formula
      const inputAmountWithFee = inputAmountNum * 0.997; // 0.3% fee
      const numerator = inputAmountWithFee * outputReserveNum;
      const denominator = inputReserveNum + inputAmountWithFee;
      const outputAmount = numerator / denominator;

      // คำนวณ price without impact
      const priceWithoutImpact = (inputAmountNum * outputReserveNum) / inputReserveNum;
      
      // คำนวณ price impact
      const priceImpact = ((priceWithoutImpact - outputAmount) / priceWithoutImpact) * 100;

      return Math.max(0, priceImpact); // ไม่ให้เป็นค่าลบ
    } catch (error) {
      console.error('Error calculating price impact:', error);
      return 0;
    }
  }
}

// Singleton instance
export const liquidityService = new LiquidityService();