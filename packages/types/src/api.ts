/**
 * @fileoverview API Types - โครงสร้างข้อมูลสำหรับ API Communication
 * 
 * ไฟล์นี้กำหนด types สำหรับ:
 * - API responses: รูปแบบการตอบกลับจาก backend
 * - Pagination: การแบ่งหน้าข้อมูล
 * - Alerts: การแจ้งเตือนราคาและ rebalancing
 * 
 * ใช้ร่วมกันระหว่าง frontend และ backend เพื่อความสอดคล้อง
 */

import { z } from "zod";

/**
 * Schema สำหรับ API Response รูปแบบมาตรฐาน
 * ทุก API endpoint จะใช้รูปแบบนี้
 */
export const ApiResponseSchema = z.object({
  success: z.boolean(),                        // สถานะความสำเร็จของ API call
  data: z.any().optional(),                    // ข้อมูลที่ส่งกลับ (ถ้าสำเร็จ)
  error: z.string().optional(),               // ข้อความ error (ถ้าล้มเหลว)
  message: z.string().optional(),             // ข้อความเพิ่มเติม
});

/**
 * Schema สำหรับ Pagination
 * ใช้สำหรับการแบ่งหน้าข้อมูลที่มีจำนวนมาก
 */
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),         // หน้าปัจจุบัน (เริ่มจาก 1)
  limit: z.number().min(1).max(100).default(20), // จำนวนรายการต่อหน้า (สูงสุด 100)
  total: z.number().optional(),               // จำนวนรายการทั้งหมด
  totalPages: z.number().optional(),          // จำนวนหน้าทั้งหมด
});

/**
 * Schema สำหรับ Alert System
 * ผู้ใช้สามารถตั้งการแจ้งเตือนเมื่อราคาหรือสัดส่วนเปลี่ยนแปลง
 */
export const AlertSchema = z.object({
  id: z.string(),                              // Unique alert ID
  userId: z.string(),                          // เจ้าของ alert
  basketId: z.string().optional(),            // Basket ที่เกี่ยวข้อง (ถ้ามี)
  tokenAddress: z.string().optional(),        // Token ที่เกี่ยวข้อง (ถ้ามี)
  type: z.enum(["price", "percentage", "rebalance"]), // ประเภทการแจ้งเตือน
  condition: z.enum(["above", "below", "change"]),    // เงื่อนไข (สูงกว่า/ต่ำกว่า/เปลี่ยนแปลง)
  value: z.string(),                           // ค่าที่ใช้เปรียบเทียบ
  isActive: z.boolean().default(true),         // เปิด/ปิดการแจ้งเตือน
  createdAt: z.date(),                         // วันที่สร้าง
  updatedAt: z.date(),                         // วันที่แก้ไขล่าสุด
});

/**
 * Schema สำหรับสร้าง Alert ใหม่
 * ไม่ต้องระบุ id, timestamps, userId
 */
export const CreateAlertSchema = AlertSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
});

/**
 * Generic API Response Type
 * ใช้ TypeScript generics เพื่อระบุประเภทข้อมูลที่ส่งกลับ
 */
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

// Type exports
export type Pagination = z.infer<typeof PaginationSchema>;
export type Alert = z.infer<typeof AlertSchema>;
export type CreateAlert = z.infer<typeof CreateAlertSchema>;