import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auditoria } from './entities/auditoria.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(Auditoria)
    private readonly auditoriaRepository: Repository<Auditoria>,
  ) {}

  async record(event: {
    usuarioId?: string | null;
    accion: string;
    recursoTipo: string;
    recursoId?: string | null;
    resultado: string;
    correlationId?: string | null;
    metadata?: Record<string, string> | null;
  }): Promise<void> {
    await this.auditoriaRepository.save(this.auditoriaRepository.create({
      usuarioId: event.usuarioId ?? null,
      accion: event.accion,
      recursoTipo: event.recursoTipo,
      recursoId: event.recursoId ?? null,
      resultado: event.resultado,
      correlationId: event.correlationId ?? null,
      metadata: event.metadata ?? null,
    }));
  }
}
