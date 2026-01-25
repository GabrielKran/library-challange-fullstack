import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // 1. Procura o token no header da requisição
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. Nçao aceita token vencido
      ignoreExpiration: false,
      // 3. Pega a secret na env
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  // Se o token for válido, isso roda e devolve os dados do usuário
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}