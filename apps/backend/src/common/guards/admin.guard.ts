import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { JwtAuthGuard, JwtPayload } from './jwt-auth.guard';
import { UserRole } from '@cookii/shared-types';

@Injectable()
export class AdminGuard extends JwtAuthGuard {
  private readonly adminSecret: string;

  constructor(configService: ConfigService) {
    super(configService);
    this.adminSecret = configService.get<string>(
      'ADMIN_JWT_SECRET',
      configService.get<string>(
        'JWT_ACCESS_SECRET',
        'cookii_dev_jwt_access_secret_super_secure_32chars',
      ),
    );
  }

  override canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or malformed Authorization header');
    }

    const token = authHeader.split(' ')[1];

    let decodedUser: JwtPayload | null = null;

    // 1. First attempt verification against ADMIN_JWT_SECRET
    try {
      decodedUser = jwt.verify(token, this.adminSecret) as JwtPayload;
    } catch {
      // 2. If token signature fails on ADMIN_JWT_SECRET, attempt base JwtAuthGuard verification
      try {
        const baseResult = super.canActivate(context);
        if (baseResult) {
          decodedUser = request.user as JwtPayload;
        }
      } catch (err: any) {
        throw new UnauthorizedException(err.message || 'Invalid admin access token');
      }
    }

    if (!decodedUser) {
      throw new UnauthorizedException('Authentication required');
    }

    request.user = decodedUser;

    // Validate role is either ADMIN or OPS
    const role = decodedUser.role;
    if (role !== UserRole.ADMIN && role !== UserRole.OPS) {
      throw new ForbiddenException('Admin or Operations privilege required for this resource');
    }

    return true;
  }
}
