/**
 * @fileoverview Prisma Service - Database connection service
 * 
 * Service นี้:
 * - Extend PrismaClient เพื่อเพิ่ม NestJS lifecycle hooks
 * - จัดการ database connection
 * - ให้ database access ผ่าน dependency injection
 * 
 * ใช้ Prisma ORM สำหรับ type-safe database operations
 */

import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma Service - จัดการ database connection
 * Extend PrismaClient และ implement NestJS lifecycle
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  /**
   * เชื่อมต่อ database เมื่อ module initialize
   */
  async onModuleInit() {
    await this.$connect();
  }
}