import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

type DownloadTicketPayload = {
  documentoId: string;
  usuarioId: string;
  exp: number;
};

@Injectable()
export class DocumentDownloadTokenService {
  constructor(private readonly configService: ConfigService) {}

  create(documentoId: string, usuarioId: string): { token: string; expiresAt: Date } {
    const expiresAt = new Date(Date.now() + this.ttlSeconds() * 1_000);
    const payload: DownloadTicketPayload = {
      documentoId,
      usuarioId,
      exp: Math.floor(expiresAt.getTime() / 1_000),
    };
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return {
      token: encodedPayload + '.' + this.sign(encodedPayload),
      expiresAt,
    };
  }

  verify(token: string | undefined): DownloadTicketPayload {
    if (!token) throw new UnauthorizedException('El enlace de descarga no es válido');
    const [encodedPayload, signature, extra] = token.split('.');
    if (!encodedPayload || !signature || extra) throw new UnauthorizedException('El enlace de descarga no es válido');

    const expectedSignature = this.sign(encodedPayload);
    const received = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
      throw new UnauthorizedException('El enlace de descarga no es válido');
    }

    try {
      const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as DownloadTicketPayload;
      if (!this.isPayloadValid(payload) || payload.exp <= Math.floor(Date.now() / 1_000)) {
        throw new UnauthorizedException('El enlace de descarga expiró');
      }
      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('El enlace de descarga no es válido');
    }
  }

  private sign(value: string): string {
    return createHmac('sha256', this.signingSecret()).update(value).digest('base64url');
  }

  private signingSecret(): string {
    return this.configService.get<string>('DOCUMENTS_SIGNING_SECRET')
      || this.configService.getOrThrow<string>('JWT_SECRET');
  }

  private ttlSeconds(): number {
    const value = Number(this.configService.get<string>('DOCUMENTS_SIGNED_URL_TTL_SECONDS', '300'));
    return Number.isFinite(value) && value >= 30 && value <= 3_600 ? value : 300;
  }

  private isPayloadValid(payload: DownloadTicketPayload): boolean {
    return Boolean(
      payload
      && typeof payload.documentoId === 'string'
      && typeof payload.usuarioId === 'string'
      && Number.isInteger(payload.exp),
    );
  }
}
