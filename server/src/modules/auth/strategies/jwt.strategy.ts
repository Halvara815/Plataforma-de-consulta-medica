import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'super-secret-key-change-me'),
    });
  }

  async validate(payload: any) {
    // Aquí puedes validar si el usuario sigue existiendo en BD o está activo
    if (!payload.sub) {
      throw new UnauthorizedException('Token inválido');
    }
    
    // Retorna el usuario inyectado en el request (req.user)
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
