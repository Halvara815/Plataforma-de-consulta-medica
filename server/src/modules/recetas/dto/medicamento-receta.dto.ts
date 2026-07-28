import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

export const VIAS_ADMINISTRACION = ['Oral', 'Tópica', 'Inyectable', 'Inhalada'] as const;

export class MedicamentoRecetaDto {
  @IsString()
  @MaxLength(200)
  nombre: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  concentracion?: string;

  @IsString()
  @MaxLength(160)
  dosis: string;

  @IsString()
  @MaxLength(160)
  frecuencia: string;

  @IsString()
  @MaxLength(160)
  duracion: string;

  @IsIn(VIAS_ADMINISTRACION)
  via: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  indicaciones?: string;
}

export class InteraccionRecetaDto {
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  medicamentos: string[];

  @IsString()
  @MaxLength(1000)
  descripcion: string;

  @IsOptional()
  @IsIn(['baja', 'media', 'alta'])
  severidad?: string;
}

export class MedicamentosRecetaDto {
  @ValidateNested({ each: true })
  @Type(() => MedicamentoRecetaDto)
  medicamentos: MedicamentoRecetaDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => InteraccionRecetaDto)
  interacciones?: InteraccionRecetaDto[];
}
