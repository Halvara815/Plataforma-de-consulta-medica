import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsDateString, IsIn, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export const ESTUDIO_TIPOS = ['imagen', 'laboratorio'] as const;
export const ESTUDIO_PRIORIDADES = ['rutina', 'prioritaria', 'urgente'] as const;
export const ESTUDIO_ESTADOS = ['solicitado', 'programado', 'en_proceso', 'completado', 'cancelado'] as const;

export class CreateEstudioDto {
  @ApiProperty({ description: 'Paciente al que se solicita el estudio.', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  pacienteId: string;

  @ApiProperty({ description: 'Médico que solicita el estudio.', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  medicoId: string;

  @ApiProperty({ description: 'Fecha de solicitud del estudio (ISO 8601).' })
  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @ApiProperty({ description: 'Tipo de estudio.', enum: ESTUDIO_TIPOS, example: 'laboratorio' })
  @IsIn(ESTUDIO_TIPOS)
  tipoEstudio: string;

  @ApiProperty({ description: 'Estudios solicitados.', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(500, { each: true })
  estudiosSolicitados: string[];

  @ApiPropertyOptional({ description: 'Prioridad del estudio.', enum: ESTUDIO_PRIORIDADES, default: 'rutina' })
  @IsIn(ESTUDIO_PRIORIDADES)
  @IsOptional()
  prioridad?: string;

  @ApiPropertyOptional({ description: 'Notas adicionales.' })
  @IsString()
  @IsOptional()
  @MaxLength(4000)
  notas?: string;
}
