import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');
  app.enableCors({
    origin: process.env.ALLOW_ORIGIN || 'http://localhost:5173',
    methods: 'GET,POST,PUT,PATCH,OPTIONS',
    allowedHeaders: 'Access-Key'
  });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
