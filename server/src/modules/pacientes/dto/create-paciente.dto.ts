import { IsString, IsNotEmpty, IsOptional, IsArray, IsObject } from 'class-validator';

export class CreatePacienteDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  apellidos: string;

  @IsString()
  @IsNotEmpty()
  fechaNacimiento: string;

  @IsString()
  @IsNotEmpty()
  sexo: string;

  @IsString()
  @IsOptional()
  estadoCivil?: string;

  @IsString()
  @IsOptional()
  grupoSanguineo?: string;

  @IsString()
  @IsOptional()
  curp?: string;

  @IsString()
  @IsOptional()
  nss?: string;

  @IsObject()
  @IsOptional()
  contacto?: object;

  @IsObject()
  @IsOptional()
  aseguradora?: object;

  @IsObject()
  @IsOptional()
  contactoEmergencia?: object;

  @IsArray()
  @IsOptional()
  alergias?: object[];

  @IsArray()
  @IsOptional()
  alertas?: object[];
}
