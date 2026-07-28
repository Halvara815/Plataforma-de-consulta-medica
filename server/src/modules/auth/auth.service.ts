import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from '../../common/redis/redis.service';
import { AuditService } from './audit.service';
import { LoginDto } from './dto/login.dto';
import { RefreshToken } from './entities/refresh-token.entity';
import { Sesion } from './entities/sesion.entity';
import { Usuario } from './entities/usuario.entity';
import { LoginRateLimitService } from './login-rate-limit.service';
import { generateRefreshToken, hashRefreshToken, verifyPassword } from './password-hash';

export const REFRESH_COOKIE_NAME = 'consulta_refresh';

export type AuthenticatedUser = {
  id: string;
  email: string;
  nombre: string;
  medicoId: string | null;
  especialidad: string | null;
  roles: string[];
  permisos: string[];
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    @InjectRepository(Sesion)
    private readonly sesionesRepository: Repository<Sesion>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokensRepository: Repository<RefreshToken>,
    private readonly auditService: AuditService,
    private readonly loginRateLimitService: LoginRateLimitService,
    private readonly redisService: RedisService,
  ) {}

  async login(loginDto: LoginDto, correlationId?: string): Promise<{ accessToken: string; refreshToken: string; user: AuthenticatedUser }> {
    const email = loginDto.email.trim().toLowerCase();
    await this.loginRateLimitService.assertAllowed(email);
    const usuario = await this.findUserByEmail(email, true);

    if (!usuario || usuario.estado !== 'activo' || !await verifyPassword(loginDto.password, usuario.passwordHash)) {
      await this.loginRateLimitService.registerFailure(email);
      await this.auditService.record({
        accion: 'auth.login',
        recursoTipo: 'sesion',
        resultado: 'denegado',
        correlationId,
        metadata: { motivo: 'credenciales_invalidas' },
      });
      throw new UnauthorizedException('Credenciales inválidas');
    }

    await this.loginRateLimitService.reset(email);
    const refreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(refreshToken);
    const expiresAt = this.refreshExpiry();
    const sesion = await this.sesionesRepository.manager.transaction(async (manager) => {
      const sesionRepository = manager.getRepository(Sesion);
      const refreshRepository = manager.getRepository(RefreshToken);
      const created = await sesionRepository.save(sesionRepository.create({
        usuarioId: usuario.id,
        tokenHash,
        lastActivityAt: new Date(),
        expiresAt,
        revokedAt: null,
      }));
      await refreshRepository.save(refreshRepository.create({
        sesionId: created.id,
        tokenHash,
        expiresAt,
        consumedAt: null,
      }));
      return created;
    });
    const user = this.toAuthenticatedUser(usuario);
    const accessToken = await this.issueAccessToken(user.id, sesion.id);

    await this.auditService.record({
      usuarioId: usuario.id,
      accion: 'auth.login',
      recursoTipo: 'sesion',
      recursoId: sesion.id,
      resultado: 'exitoso',
      correlationId,
    });

    return { accessToken, refreshToken, user };
  }

  async refresh(refreshToken: string | undefined, correlationId?: string): Promise<{ accessToken: string; refreshToken: string; user: AuthenticatedUser }> {
    if (!refreshToken) throw new UnauthorizedException('Sesión no disponible');

    const receivedTokenHash = hashRefreshToken(refreshToken);
    const outcome: any = await this.sesionesRepository.manager.transaction(async (manager) => {
      const refreshRepository = manager.getRepository(RefreshToken);
      const sesionRepository = manager.getRepository(Sesion);
      const token = await refreshRepository
        .createQueryBuilder('refreshToken')
        .setLock('pessimistic_write')
        .where('refreshToken.tokenHash = :tokenHash', { tokenHash: receivedTokenHash })
        .getOne();

      if (!token) return { status: 'invalid' };
      const sesion = await sesionRepository
        .createQueryBuilder('sesion')
        .leftJoinAndSelect('sesion.usuario', 'usuario')
        .leftJoinAndSelect('usuario.roles', 'roles')
        .leftJoinAndSelect('roles.permisos', 'permisos')
        .leftJoinAndSelect('usuario.medico', 'medico')
        .where('sesion.id = :sesionId', { sesionId: token.sesionId })
        .getOne();
      if (!sesion) return { status: 'invalid' };
      const now = new Date();
      if (token.consumedAt) {
        if (!sesion.revokedAt) {
          sesion.revokedAt = new Date();
          await sesionRepository.save(sesion);
        }
        return { status: 'reused', sesion };
      }
      if (this.sessionIdleExpired(sesion, now)) {
        if (!sesion.revokedAt) {
          sesion.revokedAt = now;
          await sesionRepository.save(sesion);
        }
        return { status: 'idle', sesion };
      }
      if (sesion.revokedAt || sesion.expiresAt <= now || sesion.usuario.estado !== 'activo') {
        return { status: 'invalid' };
      }

      const nextRefreshToken = generateRefreshToken();
      const nextTokenHash = hashRefreshToken(nextRefreshToken);
      const nextExpiry = this.refreshExpiry();
      token.consumedAt = now;
      sesion.tokenHash = nextTokenHash;
      sesion.expiresAt = nextExpiry;
      sesion.lastActivityAt = now;
      await refreshRepository.save(token);
      await sesionRepository.save(sesion);
      await refreshRepository.save(refreshRepository.create({
        sesionId: sesion.id,
        tokenHash: nextTokenHash,
        expiresAt: nextExpiry,
        consumedAt: null,
      }));
      return { status: 'valid', sesion, nextRefreshToken };
    });

    if (outcome.status === 'reused') {
      await this.cacheRevocation(outcome.sesion);
      await this.auditService.record({
        usuarioId: outcome.sesion.usuarioId,
        accion: 'auth.refresh_reuse',
        recursoTipo: 'sesion',
        recursoId: outcome.sesion.id,
        resultado: 'denegado',
        correlationId,
        metadata: { motivo: 'refresh_token_reutilizado' },
      });
      throw new UnauthorizedException('Sesión invalidada por seguridad');
    }
    if (outcome.status === 'idle') {
      await this.cacheRevocation(outcome.sesion);
      await this.auditService.record({
        usuarioId: outcome.sesion.usuarioId,
        accion: 'auth.session_idle_timeout',
        recursoTipo: 'sesion',
        recursoId: outcome.sesion.id,
        resultado: 'denegado',
        correlationId,
        metadata: { motivo: 'inactividad' },
      });
      throw new UnauthorizedException('Sesión expirada por inactividad');
    }
    if (outcome.status !== 'valid') throw new UnauthorizedException('Sesión expirada o inválida');

    const user = this.toAuthenticatedUser(outcome.sesion.usuario);
    const accessToken = await this.issueAccessToken(user.id, outcome.sesion.id);
    await this.auditService.record({
      usuarioId: user.id,
      accion: 'auth.refresh',
      recursoTipo: 'sesion',
      recursoId: outcome.sesion.id,
      resultado: 'exitoso',
      correlationId,
    });

    return { accessToken, refreshToken: outcome.nextRefreshToken, user };
  }

  async logout(refreshToken: string | undefined, correlationId?: string): Promise<void> {
    if (!refreshToken) return;

    const sesion = await this.sesionesRepository.findOneBy({ tokenHash: hashRefreshToken(refreshToken) });
    if (!sesion || sesion.revokedAt) return;

    sesion.revokedAt = new Date();
    await this.sesionesRepository.save(sesion);
    await this.cacheRevocation(sesion);
    await this.auditService.record({
      usuarioId: sesion.usuarioId,
      accion: 'auth.logout',
      recursoTipo: 'sesion',
      recursoId: sesion.id,
      resultado: 'exitoso',
      correlationId,
    });
  }

  async getMe(usuarioId: string): Promise<AuthenticatedUser> {
    const usuario = await this.findUserById(usuarioId);
    if (!usuario || usuario.estado !== 'activo') throw new UnauthorizedException('Sesión inválida');
    return this.toAuthenticatedUser(usuario);
  }

  async validateAccessToken(usuarioId: string, sesionId: string): Promise<AuthenticatedUser> {
    if (await this.redisService.get(this.revocationKey(sesionId))) {
      throw new UnauthorizedException('Sesión expirada o revocada');
    }
    const sesion = await this.sesionesRepository.findOneBy({ id: sesionId, usuarioId });
    const now = new Date();
    if (!sesion || sesion.revokedAt || sesion.expiresAt <= now) {
      throw new UnauthorizedException('Sesión expirada o revocada');
    }
    if (this.sessionIdleExpired(sesion, now)) {
      sesion.revokedAt = now;
      await this.sesionesRepository.save(sesion);
      await this.cacheRevocation(sesion);
      await this.auditService.record({
        usuarioId,
        accion: 'auth.session_idle_timeout',
        recursoTipo: 'sesion',
        recursoId: sesion.id,
        resultado: 'denegado',
        metadata: { motivo: 'inactividad' },
      });
      throw new UnauthorizedException('Sesión expirada por inactividad');
    }
    await this.sesionesRepository.update({ id: sesion.id }, { lastActivityAt: now });
    return this.getMe(usuarioId);
  }

  getRefreshCookieMaxAge(): number {
    return this.refreshTtlDays() * 24 * 60 * 60 * 1000;
  }

  private async issueAccessToken(usuarioId: string, sesionId: string): Promise<string> {
    return this.jwtService.signAsync({ sub: usuarioId, sid: sesionId });
  }

  private async findUserByEmail(email: string, includePasswordHash = false): Promise<Usuario | null> {
    const query = this.userQuery()
      .where('LOWER(usuario.email) = :email', { email: email.toLowerCase() });
    if (includePasswordHash) query.addSelect('usuario.passwordHash');
    return query.getOne();
  }

  private async findUserById(id: string): Promise<Usuario | null> {
    return this.userQuery().where('usuario.id = :id', { id }).getOne();
  }

  private userQuery() {
    return this.usuariosRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.roles', 'roles')
      .leftJoinAndSelect('roles.permisos', 'permisos')
      .leftJoinAndSelect('usuario.medico', 'medico');
  }

  private toAuthenticatedUser(usuario: Usuario): AuthenticatedUser {
    const permisos = new Set(usuario.roles.flatMap((rol) => rol.permisos.map((permiso) => permiso.clave)));
    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      medicoId: usuario.medicoId,
      especialidad: usuario.medico?.especialidad ?? null,
      roles: usuario.roles.map((rol) => rol.nombre),
      permisos: [...permisos].sort(),
    };
  }

  private refreshExpiry(): Date {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + this.refreshTtlDays());
    return expiry;
  }

  private refreshTtlDays(): number {
    return Number(this.configService.get<string>('JWT_REFRESH_TTL_DAYS', '7'));
  }

  private sessionIdleExpired(sesion: Sesion, now: Date): boolean {
    const lastActivity = sesion.lastActivityAt ?? sesion.createdAt;
    return lastActivity.getTime() <= now.getTime() - this.sessionIdleTtlMinutes() * 60_000;
  }

  private sessionIdleTtlMinutes(): number {
    const configured = Number(this.configService.get<string>('SESSION_IDLE_TTL_MINUTES', '60'));
    return Number.isFinite(configured) && configured > 0 ? configured : 60;
  }

  private async cacheRevocation(sesion: Sesion): Promise<void> {
    const seconds = Math.max(1, Math.ceil((sesion.expiresAt.getTime() - Date.now()) / 1_000));
    await this.redisService.setWithExpiry(this.revocationKey(sesion.id), '1', seconds);
  }

  private revocationKey(sesionId: string): string {
    return `auth:revoked-session:${sesionId}`;
  }
}
