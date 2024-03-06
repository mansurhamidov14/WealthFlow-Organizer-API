import { Controller, Get, Req } from '@nestjs/common';
import { Request } from 'express';
import { ClientService } from './client.service';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('info')
  async getClientInfo(@Req() request: Request) {
    return this.clientService.getInfo(request);
  }
}
