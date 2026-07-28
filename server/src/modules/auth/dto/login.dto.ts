import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El formato de correo es inválido' })
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}
