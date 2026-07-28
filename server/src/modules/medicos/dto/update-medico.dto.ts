import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateMedicoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  @MaxLength(120, { message: 'El nombre no puede superar 120 caracteres' })
  nombre?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'La especialidad no puede estar vacía' })
  @MaxLength(120, { message: 'La especialidad no puede superar 120 caracteres' })
  especialidad?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'La cédula no puede estar vacía' })
  @MaxLength(80, { message: 'La cédula no puede superar 80 caracteres' })
  cedula?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120, { message: 'El consultorio no puede superar 120 caracteres' })
  consultorio?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2_000, { message: 'La firma no puede superar 2000 caracteres' })
  firma?: string | null;

  @IsOptional()
  @IsIn(['pendiente', 'activo', 'inactivo'], { message: 'El estado no es válido' })
  estado?: 'pendiente' | 'activo' | 'inactivo';
}
