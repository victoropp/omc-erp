# Service Authentication Setup

## Overview
This document describes the service-to-service authentication setup for the OMC ERP system.

## Generated Files
- `.env.service-auth` - Shared environment variables
- `services/*/\.env.service-auth` - Service-specific environment variables
- `service-credentials.json` - Service credentials manifest (reference only)

## Environment Variables

### Shared Configuration
- `JWT_SERVICE_SECRET` - Secret for signing service tokens
- `SERVICE_REGISTRY_URL` - URL of the service registry
- `SERVICE_TOKEN_EXPIRY` - Token expiration time (default: 1h)
- `SERVICE_API_KEY_EXPIRY_DAYS` - API key expiration (default: 90 days)

### Service-Specific Configuration
Each service has:
- `{SERVICE}_SERVICE_ID` - Unique service identifier
- `{SERVICE}_SERVICE_API_KEY` - API key for service authentication
- `SERVICE_NAME` - Service name for registration
- `SERVICE_ENVIRONMENT` - Deployment environment

## Authentication Flow

1. **Service Registration**: Services register with the service registry using their API key
2. **Token Generation**: Service registry issues JWT tokens for authenticated services
3. **Inter-Service Calls**: Services include JWT tokens in requests to other services
4. **Token Validation**: Receiving services validate tokens using shared JWT secret

## Security Features

- **API Key Authentication**: Each service has a unique API key
- **JWT Tokens**: Short-lived tokens for inter-service communication
- **Rate Limiting**: Per-service rate limits to prevent abuse
- **Permission System**: Role-based access control for service operations
- **Audit Logging**: All authentication attempts are logged
- **Token Rotation**: Automatic token refresh before expiration

## Usage

### Starting Services
1. Copy the generated `.env.service-auth` files to your service directories
2. Update your `.env` files to include service auth variables
3. Start the service registry first: `cd services/service-registry && npm run dev`
4. Start other services in any order

### Testing Authentication
Use the generated test script:
```bash
node scripts/test-service-auth.js
```

### Monitoring
- Check service registry logs for authentication events
- Monitor rate limiting in service logs
- Review audit logs for security events

## Troubleshooting

### Common Issues
1. **JWT Secret Mismatch**: Ensure all services use the same JWT_SERVICE_SECRET
2. **API Key Not Found**: Verify API keys are properly set in environment variables
3. **Token Expired**: Check token expiry settings and refresh logic
4. **Rate Limited**: Review and adjust rate limits if needed

### Debug Mode
Set `DEBUG=service-auth` environment variable for detailed logging.

## Security Considerations

1. **Secret Management**: Store JWT secrets securely in production
2. **API Key Rotation**: Regularly rotate service API keys
3. **Network Security**: Use HTTPS in production
4. **Audit Monitoring**: Monitor authentication logs for suspicious activity
5. **Least Privilege**: Grant minimal required permissions to each service

Generated on: 2025-08-16T10:38:19.034Z
