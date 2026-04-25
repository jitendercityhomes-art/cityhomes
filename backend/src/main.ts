import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
const cookieParser = require('cookie-parser');
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { SalaryStructure } from './salary/entities/salary-structure.entity';
import { PayrollRun } from './payroll/entities/payroll-run.entity';

import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);

  // Body size limits for base64 selfies
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  try {
    await dataSource.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;`);
    console.log('✅ Ensured users.address column exists');
  } catch (error) {
    console.error('Failed to ensure users.address column:', error);
  }

  // Cookie parser middleware
  app.use(cookieParser());

  // Security & CORS
  const allowedOriginPatterns = [
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/,
    /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/,
  ];

  app.enableCors({
    origin: true, // Allow all origins for development
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
  });

  // Global prefix
  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>('API_PREFIX') || '/api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}${apiPrefix}`);
}
bootstrap();
