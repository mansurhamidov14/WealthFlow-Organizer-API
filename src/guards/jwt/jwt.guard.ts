import { AuthGuard } from '@nestjs/passport';
import { JWT_STRATEGY_KEY } from './consts';

export class JwtGuard extends AuthGuard(JWT_STRATEGY_KEY) {}