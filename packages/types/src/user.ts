/**
 * @fileoverview User Types - โครงสร้างข้อมูลผู้ใช้
 * 
 * ไฟล์นี้กำหนด types สำหรับ:
 * - User profiles: ข้อมูลผู้ใช้และ wallet addresses
 * - User preferences: การตั้งค่าภาษา, สกุลเงิน, การแจ้งเตือน
 * - Authentication: Web3 wallet-based authentication
 * 
 * Basket.fi ใช้ Web3 authentication ผ่าน wallet addresses
 * ไม่ต้องการ email/password แบบดั้งเดิม
 */

import { z } from "zod";

/**
 * Schema สำหรับ User Profile
 * ใช้ wallet address เป็น primary identifier
 */
export const UserSchema = z.object({
  id: z.string(),                              // Unique user ID
  walletAddress: z.string(),                   // Ethereum wallet address (primary identifier)
  email: z.string().email().optional(),       // Email สำหรับการแจ้งเตือน (optional)
  displayName: z.string().optional(),         // ชื่อที่แสดง (optional)
  createdAt: z.date(),                         // วันที่สมัครสมาชิก
  updatedAt: z.date(),                         // วันที่อัพเดทข้อมูลล่าสุด
  preferences: z.object({                      // การตั้งค่าผู้ใช้
    language: z.enum(["en", "th"]).default("en"),        // ภาษา: อังกฤษ หรือ ไทย
    currency: z.enum(["USD", "THB"]).default("USD"),     // สกุลเงิน: ดอลลาร์ หรือ บาท
    notifications: z.object({                            // การตั้งค่าการแจ้งเตือน
      email: z.boolean().default(false),                // แจ้งเตือนทาง email
      push: z.boolean().default(true),                  // แจ้งเตือนแบบ push notification
    }).default({}),
  }).default({}),
});

/**
 * Schema สำหรับสร้าง User ใหม่
 * ไม่ต้องระบุ id และ timestamps (จะถูกสร้างโดย backend)
 */
export const CreateUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

/**
 * Schema สำหรับอัพเดท User
 * ทุกฟิลด์เป็น optional เพราะอาจแก้ไขเฉพาะบางส่วน
 */
export const UpdateUserSchema = CreateUserSchema.partial();

// Type exports
export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UpdateUser = z.infer<typeof UpdateUserSchema>;