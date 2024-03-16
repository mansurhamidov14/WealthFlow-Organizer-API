import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('v1');
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,POST,PUT,PATCH,OPTIONS',
    allowedHeaders: 'Access-Key'
  });
  await app.listen(3000);
}
bootstrap();
