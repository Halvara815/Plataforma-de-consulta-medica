import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsObject } from 'class-validator';

export class CreatePacienteDto {
  @ApiProperty({ description: 'Nombre del paciente.' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @ApiProperty({ description: 'Apellidos del paciente.' })
  @IsString()
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  apellidos: string;

  @ApiProperty({ description: 'Fecha de nacimiento (ISO 8601).', example: '1990-01-01' })
  @IsString()
  @IsNotEmpty()
  fechaNacimiento: string;

  @ApiProperty({ description: 'Sexo del paciente.' })
  @IsString()
  @IsNotEmpty()
  sexo: string;

  @ApiPropertyOptional({ description: 'Estado civil del paciente.' })
  @IsString()
  @IsOptional()
  estadoCivil?: string;

  @ApiPropertyOptional({ description: 'Grupo sanguíneo del paciente.' })
  @IsString()
  @IsOptional()
  grupoSanguineo?: string;

  @ApiPropertyOptional({ description: 'CURP del paciente.' })
  @IsString()
  @IsOptional()
  curp?: string;

  @ApiPropertyOptional({ description: 'Número de Seguridad Social del paciente.' })
  @IsString()
  @IsOptional()
  nss?: string;

  @ApiPropertyOptional({ description: 'Datos de contacto del paciente.', type: Object })
  @IsObject()
  @IsOptional()
  contacto?: object;

  @ApiPropertyOptional({ description: 'Datos de la aseguradora del paciente.', type: Object })
  @IsObject()
  @IsOptional()
  aseguradora?: object;

  @ApiPropertyOptional({ description: 'Contacto de emergencia del paciente.', type: Object })
  @IsObject()
  @IsOptional()
  contactoEmergencia?: object;

  @ApiPropertyOptional({ description: 'Alergias registradas del paciente.', type: [Object] })
  @IsArray()
  @IsOptional()
  alergias?: object[];

  @ApiPropertyOptional({ description: 'Alertas clínicas del paciente.', type: [Object] })
  @IsArray()
  @IsOptional()
  alertas?: object[];
}
