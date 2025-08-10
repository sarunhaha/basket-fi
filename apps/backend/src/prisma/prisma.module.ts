/**
 * @fileoverview Prisma Module - Global database module
 * 
 * Module นี้:
 * - เป็น Global module ที่ใช้ได้ทุกที่ในแอป
 * - Export PrismaService สำหรับ dependency injection
 * - จัดการ database connection lifecycle
 * 
 * ทำให้ modules อื่นๆ สามารถ inject PrismaService ได้โดยไม่ต้อง import
 */

import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * Prisma Module - Global database module
 * 
 * @Global() ทำให้ module นี้ใช้ได้ทุกที่โดยไม่ต้อง import
 */
@Global()
@Module({
  providers: [PrismaService],  // Register PrismaService
  exports: [PrismaService],    // Export สำหรับ modules อื่น
})
export class PrismaModule {}