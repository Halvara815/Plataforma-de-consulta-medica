import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { InteraccionRecetaDto, MedicamentoRecetaDto } from './medicamento-receta.dto';

export const RECETA_TIPOS = ['ambulatoria', 'controlado', 'especial'] as const;
export const RECETA_ESTADOS = ['activa', 'surtida', 'cancelada', 'vencida'] as const;

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
  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @ApiProperty({ description: 'Tipo de receta.', enum: RECETA_TIPOS, example: 'ambulatoria' })
  @IsIn(RECETA_TIPOS)
  tipo: string;

  @ApiPropertyOptional({ description: 'Vigencia de la receta en días.', minimum: 1, maximum: 365 })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(365)
  vigenciaDias?: number;

  @ApiProperty({ description: 'Medicamentos prescritos.', type: [Object] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => MedicamentoRecetaDto)
  medicamentos: MedicamentoRecetaDto[];

  @ApiPropertyOptional({ description: 'Interacciones detectadas entre los medicamentos.', type: [Object] })
  @IsArray()
  @IsOptional()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => InteraccionRecetaDto)
  interacciones?: InteraccionRecetaDto[];

  @ApiPropertyOptional({ description: 'Notas para el paciente.' })
  @IsString()
  @IsOptional()
  @MaxLength(4000)
  notasPaciente?: string;
}
