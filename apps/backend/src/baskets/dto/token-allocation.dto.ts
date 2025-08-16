/**
 * @fileoverview Token Allocation DTO - สำหรับ token allocation data
 * 
 * DTO นี้ใช้สำหรับ validate ข้อมูล token allocation:
 * - Token address validation
 * - Percentage validation (0-100%)
 * - Required fields validation
 * 
 * ใช้ class-validator สำหรับ validation rules
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsNotEmpty, Min, Max, IsEthereumAddress } from 'class-validator';

export class TokenAllocationDto {
  @ApiProperty({
    description: 'Contract address ของ token',
    example: '0x1234567890123456789012345678901234567890',
  })
  @IsString()
  @IsNotEmpty()
  @IsEthereumAddress()
  tokenAddress: string;

  @ApiProperty({
    description: 'สัญลักษณ์ของ token',
    example: 'ETH',
  })
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @ApiProperty({
    description: 'ชื่อเต็มของ token',
    example: 'Ethereum',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'เปอร์เซ็นต์ใน basket (0-100)',
    example: 50.5,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage: number;

  @ApiProperty({
    description: 'เปอร์เซ็นต์เป้าหมาย (alias สำหรับ percentage)',
    example: 50.5,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  targetPercentage?: number;

  @ApiProperty({
    description: 'จำนวน token จริง (optional)',
    example: '1.5',
    required: false,
  })
  @IsString()
  amount?: string;
}