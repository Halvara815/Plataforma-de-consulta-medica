import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { RedisService } from '../../common/redis/redis.service';

type LocalCounter = { attempts: number; expiresAt: number };

@Injectable()
export class LoginRateLimitService {
  private readonly localCounters = new Map<string, LocalCounter>();
  private readonly maxAttempts: number;
  private readonly windowSeconds: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.maxAttempts = this.positiveNumber('AUTH_LOGIN_MAX_ATTEMPTS', 5);
    this.windowSeconds = this.positiveNumber('AUTH_LOGIN_WINDOW_SECONDS', 900);
  }

  async assertAllowed(identifier: string): Promise<void> {
    const status = await this.counterStatus(this.key(identifier));
    if (status.attempts < this.maxAttempts) return;

    throw new HttpException({
      message: 'Demasiados intentos. Espera antes de volver a intentarlo.',
      retryAfterSeconds: Math.max(1, status.remainingSeconds),
    }, HttpStatus.TOO_MANY_REQUESTS);
  }

  async registerFailure(identifier: string): Promise<void> {
    const key = this.key(identifier);
    if (this.redisService.isAvailable()) {
      const attempts = await this.redisService.increment(key);
      if (attempts !== null) {
        if (attempts === 1) await this.redisService.expire(key, this.windowSeconds);
        return;
      }
    }

    const now = Date.now();
    const current = this.localCounters.get(key);
    if (!current || current.expiresAt <= now) {
      this.localCounters.set(key, { attempts: 1, expiresAt: now + this.windowSeconds * 1_000 });
      return;
    }
    current.attempts += 1;
  }

  async reset(identifier: string): Promise<void> {
    const key = this.key(identifier);
    if (this.redisService.isAvailable()) await this.redisService.delete(key);
    this.localCounters.delete(key);
  }

  private async counterStatus(key: string): Promise<{ attempts: number; remainingSeconds: number }> {
    if (this.redisService.isAvailable()) {
      const [value, ttl] = await Promise.all([this.redisService.get(key), this.redisService.ttl(key)]);
      if (value !== null) {
        return { attempts: Number(value) || 0, remainingSeconds: ttl && ttl > 0 ? ttl : this.windowSeconds };
      }
    }

    const local = this.localCounters.get(key);
    if (!local) return { attempts: 0, remainingSeconds: 0 };
    const remainingMilliseconds = local.expiresAt - Date.now();
    if (remainingMilliseconds <= 0) {
      this.localCounters.delete(key);
      return { attempts: 0, remainingSeconds: 0 };
    }
    return { attempts: local.attempts, remainingSeconds: Math.ceil(remainingMilliseconds / 1_000) };
  }

  private key(identifier: string): string {
    const secret = this.configService.getOrThrow<string>('JWT_SECRET');
    const digest = createHmac('sha256', secret)
      .update(identifier.trim().toLowerCase())
      .digest('base64url');
    return `auth:login:${digest}`;
  }

  private positiveNumber(name: string, fallback: number): number {
    const value = Number(this.configService.get<string>(name, String(fallback)));
    return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback;
  }
}
