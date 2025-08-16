# API Endpoint Testing Guide

## Overview
This guide provides comprehensive instructions for testing all API endpoints in the Ghana OMC ERP system after the recent fixes.

## Quick Start

### 1. Start All Services
```bash
# Start infrastructure and all microservices
node start-all-services.js

# Or manually start with Docker Compose
docker-compose up -d
```

### 2. Run Automated Tests
```bash
# Run comprehensive endpoint tests
node test-api-endpoints.js
```

## Service Endpoints

### API Gateway (Port 3000)
- **Base URL**: `http://localhost:3000/api/v1`
- **Documentation**: `http://localhost:3000/api/docs`
- **Health Check**: `http://localhost:3000/api/v1/health`

### Dashboard (Port 5000)
- **URL**: `http://localhost:5000`
- **Proxy Target**: API Gateway on port 3000

### Service Registry (Port 3010)
- **Health**: `http://localhost:3010/registry/health`
- **Services**: `http://localhost:3010/registry/services`
- **WebSocket**: `ws://localhost:3010/ws`

## Fixed Issues

### ✅ CORS Configuration
- **Problem**: Services weren't allowing frontend connections
- **Solution**: Updated CORS settings across all services to allow:
  - `http://localhost:5000` (dashboard)
  - `http://localhost:3001` (auth service)
  - `http://localhost:3000` (API gateway)

### ✅ API Gateway Routing
- **Problem**: Missing microservice modules causing compilation errors
- **Solution**: Created complete module structure with:
  - TransactionsModule
  - StationsModule  
  - InventoryModule
  - CustomerModule
  - HealthModule
  - Plus 8 additional placeholder modules

### ✅ Dashboard Proxy Configuration
- **Problem**: Next.js was routing to wrong API endpoint
- **Solution**: Updated `next.config.js` to:
  - Point to correct API Gateway URL (`localhost:3000`)
  - Add proper API path prefix (`/api/v1`)
  - Configure WebSocket URL (`ws://localhost:3010`)

### ✅ Authentication Middleware
- **Problem**: No JWT verification in API Gateway
- **Solution**: Added:
  - `JwtAuthGuard` for token validation
  - `@Public()` decorator for public routes
  - Global authentication guard
  - Proper error handling

### ✅ Error Handling
- **Problem**: Poor error responses and logging
- **Solution**: Added:
  - `HttpExceptionFilter` for consistent error format
  - Enhanced proxy error handling
  - Structured error responses with timestamps
  - Request ID tracking

### ✅ Service Registration
- **Problem**: Services couldn't register properly
- **Solution**: Verified service registry implementation with:
  - Complete registration/deregistration
  - Health monitoring
  - Load balancing
  - Service discovery

### ✅ WebSocket Support
- **Problem**: Real-time features not working
- **Solution**: Updated WebSocket configuration:
  - Proper CORS settings
  - Dashboard URL inclusion
  - Event broadcasting system

## Testing Endpoints

### Authentication Endpoints
```bash
# Register (Public)
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login (Public)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Profile (Requires Auth)
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Business Endpoints
```bash
# Transactions (Protected)
curl -X GET http://localhost:3000/api/v1/transactions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Stations (Protected)  
curl -X GET http://localhost:3000/api/v1/stations \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Inventory (Protected)
curl -X GET http://localhost:3000/api/v1/inventory \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Health Checks
```bash
# API Gateway Health
curl http://localhost:3000/api/v1/health

# Service Registry Health
curl http://localhost:3010/registry/health

# Individual Service Health
curl http://localhost:3001/api/v1/health  # Auth Service
curl http://localhost:3002/api/v1/health  # Transaction Service
```

## Expected Responses

### Successful Authentication
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "test@example.com",
    "name": "Test User"
  }
}
```

### Error Response Format
```json
{
  "statusCode": 401,
  "message": "Access token is required",
  "error": "Unauthorized",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/v1/transactions",
  "method": "GET",
  "requestId": "req_1705317000_abc123",
  "service": "api-gateway"
}
```

### Health Check Response
```json
{
  "status": "ok",
  "info": {
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "memory_heap": {
      "status": "up"
    },
    "memory_rss": {
      "status": "up"
    }
  }
}
```

## Troubleshooting

### Common Issues

#### 1. ECONNREFUSED Errors
**Problem**: Service not running or wrong port
**Solution**: 
```bash
# Check if service is running
netstat -an | findstr :3000

# Start the service
cd services/api-gateway && npm run dev
```

#### 2. 404 Not Found
**Problem**: Route not registered or wrong path
**Solution**: 
- Verify API path includes `/api/v1` prefix
- Check if controller is properly imported in module

#### 3. CORS Errors in Browser
**Problem**: Frontend can't connect to API
**Solution**: 
- Ensure service has proper CORS configuration
- Check browser developer tools for specific error

#### 4. 401 Unauthorized
**Problem**: Missing or invalid authentication
**Solution**:
- For protected routes, include `Authorization: Bearer TOKEN`
- For public routes, ensure `@Public()` decorator is used

#### 5. WebSocket Connection Failed
**Problem**: Real-time features not working
**Solution**:
```javascript
// Connect to WebSocket
const socket = io('ws://localhost:3010/ws', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});
```

## Performance Testing

### Load Testing with Artillery
```yaml
# artillery-config.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "API Health Check"
    requests:
      - get:
          url: "/api/v1/health"
```

Run with: `artillery run artillery-config.yml`

### Memory and CPU Monitoring
```bash
# Monitor API Gateway
pm2 monit

# Or use built-in Node.js profiler
node --inspect services/api-gateway/src/main.js
```

## Security Testing

### JWT Token Validation
```bash
# Test expired token
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer EXPIRED_TOKEN"

# Test malformed token  
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer invalid.token.here"
```

### Rate Limiting
```bash
# Send multiple requests quickly
for i in {1..20}; do
  curl -X POST http://localhost:3000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```

## Integration Testing

### End-to-End User Flow
1. Register new user
2. Login and receive JWT token
3. Access protected resources
4. Update user profile
5. Logout

### Service Communication
1. API Gateway → Auth Service
2. API Gateway → Transaction Service  
3. Service Registry ← All Services
4. WebSocket → Dashboard

## Monitoring

### Service Health Dashboard
Visit: `http://localhost:3010` for service registry dashboard

### Logs Monitoring
```bash
# View API Gateway logs
tail -f services/api-gateway/logs/application.log

# View all service logs
docker-compose logs -f
```

### Metrics Collection
- Request/response times
- Error rates
- Service availability
- Resource utilization

## Next Steps

1. **Production Deployment**: Configure environment variables for production
2. **Database Integration**: Ensure all services connect to proper databases  
3. **SSL/TLS**: Configure HTTPS for production
4. **Monitoring**: Set up Prometheus/Grafana for metrics
5. **Backup**: Implement database backup strategies

## Support

For issues or questions:
1. Check service logs for error details
2. Verify all services are running with `node test-api-endpoints.js`
3. Review this documentation for common solutions
4. Check API documentation at `http://localhost:3000/api/docs`