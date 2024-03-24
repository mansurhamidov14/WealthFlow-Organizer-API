import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT_REFRESH_STRATEGY_KEY } from '../consts';

@Injectable()
export class JwtRefreshtrategy extends PassportStrategy(Strategy, JWT_REFRESH_STRATEGY_KEY) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_REFRESH_SECRET')
    });
  }

  validate(payload: any) {
    return payload;
  }
}