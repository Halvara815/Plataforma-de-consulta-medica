import { IsDateString, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { CITA_ESTADOS } from './create-cita.dto';

export class ListCitasQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID()
  medicoId?: string;

  @IsOptional()
  @IsUUID()
  pacienteId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  consultorioId?: string;

  @IsOptional()
  @IsIn(CITA_ESTADOS)
  estado?: string;

  // Se conserva para compatibilidad con clientes que consultan una sola fecha.
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}
