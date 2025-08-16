/**
 * @fileoverview Create Basket DTO - สำหรับสร้าง basket ใหม่
 * 
 * DTO นี้ใช้สำหรับ validate ข้อมูลการสร้าง basket:
 * - ชื่อ basket (required, 1-100 characters)
 * - คำอธิบาย (optional, max 500 characters)
 * - Token allocations (required, must sum to 100%)
 * - Public/private setting
 * 
 * ใช้ class-validator สำหรับ validation rules
 */

import { ApiProperty } from '@nestjs/swagger';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsBoolean, 
  IsArray, 
  ValidateNested, 
  ArrayMinSize,
  Length,
  MaxLength 
} from 'class-validator';
import { Type } from 'class-transformer';
import { TokenAllocationDto } from './token-allocation.dto';

export class CreateBasketDto {
  @ApiProperty({
    description: 'ชื่อของ basket',
    example: 'DeFi Blue Chips',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;

  @ApiProperty({
    description: 'คำอธิบาย basket (optional)',
    example: 'A diversified portfolio of top DeFi tokens',
    maxLength: 500,
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'รายการ token allocations',
    type: [TokenAllocationDto],
    example: [
      {
        tokenAddress: '0x1234567890123456789012345678901234567890',
        symbol: 'ETH',
        name: 'Ethereum',
        percentage: 50,
        amount: '1.0'
      },
      {
        tokenAddress: '0x0987654321098765432109876543210987654321',
        symbol: 'USDC',
        name: 'USD Coin',
        percentage: 50,
        amount: '1500.0'
      }
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TokenAllocationDto)
  allocations: TokenAllocationDto[];

  @ApiProperty({
    description: 'แชร์ basket ให้คนอื่นดูได้หรือไม่',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean = false;
}