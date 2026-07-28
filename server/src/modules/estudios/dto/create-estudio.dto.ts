import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID } from 'class-validator';

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
  @IsString()
  @IsNotEmpty()
  fecha: string;

  @ApiProperty({ description: 'Tipo de estudio.', example: 'laboratorio' })
  @IsString()
  @IsNotEmpty()
  tipoEstudio: string; // 'imagen' | 'laboratorio'

  @ApiPropertyOptional({ description: 'Estudios solicitados.', type: [String] })
  @IsArray()
  @IsOptional()
  estudiosSolicitados?: string[];

  @ApiPropertyOptional({ description: 'Prioridad del estudio.', default: 'rutina' })
  @IsString()
  @IsOptional()
  prioridad?: string;

  @ApiPropertyOptional({ description: 'Estado del estudio.', default: 'solicitado' })
  @IsString()
  @IsOptional()
  estado?: string;

  @ApiPropertyOptional({ description: 'Notas adicionales.' })
  @IsString()
  @IsOptional()
  notas?: string;
}
