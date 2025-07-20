import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ HABILITAR CORS
  app.enableCors({
    origin: 'http://localhost:5173', // o '*', pero más seguro poner tu dominio
    credentials: true,
  });
  
  await app.listen(process.env.PORT ?? 3020);
}
bootstrap();
