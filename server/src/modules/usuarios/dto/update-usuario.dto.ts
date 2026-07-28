import { ArrayNotEmpty, IsArray, IsEmail, IsIn, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class UpdateUsuarioDto {
  @IsOptional()
  @IsEmail({}, { message: 'El formato de correo es inválido' })
  email?: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  @MinLength(12, { message: 'La contraseña debe tener al menos 12 caracteres' })
  password?: string;

  @IsOptional()
  @IsIn(['activo', 'inactivo'], { message: 'El estado debe ser activo o inactivo' })
  estado?: 'activo' | 'inactivo';

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({ message: 'Asigna al menos un rol' })
  @IsString({ each: true })
  roleNames?: string[];

  @IsOptional()
  @IsUUID('4', { message: 'El médico asignado no es válido' })
  medicoId?: string | null;
}
