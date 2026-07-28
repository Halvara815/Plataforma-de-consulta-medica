import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsObject, IsDateString, IsUUID, IsIn } from 'class-validator';

export const CONSULTA_ESTADOS = ['en_curso', 'completada'] as const;

export class CreateConsultaDto {
  @ApiProperty({ description: 'Paciente atendido en la consulta.', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  pacienteId: string;

  @ApiProperty({ description: 'Médico que atiende la consulta.', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  medicoId: string;

  @ApiProperty({ description: 'Fecha y hora de la consulta (ISO 8601).' })
  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @ApiProperty({ description: 'Tipo de consulta.', example: 'seguimiento' })
  @IsString()
  @IsNotEmpty()
  tipo: string; // 'inicial' | 'control' | 'seguimiento'

  @ApiPropertyOptional({ description: 'Motivo de la consulta.' })
  @IsString()
  @IsOptional()
  motivoConsulta?: string;

  @ApiPropertyOptional({ description: 'Padecimiento actual del paciente.' })
  @IsString()
  @IsOptional()
  padecimientoActual?: string;

  @ApiPropertyOptional({ description: 'Síntomas reportados.', type: [String] })
  @IsArray()
  @IsOptional()
  sintomas?: string[];

  @ApiPropertyOptional({ description: 'Signos vitales registrados.', type: Object })
  @IsObject()
  @IsOptional()
  signosVitales?: object;

  @ApiPropertyOptional({ description: 'Hallazgos de la exploración física.' })
  @IsString()
  @IsOptional()
  exploracionFisica?: string;

  @ApiPropertyOptional({ description: 'Antecedentes del paciente.', type: Object })
  @IsObject()
  @IsOptional()
  antecedentes?: object;

  @ApiPropertyOptional({ description: 'Diagnósticos de la consulta.', type: [Object] })
  @IsArray()
  @IsOptional()
  diagnosticos?: object[];

  @ApiPropertyOptional({ description: 'Plan terapéutico indicado.', type: [String] })
  @IsArray()
  @IsOptional()
  planTerapeutico?: string[];

  @ApiPropertyOptional({ description: 'Notas adicionales.' })
  @IsString()
  @IsOptional()
  notas?: string;

  @ApiPropertyOptional({ description: 'Duración de la consulta.' })
  @IsString()
  @IsOptional()
  duracion?: string;

  @ApiPropertyOptional({ description: 'Estado de la consulta.', enum: CONSULTA_ESTADOS, default: 'en_curso' })
  @IsIn(CONSULTA_ESTADOS)
  @IsOptional()
  estado?: string;
}
