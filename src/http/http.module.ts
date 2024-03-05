import { Global, Module } from '@nestjs/common';
import { HttpModule as BaseHttpModule } from '@nestjs/axios';

@Global()
@Module({})
export class HttpModule extends BaseHttpModule {}
