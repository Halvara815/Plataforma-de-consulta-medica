import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export const DIAGNOSTICO_TIPOS = ['presuntivo', 'definitivo', 'diferencial'] as const;

export class SignosVitalesDto {
  @IsOptional()
  @IsString()
  @Matches(/^\d{2,3}\/\d{2,3}$/)
  ta?: string;

  @IsOptional()
  @IsInt()
  @Min(20)
  @Max(300)
  fc?: number;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(100)
  fr?: number;

  @IsOptional()
  @Min(30)
  @Max(45)
  temp?: number;

  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(100)
  spo2?: number;

  @IsOptional()
  @Min(0.5)
  @Max(500)
  peso?: number;

  @IsOptional()
  @Min(30)
  @Max(250)
  talla?: number;
}

export class AntecedentesConsultaDto {
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  heredofamiliares?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  personalesPatologicos?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  personalesNoPatologicos?: string;
}

export class DiagnosticoConsultaDto {
  @IsString()
  @Matches(/^[A-TV-Z][0-9]{2}(?:\.[0-9A-Z]{1,4})?$/i)
  cie10: string;

  @IsString()
  @MaxLength(500)
  descripcion: string;

  @IsIn(DIAGNOSTICO_TIPOS)
  tipo: string;

  @IsOptional()
  @IsBoolean()
  principal?: boolean;
}

export class DatosConsultaDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => SignosVitalesDto)
  signosVitales?: SignosVitalesDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AntecedentesConsultaDto)
  antecedentes?: AntecedentesConsultaDto;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => DiagnosticoConsultaDto)
  diagnosticos?: DiagnosticoConsultaDto[];
}
