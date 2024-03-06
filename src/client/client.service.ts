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
    
    const { data } = await firstValueFrom(
      this.httpClient.get(`https://ipapi.co/${ip}/json/`).pipe()
    );
    return data;
  }

  getIp(request: Request) {
    return request.ip === '::1' ? this.config.get('LOCAL_SERVER_IP') : request.ip;
  }
}
