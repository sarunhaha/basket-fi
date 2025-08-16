/**
 * @fileoverview Auth Service - สำหรับจัดการ authentication
 */

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async validateUser(walletAddress: string): Promise<any> {
    // TODO: Implement wallet validation logic
    return { id: 'temp-user-id', walletAddress };
  }

  async login(user: any) {
    const payload = { walletAddress: user.walletAddress, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}