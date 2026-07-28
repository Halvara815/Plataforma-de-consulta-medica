import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly prefix: string;
  private client: Redis | null = null;
  private ready = false;
  private warnedUnavailable = false;

  constructor(private readonly configService: ConfigService) {
    this.prefix = this.configService.get<string>('REDIS_KEY_PREFIX', 'consulta_medica:');
  }

  async onModuleInit(): Promise<void> {
    if (this.configService.get<string>('REDIS_ENABLED', 'false').trim().toLowerCase() !== 'true') {
      this.logger.log(JSON.stringify({ event: 'redis.disabled', fallback: 'local_rate_limit' }));
      return;
    }

    const password = this.configService.get<string>('REDIS_PASSWORD');
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', '127.0.0.1'),
      port: Number(this.configService.get<string>('REDIS_PORT', '6379')),
      password: password || undefined,
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 2_000,
      retryStrategy: () => null,
    });
    this.client.on('error', () => this.warnUnavailable());

    try {
      await this.client.connect();
      this.ready = true;
      this.logger.log(JSON.stringify({ event: 'redis.connected' }));
    } catch {
      this.ready = false;
      this.warnUnavailable();
      if (this.configService.get<string>('REDIS_REQUIRED', 'false') === 'true') {
        throw new Error('Redis es obligatorio, pero no se pudo conectar.');
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client?.status === 'ready') await this.client.quit();
    else this.client?.disconnect();
    this.ready = false;
  }

  isAvailable(): boolean {
    return this.ready && this.client?.status === 'ready';
  }

  async get(key: string): Promise<string | null> {
    return this.execute(() => this.client!.get(this.key(key)));
  }

  async increment(key: string): Promise<number | null> {
    return this.execute(() => this.client!.incr(this.key(key)));
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    const result = await this.execute(() => this.client!.expire(this.key(key), seconds));
    return result === 1;
  }

  async ttl(key: string): Promise<number | null> {
    return this.execute(() => this.client!.ttl(this.key(key)));
  }

  async setWithExpiry(key: string, value: string, seconds: number): Promise<boolean> {
    const result = await this.execute(() => this.client!.set(this.key(key), value, 'EX', seconds));
    return result === 'OK';
  }

  async delete(key: string): Promise<void> {
    await this.execute(() => this.client!.del(this.key(key)));
  }

  private key(key: string): string {
    return `${this.prefix}${key}`;
  }

  private async execute<T>(operation: () => Promise<T>): Promise<T | null> {
    if (!this.isAvailable()) return null;
    try {
      return await operation();
    } catch {
      this.ready = false;
      this.warnUnavailable();
      return null;
    }
  }

  private warnUnavailable(): void {
    if (this.warnedUnavailable) return;
    this.warnedUnavailable = true;
    this.logger.warn(JSON.stringify({ event: 'redis.unavailable', fallback: 'local_rate_limit' }));
  }
}
