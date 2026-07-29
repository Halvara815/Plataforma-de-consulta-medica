import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsDateString, IsIn, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';

export const FAVORITOS_DISPONIBLES = [
  'nuevo-paciente',
  'nueva-consulta',
  'nueva-receta',
  'agenda',
  'reportes',
  'documentos',
  'calc-imc',
  'config',
] as const;

export class NotaPersonalDto {
  @IsString()
  @MaxLength(80)
  id: string;

  @IsString()
  @MaxLength(160)
  titulo: string;

  @IsString()
  @MaxLength(10_000)
  cuerpo: string;

  @IsDateString()
  fecha: string;
}

export class RecordatorioPersonalDto {
  @IsString()
  @MaxLength(80)
  id: string;

  @IsString()
  @MaxLength(160)
  titulo: string;

  @IsDateString()
  fecha: string;

  @IsBoolean()
  done: boolean;
}

export class PlantillaPersonalDto {
  @IsString()
  @MaxLength(80)
  id: string;

  @IsString()
  @MaxLength(160)
  titulo: string;

  @IsString()
  @MaxLength(20_000)
  cuerpo: string;
}

export class UpdatePreferenciasDto {
  @IsOptional()
  @IsIn(['light', 'dark', 'system'])
  tema?: 'light' | 'dark' | 'system';

  @IsOptional()
  @IsBoolean()
  sonidoTemporizador?: boolean;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => NotaPersonalDto)
  notas?: NotaPersonalDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => RecordatorioPersonalDto)
  recordatorios?: RecordatorioPersonalDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => PlantillaPersonalDto)
  plantillas?: PlantillaPersonalDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(FAVORITOS_DISPONIBLES.length)
  @IsIn(FAVORITOS_DISPONIBLES, { each: true })
  favoritos?: string[];
}
