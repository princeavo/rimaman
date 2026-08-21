import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from '../auth.service';

/**
 * Protège les routes admin. Lit le JWT depuis un cookie httpOnly (jamais
 * depuis un header Authorization rempli par du JS côté frontend), pour
 * limiter l'exposition du token en cas de XSS.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.cookies?.['access_token'];

    if (!token) {
      throw new UnauthorizedException('Authentification requise');
    }

    try {
      const payload = await this.authService.verifyAccessToken(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Session invalide ou expirée');
    }
  }
}
