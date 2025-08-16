/**
 * @fileoverview Baskets Controller - API endpoints สำหรับ token baskets
 * 
 * Controller นี้จัดการ HTTP requests สำหรับ:
 * - CRUD operations สำหรับ baskets
 * - Rebalancing recommendations
 * - Public basket discovery
 * 
 * ใช้ NestJS decorators สำหรับ routing และ validation
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BasketsService } from './baskets.service';
import { CreateBasketDto, UpdateBasketDto } from './dto';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // TODO: Uncomment when auth is implemented

@ApiTags('baskets')
@Controller('baskets')
// @UseGuards(JwtAuthGuard) // TODO: Uncomment when auth is implemented
// @ApiBearerAuth() // TODO: Uncomment when auth is implemented
export class BasketsController {
  constructor(private readonly basketsService: BasketsService) {}

  /**
   * สร้าง basket ใหม่
   */
  @Post()
  @ApiOperation({ summary: 'Create a new basket' })
  @ApiResponse({ status: 201, description: 'Basket created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createBasketDto: CreateBasketDto, @Request() req: any) {
    // TODO: Get userId from JWT token
    const userId = req.user?.id || 'temp-user-id';
    return this.basketsService.create(userId, createBasketDto);
  }

  /**
   * ดึง baskets ทั้งหมด
   */
  @Get()
  @ApiOperation({ summary: 'Get all baskets' })
  @ApiResponse({ status: 200, description: 'Baskets retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @Request() req: any,
    @Query('includePublic') includePublic?: string
  ) {
    // TODO: Get userId from JWT token
    const userId = req.user?.id || 'temp-user-id';
    const shouldIncludePublic = includePublic === 'true';
    return this.basketsService.findAll(userId, shouldIncludePublic);
  }

  /**
   * ดึง basket ตาม ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get basket by ID' })
  @ApiResponse({ status: 200, description: 'Basket retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Basket not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  findOne(@Param('id') id: string, @Request() req: any) {
    // TODO: Get userId from JWT token
    const userId = req.user?.id || 'temp-user-id';
    return this.basketsService.findOne(id, userId);
  }

  /**
   * อัพเดท basket
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update basket' })
  @ApiResponse({ status: 200, description: 'Basket updated successfully' })
  @ApiResponse({ status: 404, description: 'Basket not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  update(
    @Param('id') id: string,
    @Body() updateBasketDto: UpdateBasketDto,
    @Request() req: any
  ) {
    // TODO: Get userId from JWT token
    const userId = req.user?.id || 'temp-user-id';
    return this.basketsService.update(id, userId, updateBasketDto);
  }

  /**
   * ลบ basket
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete basket' })
  @ApiResponse({ status: 200, description: 'Basket deleted successfully' })
  @ApiResponse({ status: 404, description: 'Basket not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  remove(@Param('id') id: string, @Request() req: any) {
    // TODO: Get userId from JWT token
    const userId = req.user?.id || 'temp-user-id';
    return this.basketsService.remove(id, userId);
  }

  /**
   * ดึง rebalancing recommendations
   */
  @Get(':id/rebalance')
  @ApiOperation({ summary: 'Get rebalancing recommendations' })
  @ApiResponse({ status: 200, description: 'Recommendations retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Basket not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  getRebalanceRecommendations(@Param('id') id: string, @Request() req: any) {
    // TODO: Get userId from JWT token
    const userId = req.user?.id || 'temp-user-id';
    return this.basketsService.getRebalanceRecommendations(id, userId);
  }
}