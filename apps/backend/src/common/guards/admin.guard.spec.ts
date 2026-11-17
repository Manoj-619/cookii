import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { AdminGuard } from './admin.guard';
import { UserRole } from '@cookii/shared-types';

describe('AdminGuard', () => {
  let guard: AdminGuard;
  let configService: ConfigService;
  const adminSecret = 'test_admin_jwt_secret_1234567890123';
  const accessSecret = 'test_access_jwt_secret_123456789012';

  beforeEach(() => {
    configService = new ConfigService();
    jest.spyOn(configService, 'get').mockImplementation((key: string) => {
      if (key === 'ADMIN_JWT_SECRET') return adminSecret;
      if (key === 'JWT_ACCESS_SECRET') return accessSecret;
      return undefined;
    });
    guard = new AdminGuard(configService);
  });

  const createMockContext = (authHeader?: string): ExecutionContext => {
    const request: any = {
      headers: authHeader ? { authorization: authHeader } : {},
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('should throw UnauthorizedException when no Authorization header is provided', () => {
    const context = createMockContext();
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should throw ForbiddenException if user role is CUSTOMER', () => {
    const token = jwt.sign(
      { sub: 'usr_1', role: UserRole.CUSTOMER },
      adminSecret,
    );
    const context = createMockContext(`Bearer ${token}`);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should allow access if user role is ADMIN', () => {
    const token = jwt.sign(
      { sub: 'admin_1', role: UserRole.ADMIN },
      adminSecret,
    );
    const context = createMockContext(`Bearer ${token}`);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access if user role is OPS', () => {
    const token = jwt.sign(
      { sub: 'ops_1', role: UserRole.OPS },
      adminSecret,
    );
    const context = createMockContext(`Bearer ${token}`);
    expect(guard.canActivate(context)).toBe(true);
  });
});
