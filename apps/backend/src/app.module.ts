/**
 * @fileoverview App Module - Root module ของ NestJS application
 * 
 * Module นี้เป็น root module ที่:
 * - รวม modules ทั้งหมดของแอป
 * - ตั้งค่า global modules (Config, Throttler, Prisma)
 * - จัดการ dependency injection
 * 
 * Modules ที่รวมอยู่:
 * - PrismaModule: Database connection และ ORM
 * - BasketsModule: จัดการ token baskets
 * - TokensModule: จัดการข้อมูล tokens
 * - UsersModule: จัดการผู้ใช้
 * - AlertsModule: จัดการการแจ้งเตือน
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';              // Environment variables
import { ThrottlerModule } from '@nestjs/throttler';        // Rate limiting
import { PrismaModule } from './prisma/prisma.module';      // Database ORM
// import { BasketsModule } from './baskets/baskets.module';   // Baskets functionality
// import { TokensModule } from './tokens/tokens.module';     // Tokens functionality
// import { UsersModule } from './users/users.module';        // Users functionality
// import { AlertsModule } from './alerts/alerts.module';     // Alerts functionality

@Module({
  imports: [
    // Global Configuration Module - จัดการ environment variables
    ConfigModule.forRoot({
      isGlobal: true,          // ทำให้ ConfigService ใช้ได้ทุกที่
    }),
    
    // Rate Limiting Module - จำกัดจำนวน requests ต่อเวลา
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL) || 60,      // Time window (seconds)
        limit: parseInt(process.env.THROTTLE_LIMIT) || 100, // Max requests per window
      },
    ]),
    
    // Database Module - Prisma ORM
    PrismaModule,
    
    // Feature Modules - TODO: Uncomment when modules are implemented
    // BasketsModule,    // จัดการ token baskets
    // TokensModule,     // จัดการข้อมูล tokens
    // UsersModule,      // จัดการผู้ใช้
    // AlertsModule,     // จัดการการแจ้งเตือน
  ],
})
export class AppModule {}