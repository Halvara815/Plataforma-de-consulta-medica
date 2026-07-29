import { Transform } from 'class-transformer';
import { IsArray, IsOptional, IsString, MaxLength } from 'class-validator';

function toTags(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (Array.isArray(value)) return value.map(String);
  return String(value).split(',').map((tag) => tag.trim()).filter(Boolean);
}

export class UpdateDocumentoDto {
  @IsOptional()
  @IsString()
  @MaxLength(180, { message: 'El nombre no puede superar 180 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120, { message: 'La categoría no puede superar 120 caracteres' })
  categoria?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120, { message: 'La modalidad no puede superar 120 caracteres' })
  modalidad?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120, { message: 'El técnico no puede superar 120 caracteres' })
  tecnico?: string;

  @IsOptional()
  @Transform(({ value }) => toTags(value))
  @IsArray({ message: 'Las etiquetas no son válidas' })
  @IsString({ each: true })
  @MaxLength(60, { each: true, message: 'Cada etiqueta no puede superar 60 caracteres' })
  tags?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(2_000, { message: 'La descripción no puede superar 2000 caracteres' })
  descripcion?: string;
}
