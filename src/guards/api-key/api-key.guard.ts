import { ClientService } from '@app/client/client.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const md5 = require('md5');

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private config: ConfigService, private clientService: ClientService) {}
  canActivate(context: ExecutionContext): boolean {
    if (this.config.get('DISABLE_API_KEY_GUARD') == '1') {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const ip = this.clientService.getIp(request);
    const validKey = md5(this.config.get('API_KEY_SALT') + md5(ip));
    return request.headers?.['api-key'] === validKey;
  }
}