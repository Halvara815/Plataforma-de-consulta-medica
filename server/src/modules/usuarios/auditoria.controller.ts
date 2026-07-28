import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Auditoria } from '../auth/entities/auditoria.entity';

@Controller('auditoria')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('auditoria:leer')
export class AuditoriaController {
  constructor(
    @InjectRepository(Auditoria)
    private readonly auditoriaRepository: Repository<Auditoria>,
  ) {}

  @Get()
  async list(@Query('limit') value?: string) {
    const parsed = Number.parseInt(value ?? '25', 10);
    const limit = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 100) : 25;
    const items = await this.auditoriaRepository
      .createQueryBuilder('auditoria')
      .leftJoinAndSelect('auditoria.usuario', 'usuario')
      .orderBy('auditoria.createdAt', 'DESC')
      .take(limit)
      .getMany();

    return {
      items: items.map((event) => ({
        id: event.id,
        accion: event.accion,
        recursoTipo: event.recursoTipo,
        recursoId: event.recursoId,
        resultado: event.resultado,
        correlationId: event.correlationId,
        createdAt: event.createdAt,
        usuario: event.usuario ? {
          id: event.usuario.id,
          email: event.usuario.email,
          nombre: event.usuario.nombre,
        } : null,
      })),
      limit,
    };
  }
}
