/**
 * @fileoverview Basket Types - โครงสร้างข้อมูลสำหรับ Token Baskets
 * 
 * ไฟล์นี้กำหนด types และ validation schemas สำหรับ:
 * - Token Baskets: กลุ่มของ tokens ที่ผู้ใช้สร้างขึ้น
 * - Token Allocations: การกระจายเปอร์เซ็นต์ของแต่ละ token ใน basket
 * - Rebalancing: คำแนะนำการปรับสมดุล portfolio
 * 
 * ใช้ Zod สำหรับ runtime validation และ type inference
 */

import { z } from "zod";

/**
 * Schema สำหรับ Token Allocation ใน Basket
 * กำหนดว่าแต่ละ token ควรมีสัดส่วนเท่าไหร่ใน portfolio
 */
export const TokenAllocationSchema = z.object({
  tokenAddress: z.string(),                    // Contract address ของ token
  symbol: z.string(),                          // สัญลักษณ์ เช่น "ETH", "USDC"
  name: z.string(),                            // ชื่อเต็ม เช่น "Ethereum", "USD Coin"
  percentage: z.number().min(0).max(100),      // เปอร์เซ็นต์ใน basket (0-100%)
  amount: z.string().optional(),               // จำนวน token จริง (เป็น string เพราะ BigInt)
});

/**
 * Schema สำหรับ Basket (Token Portfolio)
 * ผู้ใช้สามารถสร้าง basket ที่มี tokens หลายตัวตามสัดส่วนที่กำหนด
 */
export const BasketSchema = z.object({
  id: z.string(),                              // Unique identifier
  name: z.string().min(1).max(100),            // ชื่อ basket เช่น "DeFi Blue Chips"
  description: z.string().max(500).optional(), // คำอธิบาย basket (optional)
  allocations: z.array(TokenAllocationSchema), // รายการ tokens และสัดส่วน
  totalValue: z.string().optional(),           // มูลค่ารวม (USD, เป็น string เพราะ precision)
  createdAt: z.date(),                         // วันที่สร้าง
  updatedAt: z.date(),                         // วันที่แก้ไขล่าสุด
  userId: z.string(),                          // เจ้าของ basket
  isPublic: z.boolean().default(false),        // แชร์ให้คนอื่นดูได้หรือไม่
});

/**
 * Schema สำหรับสร้าง Basket ใหม่
 * ไม่ต้องระบุ id, timestamps, userId (จะถูกสร้างโดย backend)
 */
export const CreateBasketSchema = BasketSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
});

/**
 * Schema สำหรับอัพเดท Basket
 * ทุกฟิลด์เป็น optional เพราะอาจแก้ไขเฉพาะบางส่วน
 */
export const UpdateBasketSchema = CreateBasketSchema.partial();

/**
 * Schema สำหรับคำแนะนำการ Rebalance
 * เมื่อสัดส่วน tokens ใน basket เปลี่ยนไปจากเป้าหมาย
 */
export const RebalanceRecommendationSchema = z.object({
  basketId: z.string(),                                    // ID ของ basket ที่ต้อง rebalance
  currentAllocations: z.array(TokenAllocationSchema),     // สัดส่วนปัจจุบัน
  targetAllocations: z.array(TokenAllocationSchema),      // สัดส่วนเป้าหมาย
  trades: z.array(z.object({                              // รายการ trades ที่ต้องทำ
    from: z.string(),                                     // Token ที่จะขาย
    to: z.string(),                                       // Token ที่จะซื้อ
    amount: z.string(),                                   // จำนวนที่จะ trade
    estimatedGas: z.string().optional(),                  // ค่า gas ประมาณ
  })),
  estimatedCost: z.string(),                              // ค่าใช้จ่ายรวม (gas + slippage)
});

// Type exports - ใช้ Zod infer เพื่อสร้าง TypeScript types
export type TokenAllocation = z.infer<typeof TokenAllocationSchema>;
export type Basket = z.infer<typeof BasketSchema>;
export type CreateBasket = z.infer<typeof CreateBasketSchema>;
export type UpdateBasket = z.infer<typeof UpdateBasketSchema>;
export type RebalanceRecommendation = z.infer<typeof RebalanceRecommendationSchema>;