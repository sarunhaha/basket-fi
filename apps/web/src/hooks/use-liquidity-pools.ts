/**
 * React Hooks สำหรับจัดการข้อมูล Liquidity Pools
 * ใช้ TanStack Query (React Query) สำหรับ data fetching และ caching
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { liquidityService } from '@/lib/liquidity-service';
import { LiquidityPool } from '@/lib/dex-protocols';

/**
 * Hook สำหรับดึงข้อมูล liquidity pools ทั้งหมด
 * @param protocolName ชื่อ DEX protocol (optional) - ถ้าไม่ระบุจะดึงจากทุก DEX
 * @returns Query result พร้อมข้อมูล pools, loading state, error state
 */
export function useLiquidityPools(protocolName?: string) {
  return useQuery({
    queryKey: ['liquidity-pools', protocolName], // Key สำหรับ cache
    queryFn: () => liquidityService.getAllPools(protocolName), // Function ที่จะเรียกเพื่อดึงข้อมูล
    staleTime: 30000,     // ข้อมูลจะ "เก่า" หลังจาก 30 วินาที
    refetchInterval: 60000, // Refetch ข้อมูลใหม่ทุก 1 นาที
  });
}

/**
 * Hook สำหรับค้นหา pools ที่มี 2 tokens ที่ระบุ
 * @param tokenA Address ของ token แรก (optional)
 * @param tokenB Address ของ token ที่สอง (optional)
 * @returns Query result พร้อมข้อมูล pools ที่พบ
 */
export function useFindPools(tokenA?: string, tokenB?: string) {
  return useQuery({
    queryKey: ['find-pools', tokenA, tokenB], // Key สำหรับ cache
    queryFn: () => {
      // ถ้าไม่มี token addresses ให้ return empty array
      if (!tokenA || !tokenB) return Promise.resolve([]);
      // เรียก service เพื่อหา pools
      return liquidityService.findLiquidityPools(tokenA, tokenB);
    },
    enabled: !!(tokenA && tokenB), // เรียก query เมื่อมี tokenA และ tokenB เท่านั้น
    staleTime: 30000, // Cache เป็นเวลา 30 วินาที
  });
}

/**
 * Hook สำหรับประมวลผลข้อมูล pools และคำนวณสถิติต่างๆ
 * @param pools Array ของ liquidity pools
 * @returns Object ที่มีสถิติต่างๆ เช่น TVL, top pools
 */
export function usePoolData(pools: LiquidityPool[]) {
  // คำนวณ TVL (Total Value Locked) ทั้งหมด
  const totalTVL = pools.reduce((sum, pool) => {
    // 📝 TODO: ต้องมี price oracle เพื่อคำนวณ USD value
    // ตอนนี้ return 0 ก่อน เพราะยังไม่มี price data
    return sum + 0;
  }, 0);

  // หา top 10 pools ที่มี liquidity มากที่สุด
  const topPools = pools
    .sort((a, b) => {
      // เรียงตาม liquidity (reserve0 + reserve1)
      // ใช้ BigInt เพราะตัวเลขใหญ่มาก
      const aLiquidity = BigInt(a.reserve0) + BigInt(a.reserve1);
      const bLiquidity = BigInt(b.reserve0) + BigInt(b.reserve1);
      return bLiquidity > aLiquidity ? 1 : -1; // เรียงจากมากไปน้อย
    })
    .slice(0, 10); // เอาแค่ 10 อันดับแรก

  return {
    totalTVL,              // TVL รวมทั้งหมด (ตอนนี้เป็น 0)
    topPools,              // Top 10 pools
    totalPools: pools.length, // จำนวน pools ทั้งหมด
  };
}