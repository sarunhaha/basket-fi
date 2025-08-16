/**
 * @fileoverview Baskets Service - Business logic สำหรับ token baskets
 * 
 * Service นี้จัดการ:
 * - CRUD operations สำหรับ baskets
 * - Token allocation management
 * - Rebalancing calculations
 * - Permission checks (public/private)
 * 
 * ใช้ Prisma สำหรับ database operations
 */

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBasketDto, UpdateBasketDto } from './dto';
import type { Basket, User } from '@prisma/client';

@Injectable()
export class BasketsService {
  constructor(private prisma: PrismaService) {}

  /**
   * สร้าง basket ใหม่
   * 
   * @param userId - ID ของผู้ใช้ที่สร้าง
   * @param createBasketDto - ข้อมูล basket ที่จะสร้าง
   * @returns Basket ที่สร้างใหม่
   */
  async create(userId: string, createBasketDto: CreateBasketDto) {
    const { allocations, ...basketData } = createBasketDto;

    // ตรวจสอบว่าเปอร์เซ็นต์รวมเท่ากับ 100%
    const totalPercentage = allocations.reduce((sum, allocation) => sum + allocation.percentage, 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new Error('Total allocation percentage must equal 100%');
    }

    // สร้าง basket พร้อม allocations
    return this.prisma.basket.create({
      data: {
        ...basketData,
        userId,
        // TODO: Add allocations when Prisma schema is complete
      },
      include: {
        // TODO: Include allocations and user data
      },
    });
  }

  /**
   * ดึง baskets ทั้งหมดของผู้ใช้
   * 
   * @param userId - ID ของผู้ใช้
   * @param includePublic - รวม public baskets หรือไม่
   * @returns Array ของ baskets
   */
  async findAll(userId: string, includePublic = false) {
    const where = includePublic 
      ? { OR: [{ userId }, { isPublic: true }] }
      : { userId };

    return this.prisma.basket.findMany({
      where,
      include: {
        // TODO: Include allocations and user data
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * ดึง basket ตาม ID
   * 
   * @param id - ID ของ basket
   * @param userId - ID ของผู้ใช้ (สำหรับ permission check)
   * @returns Basket พร้อมข้อมูลเพิ่มเติม
   */
  async findOne(id: string, userId: string) {
    const basket = await this.prisma.basket.findUnique({
      where: { id },
      include: {
        // TODO: Include allocations and user data
      },
    });

    if (!basket) {
      throw new NotFoundException('Basket not found');
    }

    // ตรวจสอบ permission
    if (basket.userId !== userId && !basket.isPublic) {
      throw new ForbiddenException('Access denied to this basket');
    }

    return basket;
  }

  /**
   * อัพเดท basket
   * 
   * @param id - ID ของ basket
   * @param userId - ID ของผู้ใช้
   * @param updateBasketDto - ข้อมูลที่จะอัพเดท
   * @returns Basket ที่อัพเดทแล้ว
   */
  async update(id: string, userId: string, updateBasketDto: UpdateBasketDto) {
    // ตรวจสอบ ownership
    const basket = await this.findOne(id, userId);
    if (basket.userId !== userId) {
      throw new ForbiddenException('You can only update your own baskets');
    }

    // แยก allocations ออกจาก updateBasketDto
    const { allocations, ...basketData } = updateBasketDto;
    
    return this.prisma.basket.update({
      where: { id },
      data: basketData,
      include: {
        // TODO: Include allocations and user data
      },
    });
  }

  /**
   * ลบ basket
   * 
   * @param id - ID ของ basket
   * @param userId - ID ของผู้ใช้
   */
  async remove(id: string, userId: string) {
    // ตรวจสอบ ownership
    const basket = await this.findOne(id, userId);
    if (basket.userId !== userId) {
      throw new ForbiddenException('You can only delete your own baskets');
    }

    return this.prisma.basket.delete({
      where: { id },
    });
  }

  /**
   * คำนวณ rebalancing recommendations
   * 
   * @param id - ID ของ basket
   * @param userId - ID ของผู้ใช้
   * @returns Rebalancing recommendations
   */
  async getRebalanceRecommendations(id: string, userId: string) {
    const basket = await this.findOne(id, userId);
    
    // TODO: Implement rebalancing logic
    // 1. ดึงราคาปัจจุบันของ tokens
    // 2. คำนวณ current allocations
    // 3. เปรียบเทียบกับ target allocations
    // 4. สร้าง trade recommendations
    
    return {
      basketId: id,
      currentAllocations: [],
      targetAllocations: [],
      trades: [],
      estimatedCost: '0',
    };
  }
}