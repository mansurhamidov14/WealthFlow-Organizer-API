import { HttpService } from '@nestjs/axios';
import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';

@Controller('client')
export class ClientController {
  constructor(private readonly httpService: HttpService) {}

  @Get('info')
  async getClientInfo(@Req() request: Request) {
    const ip = request.ip === '::1' ? '185.130.54.124' : request.ip;
    
    const { data } = await firstValueFrom(
      this.httpService.get(`https://ipapi.co/${ip}/json/`).pipe()
    );
    return data;
  }
}
