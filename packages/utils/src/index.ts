/**
 * @fileoverview Basket.fi Utils Package - Shared Utility Functions
 * 
 * ไฟล์นี้เป็น entry point สำหรับ utility functions ที่ใช้ร่วมกันใน:
 * - Frontend (Next.js Web App)
 * - Backend (NestJS API)
 * - Mobile App (React Native)
 * 
 * ประกอบด้วย:
 * - cn: ClassName utility สำหรับ Tailwind CSS
 * - format: Functions สำหรับ format ข้อมูล (currency, percentage, addresses)
 * - validation: Functions สำหรับ validate ข้อมูล
 * - constants: ค่าคงที่ที่ใช้ทั่วทั้งแอป
 */

export * from "./cn";          // ClassName merging utility
export * from "./format";      // Data formatting functions
export * from "./validation";  // Input validation functions
export * from "./constants";   // App-wide constants