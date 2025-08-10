/**
 * ไฟล์นี้เป็น Service สำหรับติดต่อกับ Liquidity Pools บน blockchain
 * ใช้ viem library เพื่อเรียก smart contracts และดึงข้อมูล pools
 */

import { createPublicClient, http, getContract } from 'viem';
import { monadTestnet } from './chains';
import { MONAD_TESTNET_DEX_PROTOCOLS, LiquidityPool } from './dex-protocols';

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
 * ใช้ดูข้อมูลพื้นฐานของ token เช่น symbol, decimals
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

  // ดึงข้อมูล pool
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

      // ดึงข้อมูล token
      const [token0Data, token1Data] = await Promise.all([
        this.getTokenData(token0Address),
        this.getTokenData(token1Address)
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
      console.error('Failed to get pool data:', error);
      return null;
    }
  }

  // ดึงข้อมูล token
  private async getTokenData(tokenAddress: string) {
    const token = getContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      client: this.client
    });

    const [symbol, decimals] = await Promise.all([
      token.read.symbol(),
      token.read.decimals()
    ]);

    return {
      address: tokenAddress,
      symbol,
      decimals
    };
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

  // คำนวณ price impact
  calculatePriceImpact(
    inputAmount: bigint,
    inputReserve: bigint,
    outputReserve: bigint
  ): number {
    const inputAmountWithFee = inputAmount * 997n; // 0.3% fee
    const numerator = inputAmountWithFee * outputReserve;
    const denominator = inputReserve * 1000n + inputAmountWithFee;
    const outputAmount = numerator / denominator;

    const priceWithoutImpact = (inputAmount * outputReserve) / inputReserve;
    const priceImpact = Number(
      ((priceWithoutImpact - outputAmount) * 10000n) / priceWithoutImpact
    ) / 100;

    return priceImpact;
  }
}

// Singleton instance
export const liquidityService = new LiquidityService();