import { ClientService } from '@app/client/client.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const md5 = require('md5');

@Injectable()
export class AccessKeyGuard implements CanActivate {
  constructor(private config: ConfigService, private clientService: ClientService) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const ip = this.clientService.getIp(request);
    const validKey = md5(this.config.get('CURRENCY_RATES_ACCESS_SALT') + md5(ip));
    return request.headers?.['access-key'] === validKey;
  }
}