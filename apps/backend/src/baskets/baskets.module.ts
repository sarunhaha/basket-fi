/**
 * @fileoverview Baskets Module - จัดการ token baskets
 * 
 * Module นี้รวม:
 * - BasketsController: API endpoints สำหรับ CRUD baskets
 * - BasketsService: Business logic สำหรับจัดการ baskets
 * - DTOs: Data Transfer Objects สำหรับ validation
 * 
 * Features:
 * - สร้าง, แก้ไข, ลบ baskets
 * - จัดการ token allocations
 * - Rebalancing recommendations
 * - Public/private basket sharing
 */

import { Module } from '@nestjs/common';
import { BasketsController } from './baskets.controller';
import { BasketsService } from './baskets.service';

@Module({
  controllers: [BasketsController],
  providers: [BasketsService],
  exports: [BasketsService], // Export สำหรับ modules อื่น
})
export class BasketsModule {}