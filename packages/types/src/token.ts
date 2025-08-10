/**
 * @fileoverview Token Types - โครงสร้างข้อมูล Cryptocurrency Tokens
 * 
 * ไฟล์นี้กำหนด types สำหรับ:
 * - Token metadata: ข้อมูลพื้นฐานของ tokens (symbol, name, decimals)
 * - Price data: ราคาและข้อมูลตลาด
 * - Price history: ข้อมูลราคาย้อนหลัง
 * - Search results: ผลการค้นหา tokens
 * 
 * ใช้สำหรับแสดงข้อมูล tokens ใน baskets และการค้นหา
 */

import { z } from "zod";

/**
 * Schema สำหรับ Token ข้อมูลพื้นฐาน
 * รวมข้อมูลราคาและตลาด
 */
export const TokenSchema = z.object({
  address: z.string(),                         // Contract address ของ token
  symbol: z.string(),                          // สัญลักษณ์ เช่น "ETH", "USDC", "BTC"
  name: z.string(),                            // ชื่อเต็ม เช่น "Ethereum", "USD Coin"
  decimals: z.number(),                        // จำนวนทศนิยม (เช่น 18 สำหรับ ETH)
  logoUri: z.string().optional(),             // URL ของโลโก้ token
  price: z.string().optional(),               // ราคาปัจจุบัน (USD, เป็น string เพื่อ precision)
  priceChange24h: z.number().optional(),      // การเปลี่ยนแปลงราคา 24 ชั่วโมง (%)
  marketCap: z.string().optional(),           // Market capitalization
  volume24h: z.string().optional(),           // ปริมาณการซื้อขาย 24 ชั่วโมง
});

/**
 * Schema สำหรับข้อมูลราคาย้อนหลัง
 * ใช้สำหรับสร้างกราฟและวิเคราะห์ trend
 */
export const TokenPriceHistorySchema = z.object({
  tokenAddress: z.string(),                    // Contract address ของ token
  timestamp: z.date(),                         // เวลาที่บันทึกราคา
  price: z.string(),                           // ราคา ณ เวลานั้น
  volume: z.string().optional(),              // ปริมาณการซื้อขาย ณ เวลานั้น
});

/**
 * Schema สำหรับผลการค้นหา tokens
 * รวม pagination สำหรับการแสดงผลแบบแบ่งหน้า
 */
export const TokenSearchResultSchema = z.object({
  tokens: z.array(TokenSchema),                // รายการ tokens ที่พบ
  total: z.number(),                           // จำนวน tokens ทั้งหมดที่ตรงเงื่อนไข
  page: z.number(),                            // หน้าปัจจุบัน
  limit: z.number(),                           // จำนวนรายการต่อหน้า
});

// Type exports
export type Token = z.infer<typeof TokenSchema>;
export type TokenPriceHistory = z.infer<typeof TokenPriceHistorySchema>;
export type TokenSearchResult = z.infer<typeof TokenSearchResultSchema>;