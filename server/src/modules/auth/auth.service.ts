import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // TODO: En Fase 5 conectar a la base de datos (Entidad Usuario/Médico)
    // Por ahora, simulamos validación hardcodeada basada en estado actual
    if (email !== 'admin@consultamedica.com' || password !== 'admin123') {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { 
      sub: 'MED-0001', // id del médico
      email: email, 
      role: 'medico' 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: payload.sub,
        email: payload.email,
        nombre: 'Dr. Carlos Pérez',
        especialidad: 'Médico General',
      }
    };
  }
}
