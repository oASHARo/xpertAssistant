import type { TenantPrismaClient } from '../../../db/tenant-resolver/tenant-connection-factory.js';
import { AuthService, type AuthResponse } from '../../../services/auth.service.js';
import type { Handler } from '../../mediator.js';

export interface RefreshTokenCommand {
  type: 'auth.refresh-token';
  refreshToken: string;
  tenantId: string;
  tenantDb: TenantPrismaClient;
}

export class RefreshTokenHandler implements Handler<RefreshTokenCommand, AuthResponse> {
  constructor(private readonly authService: AuthService) {}
  handle(command: RefreshTokenCommand): Promise<AuthResponse> {
    return this.authService.refreshToken(command);
  }
}
