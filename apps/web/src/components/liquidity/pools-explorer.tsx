/**
 * PoolsExplorer Component
 * หน้าสำหรับสำรวจและค้นหา Liquidity Pools บน Monad Testnet
 * ผู้ใช้สามารถ:
 * - ดู pools ทั้งหมดจากทุก DEX
 * - กรอง pools ตาม DEX protocol
 * - ค้นหา pools ตาม token addresses
 * - ดูข้อมูล reserves และสถิติต่างๆ
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '@basket-fi/ui';
import { useLiquidityPools, useFindPools, usePoolData } from '@/hooks/use-liquidity-pools';
import { MONAD_TESTNET_DEX_PROTOCOLS } from '@/lib/dex-protocols';
import { Search, ExternalLink, Droplets, TrendingUp } from 'lucide-react';

export function PoolsExplorer() {
  // State สำหรับเก็บค่าที่ผู้ใช้เลือก/กรอก
  const [selectedProtocol, setSelectedProtocol] = useState<string>(''); // DEX ที่เลือก
  const [searchTokenA, setSearchTokenA] = useState('');                 // Token A address
  const [searchTokenB, setSearchTokenB] = useState('');                 // Token B address

  // ใช้ hooks เพื่อดึงข้อมูล pools
  const { data: allPools, isLoading, error } = useLiquidityPools(selectedProtocol); // ดึง pools ทั้งหมด
  const { data: searchPools } = useFindPools(searchTokenA, searchTokenB);           // ค้นหา pools ตาม tokens

  // ตัดสินใจว่าจะแสดง pools ไหน: ถ้ามีผลการค้นหาให้แสดงผลการค้นหา ไม่งั้นแสดงทั้งหมด
  const pools = searchPools && searchPools.length > 0 ? searchPools : allPools || [];
  
  // ประมวลผลข้อมูล pools เพื่อคำนวณสถิติ
  const { totalTVL, topPools, totalPools } = usePoolData(pools);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="text-red-500 mb-2">⚠️ Error loading pools</div>
            <p className="text-sm text-muted-foreground">
              Make sure you're connected to Monad Testnet and the DEX contracts are deployed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Liquidity Pools Explorer</h2>
        <p className="text-muted-foreground">
          Discover and analyze liquidity pools on Monad Testnet
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pools</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPools}</div>
            <p className="text-xs text-muted-foreground">
              Across {MONAD_TESTNET_DEX_PROTOCOLS.filter(p => p.isActive).length} protocols
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total TVL</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalTVL.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Testnet liquidity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Protocols</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {MONAD_TESTNET_DEX_PROTOCOLS.filter(p => p.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              DEX protocols
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Protocol Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Protocol</label>
            <select
              value={selectedProtocol}
              onChange={(e) => setSelectedProtocol(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">All Protocols</option>
              {MONAD_TESTNET_DEX_PROTOCOLS.map((protocol) => (
                <option key={protocol.name} value={protocol.name}>
                  {protocol.name}
                </option>
              ))}
            </select>
          </div>

          {/* Token Search */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Token A Address</label>
              <Input
                placeholder="0x..."
                value={searchTokenA}
                onChange={(e) => setSearchTokenA(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Token B Address</label>
              <Input
                placeholder="0x..."
                value={searchTokenB}
                onChange={(e) => setSearchTokenB(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pools List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {searchPools && searchPools.length > 0 ? 'Search Results' : 'All Pools'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading pools...</p>
            </div>
          ) : pools.length === 0 ? (
            <div className="text-center py-8">
              <Droplets className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No pools found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTokenA || searchTokenB 
                  ? 'No pools found for the specified tokens'
                  : 'No liquidity pools available on Monad Testnet yet'
                }
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>To find pools, you need:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>DEX protocols deployed on Monad Testnet</li>
                  <li>Liquidity providers to create pools</li>
                  <li>Valid token contract addresses</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {pools.map((pool, index) => (
                <div key={`${pool.address}-${index}`} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {pool.token0.symbol}/{pool.token1.symbol}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {pool.protocol}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://testnet-explorer.monad.xyz/address/${pool.address}`, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Reserve {pool.token0.symbol}:</span>
                      <div className="font-mono">
                        {(Number(pool.reserve0) / Math.pow(10, pool.token0.decimals)).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reserve {pool.token1.symbol}:</span>
                      <div className="font-mono">
                        {(Number(pool.reserve1) / Math.pow(10, pool.token1.decimals)).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    Pool Address: {pool.address}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}