import { ArrayNotEmpty, IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsEmail({}, { message: 'El formato de correo es inválido' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString()
  @MinLength(12, { message: 'La contraseña debe tener al menos 12 caracteres' })
  password: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Asigna al menos un rol' })
  @IsString({ each: true })
  roleNames: string[];

  @IsOptional()
  @IsUUID('4', { message: 'El médico asignado no es válido' })
  medicoId?: string | null;
}
