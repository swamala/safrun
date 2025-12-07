import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    it('/api/v1/auth/signup (POST) - should fail without required fields', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({})
        .expect(400);
    });

    it('/api/v1/auth/signup (POST) - should create a user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/signup')
        .send({
          email: `test-${Date.now()}@example.com`,
          password: 'Password123!',
          displayName: 'Test User',
        })
        .expect(201);
    });
  });

  describe('Profile', () => {
    it('/api/v1/profile (GET) - should require authentication', () => {
      return request(app.getHttpServer())
        .get('/api/v1/profile')
        .expect(401);
    });
  });

  describe('Sessions', () => {
    it('/api/v1/sessions (GET) - should require authentication', () => {
      return request(app.getHttpServer())
        .get('/api/v1/sessions')
        .expect(401);
    });
  });
});

