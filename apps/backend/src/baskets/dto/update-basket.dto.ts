/**
 * @fileoverview Update Basket DTO - สำหรับอัพเดท basket
 * 
 * DTO นี้ extend จาก CreateBasketDto แต่ทำให้ fields ทั้งหมดเป็น optional
 * เพราะการ update อาจจะแก้ไขเฉพาะบางฟิลด์
 * 
 * ใช้ PartialType จาก @nestjs/swagger เพื่อสร้าง partial version
 */

import { PartialType } from '@nestjs/swagger';
import { CreateBasketDto } from './create-basket.dto';

/**
 * Update Basket DTO
 * 
 * ทุกฟิลด์เป็น optional เพราะอาจแก้ไขเฉพาะบางส่วน
 * Validation rules ยังคงใช้ได้เมื่อมีการส่งข้อมูลมา
 */
export class UpdateBasketDto extends PartialType(CreateBasketDto) {}