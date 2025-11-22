// src/auth/strategies/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config'; // NOVO: Para ler o segredo
import { UsersService } from 'src/users/users.service'; // NOVO: Para buscar o usuário completo e o cargo

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService, // INJETADO
    private usersService: UsersService, // INJETADO
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), 
      ignoreExpiration: false, 
      secretOrKey: configService.get<string>('JWT_SECRET'), 
    });
  }
  async validate(payload: any) {
    const user = await this.usersService.findOneById(payload.sub); 
    if (!user) {
        throw new UnauthorizedException('Usuário não encontrado ou inativo.');
    }
    return { 
        id: user!.id, 
        email: user!.email, 
        role: user!.role, 
        companyId: user!.companyId
    };
  }
}