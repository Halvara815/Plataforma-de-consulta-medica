import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Usuario } from './entities/usuario.entity';
import { Sesion } from './entities/sesion.entity';
import { Auditoria } from './entities/auditoria.entity';
import { AuditService } from './audit.service';
import { LoginRateLimitService } from './login-rate-limit.service';
import { RedisModule } from '../../common/redis/redis.module';
import { RefreshToken } from './entities/refresh-token.entity';
import { Medico } from '../medicos/entities/medico.entity';
import { Rol } from './entities/rol.entity';

@Global()
@Module({
  imports: [
    RedisModule,
    TypeOrmModule.forFeature([Usuario, Sesion, RefreshToken, Auditoria, Medico, Rol]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_TTL', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuditService, LoginRateLimitService],
  exports: [AuthService, AuditService],
})
export class AuthModule {}
