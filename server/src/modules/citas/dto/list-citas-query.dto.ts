import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { CITA_ESTADOS } from './create-cita.dto';

export class ListCitasQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filtra por médico.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  medicoId?: string;

  @ApiPropertyOptional({ description: 'Filtra por paciente.', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  pacienteId?: string;

  @ApiPropertyOptional({ description: 'Filtra por consultorio.' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  consultorioId?: string;

  @ApiPropertyOptional({ description: 'Filtra por estado de la cita.', enum: CITA_ESTADOS })
  @IsOptional()
  @IsIn(CITA_ESTADOS)
  estado?: string;

  // Se conserva para compatibilidad con clientes que consultan una sola fecha.
  @ApiPropertyOptional({ description: 'Filtra por una fecha exacta (ISO 8601). Tiene prioridad sobre fechaDesde/fechaHasta.' })
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @ApiPropertyOptional({ description: 'Filtra citas desde esta fecha (ISO 8601), inclusive.' })
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional({ description: 'Filtra citas hasta esta fecha (ISO 8601), inclusive.' })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}
