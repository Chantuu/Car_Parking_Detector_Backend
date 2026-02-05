import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieSession from 'cookie-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //#region Cookie Session Setup
  const configService = app.get<ConfigService>(ConfigService);
  const sessionSecret = configService.get<string>('SESSION_SECRET'); // Get Cookie Session Secret Key

  if (!sessionSecret) {
    throw new Error('SESSION_SECRET environment variable is not defined.');
  }
  app.use(
    cookieSession({
      keys: [sessionSecret], // Set Cookie Session Secret Key
      maxAge: 24 * 60 * 60 * 1000, // Cookie Session is valid for 24 hours
    }),
  );
  //#endregion

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Removes any properties not specified in DTOs
    }),
  );

  // Enable Cross-Origin Resource Sharin
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
