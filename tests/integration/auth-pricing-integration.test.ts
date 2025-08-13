import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule, getConnectionToken } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import request from 'supertest';
import { AuthModule } from '../../services/auth-service/src/auth/auth.module';
import { PricingModule } from '../../services/pricing-service/src/pricing/pricing.module';
import { User, PricingWindow, StationPrice } from '@omc-erp/database';
import { UserRole, UserStatus, PricingWindowStatus } from '@omc-erp/shared-types';

describe('Auth and Pricing Integration Tests', () => {
  let app: INestApplication;
  let connection: Connection;
  let authToken: string;
  let refreshToken: string;
  
  const testTenantId = 'integration-tenant-123';
  const testUser = {
    email: 'integration@test.com',
    password: 'IntegrationTest123!',
    firstName: 'Integration',
    lastName: 'Test',
    username: 'integration-user',
    tenantId: testTenantId,
    role: UserRole.PRICING_MANAGER,
  };

  const testPricingWindow = {
    windowId: 'INT-PW-2024-W01',
    name: 'Integration Test Pricing Window',
    description: 'Test pricing window for integration tests',
    startDate: '2024-01-01T00:00:00.000Z',
    endDate: '2024-01-07T23:59:59.999Z',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [User, PricingWindow, StationPrice],
          synchronize: true,
          logging: false,
        }),
        AuthModule,
        PricingModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    connection = app.get(getConnectionToken());
  });

  afterAll(async () => {
    await connection.close();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await connection.query('DELETE FROM users');
    await connection.query('DELETE FROM pricing_windows');
    await connection.query('DELETE FROM station_prices');
  });

  describe('Complete Authentication and Pricing Workflow', () => {
    it('should complete full user registration to pricing window creation workflow', async () => {
      // Step 1: Register new user
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('accessToken');
      expect(registerResponse.body).toHaveProperty('refreshToken');
      expect(registerResponse.body.user.email).toBe(testUser.email);

      authToken = registerResponse.body.accessToken;
      refreshToken = registerResponse.body.refreshToken;

      // Step 2: Verify user can access protected pricing endpoints
      const profileResponse = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(profileResponse.body.email).toBe(testUser.email);
      expect(profileResponse.body.role).toBe(UserRole.PRICING_MANAGER);

      // Step 3: Create pricing window with authenticated user
      const createWindowResponse = await request(app.getHttpServer())
        .post('/pricing/windows')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testPricingWindow)
        .expect(201);

      expect(createWindowResponse.body).toHaveProperty('windowId', testPricingWindow.windowId);
      expect(createWindowResponse.body).toHaveProperty('status', PricingWindowStatus.DRAFT);
      expect(createWindowResponse.body).toHaveProperty('createdBy');

      // Step 4: Verify user can retrieve their created pricing window
      const getWindowResponse = await request(app.getHttpServer())
        .get(`/pricing/windows/${testPricingWindow.windowId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getWindowResponse.body.windowId).toBe(testPricingWindow.windowId);
      expect(getWindowResponse.body.tenantId).toBe(testTenantId);

      // Step 5: Verify authorization works - user can only access their tenant's data
      await request(app.getHttpServer())
        .get('/pricing/windows')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('should enforce role-based access control for pricing operations', async () => {
      // Register user with OPERATOR role (lower privileges)
      const operatorUser = {
        ...testUser,
        email: 'operator@test.com',
        username: 'operator-user',
        role: UserRole.OPERATOR,
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(operatorUser)
        .expect(201);

      const operatorToken = registerResponse.body.accessToken;

      // Try to create pricing window with insufficient privileges
      await request(app.getHttpServer())
        .post('/pricing/windows')
        .set('Authorization', `Bearer ${operatorToken}`)
        .send(testPricingWindow)
        .expect(403); // Should be forbidden

      // Register admin user who should have access
      const adminUser = {
        ...testUser,
        email: 'admin@test.com',
        username: 'admin-user',
        role: UserRole.ADMIN,
      };

      const adminRegisterResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(adminUser)
        .expect(201);

      const adminToken = adminRegisterResponse.body.accessToken;

      // Admin should be able to create pricing window
      await request(app.getHttpServer())
        .post('/pricing/windows')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(testPricingWindow)
        .expect(201);
    });

    it('should handle token refresh and maintain session across pricing operations', async () => {
      // Register user
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      const initialAccessToken = registerResponse.body.accessToken;
      const initialRefreshToken = registerResponse.body.refreshToken;

      // Create pricing window with initial token
      await request(app.getHttpServer())
        .post('/pricing/windows')
        .set('Authorization', `Bearer ${initialAccessToken}`)
        .send(testPricingWindow)
        .expect(201);

      // Refresh tokens
      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: initialRefreshToken })
        .expect(200);

      const newAccessToken = refreshResponse.body.accessToken;
      expect(newAccessToken).toBeDefined();
      expect(newAccessToken).not.toBe(initialAccessToken);

      // Use new token to access pricing window
      await request(app.getHttpServer())
        .get(`/pricing/windows/${testPricingWindow.windowId}`)
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);

      // Old token should be invalid for new requests
      await request(app.getHttpServer())
        .get('/pricing/windows')
        .set('Authorization', `Bearer ${initialAccessToken}`)
        .expect(401);
    });

    it('should maintain tenant isolation across authentication and pricing', async () => {
      // Create two users from different tenants
      const tenant1User = { ...testUser, tenantId: 'tenant-1' };
      const tenant2User = { 
        ...testUser, 
        email: 'tenant2@test.com',
        username: 'tenant2-user',
        tenantId: 'tenant-2',
      };

      const tenant1Response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(tenant1User)
        .expect(201);

      const tenant2Response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(tenant2User)
        .expect(201);

      const tenant1Token = tenant1Response.body.accessToken;
      const tenant2Token = tenant2Response.body.accessToken;

      // Create pricing window for tenant 1
      const tenant1Window = { ...testPricingWindow, windowId: 'TENANT1-PW-001' };
      await request(app.getHttpServer())
        .post('/pricing/windows')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .send(tenant1Window)
        .expect(201);

      // Create pricing window for tenant 2
      const tenant2Window = { ...testPricingWindow, windowId: 'TENANT2-PW-001' };
      await request(app.getHttpServer())
        .post('/pricing/windows')
        .set('Authorization', `Bearer ${tenant2Token}`)
        .send(tenant2Window)
        .expect(201);

      // Tenant 1 should only see their window
      const tenant1WindowsResponse = await request(app.getHttpServer())
        .get('/pricing/windows')
        .set('Authorization', `Bearer ${tenant1Token}`)
        .expect(200);

      expect(tenant1WindowsResponse.body).toHaveLength(1);
      expect(tenant1WindowsResponse.body[0].windowId).toBe('TENANT1-PW-001');

      // Tenant 2 should only see their window
      const tenant2WindowsResponse = await request(app.getHttpServer())
        .get('/pricing/windows')
        .set('Authorization', `Bearer ${tenant2Token}`)
        .expect(200);

      expect(tenant2WindowsResponse.body).toHaveLength(1);
      expect(tenant2WindowsResponse.body[0].windowId).toBe('TENANT2-PW-001');

      // Tenant 1 should not be able to access tenant 2's window
      await request(app.getHttpServer())
        .get(`/pricing/windows/TENANT2-PW-001`)
        .set('Authorization', `Bearer ${tenant1Token}`)
        .expect(404); // Not found due to tenant isolation
    });

    it('should handle concurrent user operations and pricing calculations', async () => {
      // Create multiple users concurrently
      const users = Array.from({ length: 5 }, (_, i) => ({
        ...testUser,
        email: `concurrent${i}@test.com`,
        username: `concurrent-user-${i}`,
        tenantId: `concurrent-tenant-${i}`,
      }));

      const registrationPromises = users.map(user =>
        request(app.getHttpServer())
          .post('/auth/register')
          .send(user)
      );

      const registrationResponses = await Promise.all(registrationPromises);
      
      // Verify all registrations succeeded
      registrationResponses.forEach((response, index) => {
        expect(response.status).toBe(201);
        expect(response.body.user.email).toBe(users[index].email);
      });

      // Create pricing windows concurrently
      const windowPromises = registrationResponses.map((response, index) =>
        request(app.getHttpServer())
          .post('/pricing/windows')
          .set('Authorization', `Bearer ${response.body.accessToken}`)
          .send({
            ...testPricingWindow,
            windowId: `CONCURRENT-PW-${index}`,
          })
      );

      const windowResponses = await Promise.all(windowPromises);

      // Verify all pricing windows were created
      windowResponses.forEach((response, index) => {
        expect(response.status).toBe(201);
        expect(response.body.windowId).toBe(`CONCURRENT-PW-${index}`);
      });
    });

    it('should handle authentication errors gracefully in pricing operations', async () => {
      // Try to create pricing window without authentication
      await request(app.getHttpServer())
        .post('/pricing/windows')
        .send(testPricingWindow)
        .expect(401);

      // Try with invalid token
      await request(app.getHttpServer())
        .post('/pricing/windows')
        .set('Authorization', 'Bearer invalid-token')
        .send(testPricingWindow)
        .expect(401);

      // Register user and get token
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      const validToken = registerResponse.body.accessToken;

      // Logout user (invalidate token)
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      // Try to use token after logout
      await request(app.getHttpServer())
        .post('/pricing/windows')
        .set('Authorization', `Bearer ${validToken}`)
        .send(testPricingWindow)
        .expect(401);
    });
  });

  describe('Database Transaction Consistency', () => {
    it('should maintain data consistency across auth and pricing operations', async () => {
      // Register user
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      const token = registerResponse.body.accessToken;
      const userId = registerResponse.body.user.id;

      // Create pricing window
      const createWindowResponse = await request(app.getHttpServer())
        .post('/pricing/windows')
        .set('Authorization', `Bearer ${token}`)
        .send(testPricingWindow)
        .expect(201);

      // Verify database consistency
      const user = await connection
        .getRepository(User)
        .findOne({ where: { id: userId } });
      
      const pricingWindow = await connection
        .getRepository(PricingWindow)
        .findOne({ where: { windowId: testPricingWindow.windowId } });

      expect(user).toBeDefined();
      expect(user.tenantId).toBe(testTenantId);
      expect(pricingWindow).toBeDefined();
      expect(pricingWindow.tenantId).toBe(testTenantId);
      expect(pricingWindow.createdBy).toBe(userId);

      // Update user status and verify it affects pricing access
      await connection
        .getRepository(User)
        .update({ id: userId }, { status: UserStatus.SUSPENDED });

      // Suspended user should not be able to create new pricing windows
      await request(app.getHttpServer())
        .post('/pricing/windows')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...testPricingWindow,
          windowId: 'SUSPENDED-USER-WINDOW',
        })
        .expect(403);
    });

    it('should rollback pricing window creation on authentication failure', async () => {
      // This test simulates a scenario where pricing window creation
      // might start but fail due to authentication issues

      // Register user
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      const token = registerResponse.body.accessToken;

      // Manually invalidate the user in database while keeping token
      await connection
        .getRepository(User)
        .update({ email: testUser.email }, { status: UserStatus.INACTIVE });

      // Try to create pricing window - should fail due to inactive status
      await request(app.getHttpServer())
        .post('/pricing/windows')
        .set('Authorization', `Bearer ${token}`)
        .send(testPricingWindow)
        .expect(403);

      // Verify no pricing window was created
      const pricingWindow = await connection
        .getRepository(PricingWindow)
        .findOne({ where: { windowId: testPricingWindow.windowId } });

      expect(pricingWindow).toBeNull();
    });
  });

  describe('Performance and Load Testing', () => {
    it('should handle high-concurrency authentication and pricing operations', async () => {
      const concurrencyLevel = 20;
      const startTime = Date.now();

      // Create concurrent user registration and pricing window creation
      const operations = Array.from({ length: concurrencyLevel }, async (_, i) => {
        const user = {
          ...testUser,
          email: `load-test-${i}@test.com`,
          username: `load-test-user-${i}`,
          tenantId: `load-test-tenant-${i}`,
        };

        // Register user
        const registerResponse = await request(app.getHttpServer())
          .post('/auth/register')
          .send(user);

        if (registerResponse.status !== 201) {
          throw new Error(`Registration failed for user ${i}`);
        }

        const token = registerResponse.body.accessToken;

        // Create pricing window
        const windowResponse = await request(app.getHttpServer())
          .post('/pricing/windows')
          .set('Authorization', `Bearer ${token}`)
          .send({
            ...testPricingWindow,
            windowId: `LOAD-TEST-PW-${i}`,
          });

        if (windowResponse.status !== 201) {
          throw new Error(`Pricing window creation failed for user ${i}`);
        }

        return { user: registerResponse.body.user, window: windowResponse.body };
      });

      const results = await Promise.all(operations);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Verify all operations completed successfully
      expect(results).toHaveLength(concurrencyLevel);
      results.forEach((result, index) => {
        expect(result.user.email).toBe(`load-test-${index}@test.com`);
        expect(result.window.windowId).toBe(`LOAD-TEST-PW-${index}`);
      });

      // Performance assertion - should complete within reasonable time
      expect(totalTime).toBeLessThan(10000); // 10 seconds for 20 concurrent operations

      console.log(`Completed ${concurrencyLevel} concurrent operations in ${totalTime}ms`);
    });

    it('should maintain response times under load', async () => {
      // Pre-create some users and pricing windows
      const setupUsers = Array.from({ length: 5 }, async (_, i) => {
        const user = {
          ...testUser,
          email: `setup-${i}@test.com`,
          username: `setup-user-${i}`,
        };

        const registerResponse = await request(app.getHttpServer())
          .post('/auth/register')
          .send(user);

        const token = registerResponse.body.accessToken;

        await request(app.getHttpServer())
          .post('/pricing/windows')
          .set('Authorization', `Bearer ${token}`)
          .send({
            ...testPricingWindow,
            windowId: `SETUP-PW-${i}`,
          });

        return token;
      });

      const tokens = await Promise.all(setupUsers);

      // Measure response times for read operations under load
      const readOperations = tokens.map(async (token, i) => {
        const startTime = Date.now();

        await request(app.getHttpServer())
          .get('/pricing/windows')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        const responseTime = Date.now() - startTime;
        return responseTime;
      });

      const responseTimes = await Promise.all(readOperations);
      const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;

      // All response times should be under 1 second
      responseTimes.forEach(time => {
        expect(time).toBeLessThan(1000);
      });

      // Average response time should be reasonable
      expect(avgResponseTime).toBeLessThan(500);

      console.log(`Average response time: ${avgResponseTime}ms`);
    });
  });

  describe('Security Integration Tests', () => {
    it('should prevent SQL injection in combined auth/pricing queries', async () => {
      const maliciousUser = {
        ...testUser,
        email: "test'; DROP TABLE users; --@test.com",
        username: "'; DROP TABLE pricing_windows; --",
      };

      // Attempt to register with malicious input
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(maliciousUser)
        .expect(400); // Should be rejected due to validation

      // Verify tables still exist
      const userCount = await connection
        .getRepository(User)
        .count();

      const windowCount = await connection
        .getRepository(PricingWindow)
        .count();

      expect(userCount).toBeDefined(); // Table exists
      expect(windowCount).toBeDefined(); // Table exists
    });

    it('should prevent privilege escalation through token manipulation', async () => {
      // Register regular user
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          ...testUser,
          role: UserRole.OPERATOR, // Lower privilege role
        })
        .expect(201);

      const token = registerResponse.body.accessToken;

      // Try to escalate privileges by modifying role in request
      await request(app.getHttpServer())
        .post('/pricing/windows')
        .set('Authorization', `Bearer ${token}`)
        .set('X-User-Role', 'ADMIN') // Attempt to override role
        .send(testPricingWindow)
        .expect(403); // Should be forbidden regardless of header

      // Verify the user's actual role hasn't changed
      const user = await connection
        .getRepository(User)
        .findOne({ where: { email: testUser.email } });

      expect(user.role).toBe(UserRole.OPERATOR);
    });
  });
});