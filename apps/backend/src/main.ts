/**
 * @fileoverview Backend Main Entry Point - จุดเริ่มต้นของ NestJS API Server
 * 
 * ไฟล์นี้เป็น entry point ของ Basket.fi Backend API ที่:
 * - ตั้งค่า NestJS application
 * - เปิดใช้ global validation pipes
 * - กำหนด CORS policy
 * - ตั้งค่า API prefix
 * - สร้าง Swagger documentation
 * - เริ่มต้น HTTP server
 * 
 * Backend ใช้ NestJS framework พร้อม Prisma ORM และ PostgreSQL
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Bootstrap function - เริ่มต้น NestJS application
 */
async function bootstrap() {
  // สร้าง NestJS application instance
  const app = await NestFactory.create(AppModule);

  // ตั้งค่า Global Validation Pipe สำหรับ validate request data
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // ลบ properties ที่ไม่ได้ define ใน DTO
      forbidNonWhitelisted: true, // throw error ถ้ามี properties ที่ไม่ได้ define
      transform: true,           // แปลง plain objects เป็น class instances
    }),
  );

  // ตั้งค่า CORS สำหรับ frontend access
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000', // อนุญาต frontend domain
    credentials: true,         // อนุญาต cookies และ credentials
  });

  // ตั้งค่า API prefix (เช่น /api/v1)
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  // ตั้งค่า Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Basket-Fi API')                                    // ชื่อ API
    .setDescription('API for creating and managing token baskets on Monad') // คำอธิบาย
    .setVersion('1.0')                                           // เวอร์ชัน
    .addTag('baskets')                                           // Tags สำหรับจัดกลุ่ม endpoints
    .addTag('tokens')
    .addTag('users')
    .addTag('alerts')
    .build();
  
  // สร้าง Swagger document และ setup UI
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);                   // เข้าได้ที่ /docs

  // เริ่มต้น HTTP server
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Backend server running on http://localhost:${port}`);
  console.log(`📚 API documentation available at http://localhost:${port}/docs`);
}

bootstrap();