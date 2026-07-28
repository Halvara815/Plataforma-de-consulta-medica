import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../modules/auth/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const usuario = request.user as { id?: string } | undefined;
    const recursoTipo = this.resourceType(request.baseUrl);

    if (!usuario?.id || recursoTipo === 'auth' || recursoTipo === 'health') {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        void this.auditService.record({
          usuarioId: usuario.id,
          accion: `api.${request.method.toLowerCase()}`,
          recursoTipo,
          recursoId: typeof request.params?.id === 'string' ? request.params.id : null,
          resultado: 'exitoso',
          correlationId: this.correlationId(request.headers['x-request-id']),
          metadata: { metodo: request.method },
        }).catch((error: unknown) => {
          this.logger.error(JSON.stringify({
            event: 'audit.write_failed',
            errorType: error instanceof Error ? error.name : 'UnknownError',
          }));
        });
      }),
    );
  }

  private resourceType(baseUrl: string): string {
    return baseUrl.replace(/^\/api\/v1\//, '').split('/')[0] || 'desconocido';
  }

  private correlationId(value: unknown): string | null {
    return typeof value === 'string' && value.length <= 128 ? value : null;
  }
}
