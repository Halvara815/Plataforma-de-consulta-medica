import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRED_PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';
import { AuditService } from '../../modules/auth/audit.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(REQUIRED_PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const request = context.switchToHttp().getRequest();
    const permissions = new Set<string>(request.user?.permisos ?? []);
    const hasAllPermissions = required.every((permission) => permissions.has(permission));
    if (!hasAllPermissions) await this.recordDenied(request, required);
    if (!hasAllPermissions) throw new ForbiddenException('No tienes permiso para realizar esta acción');
    return true;
  }

  private async recordDenied(request: any, required: string[]): Promise<void> {
    try {
      await this.auditService.record({
        usuarioId: typeof request.user?.id === 'string' ? request.user.id : null,
        accion: 'authorization.denied',
        recursoTipo: this.resourceType(request.baseUrl),
        recursoId: typeof request.params?.id === 'string' ? request.params.id : null,
        resultado: 'denegado',
        correlationId: this.correlationId(request.headers?.['x-request-id']),
        metadata: {
          metodo: request.method,
          permisosRequeridos: required.join(','),
        },
      });
    } catch (error) {
      this.logger.error(JSON.stringify({
        event: 'audit.authorization_denied_failed',
        errorType: error instanceof Error ? error.name : 'UnknownError',
      }));
    }
  }

  private resourceType(baseUrl: string): string {
    return baseUrl.replace(/^\/api\/v1\//, '').split('/')[0] || 'desconocido';
  }

  private correlationId(value: unknown): string | null {
    return typeof value === 'string' && value.length <= 128 ? value : null;
  }
}
