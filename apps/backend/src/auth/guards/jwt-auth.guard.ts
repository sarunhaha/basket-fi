/**
 * @fileoverview JWT Auth Guard - สำหรับป้องกัน routes ด้วย JWT
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}