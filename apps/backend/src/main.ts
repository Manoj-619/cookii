import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Global Prefix
  const apiPrefix = process.env.API_PREFIX || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Validation Pipe (strict mode)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Filter & Interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  // CORS configuration
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger OpenAPI documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Cookii API')
    .setDescription(
      'Production-grade, on-demand home cook booking platform for Bengaluru, India.\n\n' +
      'Features: Phone OTP, Cook Verification Gate, Strict Booking State Machine, Realtime Matching, ' +
      'Razorpay Payments & Double-Entry Wallet, Live Ops Map, Masked Chat, Emergency SOS.',
    )
    .setVersion('1.0.0')
    .addTag('Auth', 'Phone OTP login, JWT token rotation')
    .addTag('Users', 'Customer profiles, saved kitchen addresses')
    .addTag('Cooks', 'Partner onboarding, KYC uploads, live availability and earnings')
    .addTag('Pricing & Services', 'Dynamic Bengaluru zone rates, fare breakdown, coupons')
    .addTag('Bookings', 'Booking lifecycle and state transitions (CREATED -> IN_PROGRESS -> COMPLETED)')
    .addTag('Matching & Job Offers', 'Job offers with 25s timeout dispatch')
    .addTag('Payments & Wallet', 'Razorpay test orders, webhooks, double-entry ledger')
    .addTag('Chat & Safety', 'Masked messaging, Doorstep OTP, Emergency SOS protocol')
    .addTag('Ratings & Reviews', '5-star reviews, tags, tips')
    .addTag('Admin Operations', 'KYC review queue, Bengaluru live ops map, audit log')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token',
      },
      'BearerAuth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Cookii API Explorer',
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`🌿 Cookii API Monolith running on: http://localhost:${port}/${apiPrefix}`);
  logger.log(`📖 Swagger API Documentation available at: http://localhost:${port}/docs`);
}

bootstrap();

