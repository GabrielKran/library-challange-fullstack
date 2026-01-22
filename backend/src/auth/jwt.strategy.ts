import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // 1. Onde buscar o token? No cabeçalho da requisição (Bearer Token)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 2. Aceita token vencido? Não.
      ignoreExpiration: false,
      // 3. Qual a chave secreta para validar? Pega do .env
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  // Se o token for válido, isso roda e devolve os dados do usuário
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}