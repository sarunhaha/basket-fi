/**
 * @fileoverview Basket.fi Types Package - Shared TypeScript Types
 * 
 * ไฟล์นี้เป็น entry point สำหรับ types package ที่ใช้ร่วมกันระหว่าง:
 * - Frontend (Next.js Web App)
 * - Backend (NestJS API)
 * - Mobile App (React Native)
 * 
 * ประกอบด้วย:
 * - Basket types: โครงสร้างข้อมูล token baskets และ allocations
 * - User types: ข้อมูลผู้ใช้และ preferences
 * - Token types: ข้อมูล cryptocurrency tokens และราคา
 * - API types: Response formats และ pagination
 */

export * from "./basket";  // Basket และ TokenAllocation types
export * from "./user";    // User และ preferences types  
export * from "./token";   // Token และ price history types
export * from "./api";     // API response และ pagination types