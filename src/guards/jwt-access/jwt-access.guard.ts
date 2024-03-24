import { AuthGuard } from '@nestjs/passport';
import { JWT_ACCESS_STRATEGY_KEY } from '../consts';

export class JwtAccessGuard extends AuthGuard(JWT_ACCESS_STRATEGY_KEY) {}