import { AuthGuard } from '@nestjs/passport';
import { JWT_REFRESH_STRATEGY_KEY } from '../consts';

export class JwtRefreshGuard extends AuthGuard(JWT_REFRESH_STRATEGY_KEY) {}