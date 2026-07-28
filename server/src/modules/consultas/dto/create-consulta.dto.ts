import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { AntecedentesConsultaDto, DiagnosticoConsultaDto, SignosVitalesDto } from './clinical-data.dto';

export const CONSULTA_ESTADOS = ['en_curso', 'completada'] as const;
export const CONSULTA_TIPOS = ['inicial', 'control', 'seguimiento', 'urgencia'] as const;

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

  @ApiProperty({ description: 'Tipo de consulta.', enum: CONSULTA_TIPOS, example: 'seguimiento' })
  @IsIn(CONSULTA_TIPOS)
  tipo: string;

  @ApiPropertyOptional({ description: 'Motivo de la consulta.' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  motivoConsulta?: string;

  @ApiPropertyOptional({ description: 'Padecimiento actual del paciente.' })
  @IsString()
  @IsOptional()
  @MaxLength(6000)
  padecimientoActual?: string;

  @ApiPropertyOptional({ description: 'Síntomas reportados.', type: [String] })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(250, { each: true })
  sintomas?: string[];

  @ApiPropertyOptional({ description: 'Signos vitales registrados.', type: Object })
  @IsOptional()
  @ValidateNested()
  @Type(() => SignosVitalesDto)
  signosVitales?: SignosVitalesDto;

  @ApiPropertyOptional({ description: 'Hallazgos de la exploración física.' })
  @IsString()
  @IsOptional()
  @MaxLength(6000)
  exploracionFisica?: string;

  @ApiPropertyOptional({ description: 'Antecedentes del paciente.', type: Object })
  @IsOptional()
  @ValidateNested()
  @Type(() => AntecedentesConsultaDto)
  antecedentes?: AntecedentesConsultaDto;

  @ApiPropertyOptional({ description: 'Diagnósticos de la consulta.', type: [Object] })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => DiagnosticoConsultaDto)
  diagnosticos?: DiagnosticoConsultaDto[];

  @ApiPropertyOptional({ description: 'Plan terapéutico indicado.', type: [String] })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(1000, { each: true })
  planTerapeutico?: string[];

  @ApiPropertyOptional({ description: 'Notas adicionales.' })
  @IsString()
  @IsOptional()
  @MaxLength(6000)
  notas?: string;

  @ApiPropertyOptional({ description: 'Duración de la consulta.' })
  @IsString()
  @IsOptional()
  @MaxLength(32)
  duracion?: string;

  @ApiPropertyOptional({ description: 'Estado de la consulta.', enum: CONSULTA_ESTADOS, default: 'en_curso' })
  @IsIn(CONSULTA_ESTADOS)
  @IsOptional()
  estado?: string;
}
