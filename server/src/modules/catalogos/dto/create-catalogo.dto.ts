import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';
import { CATALOGO_TIPOS } from '../entities/catalogo-clinico.entity';

export const CATALOGO_ESTADOS = ['activo', 'inactivo'] as const;

export class CreateCatalogoDto {
  @ApiProperty({ enum: CATALOGO_TIPOS })
  @IsIn(CATALOGO_TIPOS)
  tipo: string;

  @ApiProperty({ description: 'Clave estable y única dentro del tipo de catálogo.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  codigo: string;

  @ApiProperty({ description: 'Nombre visible para el personal clínico.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  nombre: string;

  @ApiPropertyOptional({ description: 'Atributos específicos del catálogo (presentaciones, severidad, etc.).', type: Object })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: CATALOGO_ESTADOS, default: 'activo' })
  @IsIn(CATALOGO_ESTADOS)
  @IsOptional()
  estado?: string;
}
