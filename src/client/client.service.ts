import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ClientService {
  constructor(private httpClient: HttpService, private config: ConfigService) {}
  async getInfo(request: Request) {
    const ip = this.getIp(request);

    if (this.isLocalhost(ip)) {
      return {
        ip: '127.0.0.1',
        conuntry_name: 'Azerbaijan',
        country_code: 'AZ',
        currency: 'AZN',
        city: 'Baku',
        timezone: 'Asia/Baku'
      };
    }
    
    const { data } = await firstValueFrom(
      this.httpClient.get(`https://ipapi.co/${ip}/json/`).pipe()
    );
    return data;
  }

  getIp(request: Request) {
    const forwarded = request.headers['x-forwarded-for'] as string | undefined;

    if (!forwarded) {
      return request.ip;
    }

    return forwarded.split(',')[0];
  }

  isLocalhost(ip: string) {
    return ['::1', '127.0.0.1'].includes(ip)
  }
}
