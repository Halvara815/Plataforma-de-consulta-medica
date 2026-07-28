import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsObject, IsInt, IsUUID } from 'class-validator';

export class CreateRecetaDto {
  @ApiProperty({ description: 'Paciente al que se prescribe la receta.', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  pacienteId: string;

  @ApiProperty({ description: 'Médico que prescribe la receta.', format: 'uuid' })
  @IsUUID()
  @IsNotEmpty()
  medicoId: string;

  @ApiProperty({ description: 'Fecha de la receta (ISO 8601).' })
  @IsString()
  @IsNotEmpty()
  fecha: string;

  @ApiProperty({ description: 'Tipo de receta.', example: 'ambulatoria' })
  @IsString()
  @IsNotEmpty()
  tipo: string; // 'ambulatoria' | 'controlado'

  @ApiPropertyOptional({ description: 'Vigencia de la receta en días.' })
  @IsInt()
  @IsOptional()
  vigenciaDias?: number;

  @ApiPropertyOptional({ description: 'Medicamentos prescritos.', type: [Object] })
  @IsArray()
  @IsOptional()
  medicamentos?: object[];

  @ApiPropertyOptional({ description: 'Interacciones detectadas entre los medicamentos.', type: [Object] })
  @IsArray()
  @IsOptional()
  interacciones?: object[];

  @ApiPropertyOptional({ description: 'Notas para el paciente.' })
  @IsString()
  @IsOptional()
  notasPaciente?: string;

  @ApiPropertyOptional({ description: 'Firma del médico prescriptor.', type: Object })
  @IsObject()
  @IsOptional()
  firma?: object;

  @ApiPropertyOptional({ description: 'Estado de la receta.', default: 'activa' })
  @IsString()
  @IsOptional()
  estado?: string;
}
