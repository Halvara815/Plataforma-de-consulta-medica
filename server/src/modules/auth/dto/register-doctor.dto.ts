import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDoctorDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(120, { message: 'El nombre no puede superar 120 caracteres' })
  nombre: string;

  @IsEmail({}, { message: 'El formato de correo es inválido' })
  email: string;

  @IsString()
  @MinLength(12, { message: 'La contraseña debe tener al menos 12 caracteres' })
  @MaxLength(128, { message: 'La contraseña no puede superar 128 caracteres' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'La especialidad es obligatoria' })
  @MaxLength(120, { message: 'La especialidad no puede superar 120 caracteres' })
  especialidad: string;

  @IsString()
  @IsNotEmpty({ message: 'La cédula profesional es obligatoria' })
  @MaxLength(80, { message: 'La cédula no puede superar 80 caracteres' })
  cedula: string;

  @IsOptional()
  @IsString()
  @MaxLength(120, { message: 'El consultorio no puede superar 120 caracteres' })
  consultorio?: string;
}
