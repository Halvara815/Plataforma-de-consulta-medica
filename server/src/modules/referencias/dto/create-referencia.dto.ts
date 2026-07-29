import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export const REFERENCIA_ESTADOS = ['pendiente', 'completada'] as const;

export class CreateReferenciaDto {
  @ApiProperty({ description: 'Paciente remitido.', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  pacienteId: string;

  @ApiProperty({ description: 'Especialidad de destino.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  especialidad: string;

  @ApiProperty({ description: 'Médico o institución de destino.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  medicoDestino: string;

  @ApiProperty({ description: 'Fecha de la referencia.', format: 'date' })
  @IsDateString()
  fecha: string;

  @ApiPropertyOptional({ enum: REFERENCIA_ESTADOS, default: 'pendiente' })
  @IsOptional()
  @IsIn(REFERENCIA_ESTADOS)
  estado?: string;

  @ApiProperty({ description: 'Motivo clínico de la referencia.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  motivo: string;
}
