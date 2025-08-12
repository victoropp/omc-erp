# Ghana OMC SaaS ERP - API Specifications

## Table of Contents
1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [Core APIs](#core-apis)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Webhooks](#webhooks)
7. [SDK Documentation](#sdk-documentation)

---

## API Overview

### Base URL
- **Production**: `https://api.omc-erp.com/v1`
- **Staging**: `https://api-staging.omc-erp.com/v1`
- **Development**: `http://localhost:3000/v1`

### API Design Principles
- RESTful architecture with resource-based URLs
- JSON request/response format
- OAuth 2.0 + JWT authentication
- Pagination for list endpoints
- Consistent error response format
- Versioning via URL path

### OpenAPI Specification
```yaml
openapi: 3.0.3
info:
  title: Ghana OMC SaaS ERP API
  description: Comprehensive API for Oil Marketing Company operations
  version: 1.0.0
  contact:
    name: API Support
    email: api-support@omc-erp.com
  license:
    name: Proprietary
servers:
  - url: https://api.omc-erp.com/v1
    description: Production server
  - url: https://api-staging.omc-erp.com/v1
    description: Staging server
```

---

## Authentication

### OAuth 2.0 Flow

#### 1. Login Endpoint
```yaml
POST /auth/login
Content-Type: application/json

Request:
{
  "username": "string",
  "password": "string",
  "tenant_id": "string"
}

Response (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": {
    "id": "usr_123",
    "username": "john.doe",
    "email": "john@example.com",
    "role": "station_manager",
    "tenant_id": "tnt_123"
  }
}
```

#### 2. Token Refresh
```yaml
POST /auth/refresh
Content-Type: application/json
Authorization: Bearer {refresh_token}

Response (200):
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600
}
```

#### 3. Logout
```yaml
POST /auth/logout
Authorization: Bearer {access_token}

Response (204): No Content
```

### API Key Authentication (For Integrations)
```http
GET /api/v1/stations
X-API-Key: sk_live_51H7...
X-Tenant-ID: tnt_123
```

---

## Core APIs

### 1. Stations Management API

#### List Stations
```yaml
GET /stations
Authorization: Bearer {access_token}

Query Parameters:
  - page: integer (default: 1)
  - limit: integer (default: 20, max: 100)
  - status: string (active, inactive, maintenance)
  - region: string
  - search: string

Response (200):
{
  "data": [
    {
      "id": "stn_123",
      "name": "GOIL Station - Accra Mall",
      "code": "GOL-ACC-001",
      "address": {
        "street": "123 Ring Road",
        "city": "Accra",
        "region": "Greater Accra",
        "gps_coordinates": {
          "latitude": 5.5563,
          "longitude": -0.1969
        }
      },
      "status": "active",
      "manager": {
        "id": "usr_456",
        "name": "John Mensah"
      },
      "tanks": [
        {
          "id": "tnk_789",
          "fuel_type": "PMS",
          "capacity": 20000,
          "current_level": 15500
        }
      ],
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-12T14:30:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total_pages": 5,
    "total_records": 87
  }
}
```

#### Create Station
```yaml
POST /stations
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "name": "Shell Station - Tema",
  "code": "SHL-TMA-001",
  "address": {
    "street": "456 Tema Boulevard",
    "city": "Tema",
    "region": "Greater Accra",
    "gps_coordinates": {
      "latitude": 5.6698,
      "longitude": -0.0181
    }
  },
  "manager_id": "usr_789",
  "tanks": [
    {
      "fuel_type": "PMS",
      "capacity": 25000
    },
    {
      "fuel_type": "AGO",
      "capacity": 15000
    }
  ]
}

Response (201):
{
  "id": "stn_124",
  "name": "Shell Station - Tema",
  "code": "SHL-TMA-001",
  "status": "inactive",
  "created_at": "2025-01-12T15:00:00Z"
}
```

### 2. Transactions API

#### Process Transaction
```yaml
POST /transactions
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "station_id": "stn_123",
  "pump_id": "pmp_456",
  "attendant_id": "usr_789",
  "fuel_type": "PMS",
  "quantity": 50.5,
  "unit_price": 15.75,
  "payment_method": "mobile_money",
  "payment_details": {
    "provider": "mtn",
    "phone_number": "233244123456"
  },
  "customer_id": "cst_123",
  "pos_reference": "POS123456"
}

Response (201):
{
  "id": "txn_789",
  "receipt_number": "RCP2025011215001",
  "station_id": "stn_123",
  "pump_id": "pmp_456",
  "fuel_type": "PMS",
  "quantity": 50.5,
  "unit_price": 15.75,
  "total_amount": 795.38,
  "payment_method": "mobile_money",
  "payment_status": "completed",
  "payment_reference": "MM123456789",
  "customer": {
    "id": "cst_123",
    "name": "Mary Asante",
    "phone": "233244123456"
  },
  "transaction_time": "2025-01-12T15:30:00Z",
  "status": "completed"
}
```

#### Get Transaction Details
```yaml
GET /transactions/{transaction_id}
Authorization: Bearer {access_token}

Response (200):
{
  "id": "txn_789",
  "receipt_number": "RCP2025011215001",
  "station": {
    "id": "stn_123",
    "name": "GOIL Station - Accra Mall",
    "code": "GOL-ACC-001"
  },
  "pump": {
    "id": "pmp_456",
    "number": 3
  },
  "attendant": {
    "id": "usr_789",
    "name": "Patrick Owusu"
  },
  "fuel_details": {
    "type": "PMS",
    "quantity": 50.5,
    "unit_price": 15.75,
    "total_amount": 795.38
  },
  "payment": {
    "method": "mobile_money",
    "provider": "mtn",
    "reference": "MM123456789",
    "status": "completed"
  },
  "customer": {
    "id": "cst_123",
    "name": "Mary Asante",
    "phone": "233244123456",
    "loyalty_points": 79
  },
  "transaction_time": "2025-01-12T15:30:00Z",
  "created_at": "2025-01-12T15:30:00Z"
}
```

### 3. Inventory Management API

#### Get Tank Levels
```yaml
GET /stations/{station_id}/tanks
Authorization: Bearer {access_token}

Response (200):
{
  "station_id": "stn_123",
  "tanks": [
    {
      "id": "tnk_789",
      "fuel_type": "PMS",
      "capacity": 20000,
      "current_level": 15500,
      "percentage": 77.5,
      "temperature": 28.5,
      "water_level": 0.2,
      "last_updated": "2025-01-12T15:45:00Z",
      "status": "normal",
      "alerts": []
    },
    {
      "id": "tnk_790",
      "fuel_type": "AGO",
      "capacity": 15000,
      "current_level": 3200,
      "percentage": 21.3,
      "temperature": 27.8,
      "water_level": 0.1,
      "last_updated": "2025-01-12T15:45:00Z",
      "status": "low",
      "alerts": [
        {
          "type": "low_level",
          "message": "Tank level below 25%",
          "created_at": "2025-01-12T14:00:00Z"
        }
      ]
    }
  ]
}
```

#### Record Stock Receipt
```yaml
POST /stations/{station_id}/stock-receipts
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "truck_id": "trk_456",
  "driver_id": "drv_789",
  "supplier_id": "sup_123",
  "deliveries": [
    {
      "tank_id": "tnk_789",
      "fuel_type": "PMS",
      "quantity": 8500,
      "temperature": 28.2,
      "density": 0.745,
      "quality_certificate": "QC2025010123"
    }
  ],
  "delivery_note": "DN2025010156",
  "photos": [
    "https://s3.amazonaws.com/omc-erp/receipts/photo1.jpg",
    "https://s3.amazonaws.com/omc-erp/receipts/photo2.jpg"
  ]
}

Response (201):
{
  "id": "rcpt_456",
  "receipt_number": "SR2025011215002",
  "station_id": "stn_123",
  "truck": {
    "id": "trk_456",
    "license_plate": "GR-123-21",
    "capacity": 25000
  },
  "supplier": {
    "id": "sup_123",
    "name": "Ghana Oil Company Ltd",
    "code": "GOIL"
  },
  "total_quantity": 8500,
  "status": "completed",
  "received_at": "2025-01-12T16:00:00Z"
}
```

### 4. Fleet Management API

#### Track Vehicle
```yaml
GET /fleet/vehicles/{vehicle_id}/location
Authorization: Bearer {access_token}

Response (200):
{
  "vehicle_id": "veh_123",
  "license_plate": "GR-456-21",
  "driver": {
    "id": "drv_789",
    "name": "Emmanuel Boateng",
    "phone": "233244567890"
  },
  "location": {
    "latitude": 5.5563,
    "longitude": -0.1969,
    "address": "Ring Road, Accra",
    "speed": 45,
    "heading": 180
  },
  "status": "in_transit",
  "destination": {
    "station_id": "stn_124",
    "name": "Shell Station - Tema",
    "eta": "2025-01-12T17:30:00Z"
  },
  "cargo": [
    {
      "compartment": 1,
      "fuel_type": "PMS",
      "quantity": 8000
    },
    {
      "compartment": 2,
      "fuel_type": "AGO",
      "quantity": 6000
    }
  ],
  "timestamp": "2025-01-12T16:15:00Z"
}
```

### 5. Financial API

#### Generate Invoice
```yaml
POST /invoices
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "customer_id": "cst_456",
  "station_id": "stn_123",
  "line_items": [
    {
      "fuel_type": "PMS",
      "quantity": 1000,
      "unit_price": 15.75,
      "tax_rate": 0.175
    },
    {
      "fuel_type": "AGO",
      "quantity": 500,
      "unit_price": 14.25,
      "tax_rate": 0.175
    }
  ],
  "payment_terms": "net_30",
  "due_date": "2025-02-11"
}

Response (201):
{
  "id": "inv_789",
  "invoice_number": "INV-2025-001234",
  "customer": {
    "id": "cst_456",
    "name": "ABC Transport Ltd",
    "address": "123 Industrial Area, Tema"
  },
  "subtotal": 22875.00,
  "tax_amount": 4003.13,
  "total_amount": 26878.13,
  "currency": "GHS",
  "status": "sent",
  "issue_date": "2025-01-12",
  "due_date": "2025-02-11",
  "created_at": "2025-01-12T16:30:00Z"
}
```

### 6. Reports API

#### Generate Sales Report
```yaml
POST /reports/sales
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "report_type": "daily_sales",
  "date_range": {
    "start_date": "2025-01-01",
    "end_date": "2025-01-12"
  },
  "filters": {
    "station_ids": ["stn_123", "stn_124"],
    "fuel_types": ["PMS", "AGO"]
  },
  "format": "pdf",
  "delivery": {
    "method": "email",
    "recipients": ["manager@omc.com"]
  }
}

Response (202):
{
  "report_id": "rpt_456",
  "status": "generating",
  "estimated_completion": "2025-01-12T16:45:00Z",
  "download_url": null,
  "message": "Report generation started"
}
```

#### Get Report Status
```yaml
GET /reports/{report_id}
Authorization: Bearer {access_token}

Response (200):
{
  "id": "rpt_456",
  "type": "daily_sales",
  "status": "completed",
  "format": "pdf",
  "file_size": 245760,
  "download_url": "https://s3.amazonaws.com/omc-erp/reports/rpt_456.pdf",
  "generated_at": "2025-01-12T16:43:00Z",
  "expires_at": "2025-01-19T16:43:00Z"
}
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "quantity",
        "message": "Quantity must be greater than 0"
      }
    ],
    "request_id": "req_123456789",
    "timestamp": "2025-01-12T16:30:00Z"
  }
}
```

### HTTP Status Codes
- `200` - OK (Successful GET, PUT, PATCH)
- `201` - Created (Successful POST)
- `204` - No Content (Successful DELETE)
- `400` - Bad Request (Invalid request data)
- `401` - Unauthorized (Authentication required)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found (Resource doesn't exist)
- `422` - Unprocessable Entity (Validation failed)
- `429` - Too Many Requests (Rate limit exceeded)
- `500` - Internal Server Error
- `503` - Service Unavailable (Maintenance mode)

### Error Codes
```yaml
Authentication Errors:
  - AUTH001: Invalid credentials
  - AUTH002: Token expired
  - AUTH003: Token invalid
  - AUTH004: Account suspended

Validation Errors:
  - VAL001: Required field missing
  - VAL002: Invalid field format
  - VAL003: Field value out of range
  - VAL004: Duplicate value

Business Logic Errors:
  - BIZ001: Insufficient inventory
  - BIZ002: Station offline
  - BIZ003: Payment failed
  - BIZ004: Fuel quality issues

System Errors:
  - SYS001: Database unavailable
  - SYS002: External service timeout
  - SYS003: Configuration error
```

---

## Rate Limiting

### Rate Limits
- **Default**: 1000 requests per hour per API key
- **Burst**: Up to 100 requests per minute
- **Premium**: 10,000 requests per hour

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1673539200
X-RateLimit-Retry-After: 3600
```

### Rate Limit Exceeded Response
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retry_after": 3600,
    "request_id": "req_123456789"
  }
}
```

---

## Webhooks

### Event Types
```yaml
Transaction Events:
  - transaction.created
  - transaction.completed
  - transaction.failed
  - transaction.refunded

Inventory Events:
  - inventory.low_level
  - inventory.stock_received
  - inventory.quality_alert

Vehicle Events:
  - vehicle.departure
  - vehicle.arrival
  - vehicle.breakdown
  - vehicle.maintenance_due

Payment Events:
  - payment.completed
  - payment.failed
  - payment.pending
```

### Webhook Configuration
```yaml
POST /webhooks
Authorization: Bearer {access_token}
Content-Type: application/json

Request:
{
  "url": "https://your-app.com/webhooks/omc-erp",
  "events": [
    "transaction.completed",
    "inventory.low_level"
  ],
  "secret": "whsec_1234567890abcdef",
  "active": true
}
```

### Webhook Payload Example
```json
{
  "id": "evt_123",
  "type": "transaction.completed",
  "created_at": "2025-01-12T16:30:00Z",
  "data": {
    "transaction": {
      "id": "txn_789",
      "receipt_number": "RCP2025011215001",
      "station_id": "stn_123",
      "total_amount": 795.38,
      "fuel_type": "PMS",
      "quantity": 50.5
    }
  }
}
```

---

## SDK Documentation

### JavaScript/TypeScript SDK
```bash
npm install @omc-erp/sdk
```

```typescript
import { OMCClient } from '@omc-erp/sdk';

const client = new OMCClient({
  apiKey: 'sk_live_...',
  tenantId: 'tnt_123',
  baseUrl: 'https://api.omc-erp.com/v1'
});

// Process transaction
const transaction = await client.transactions.create({
  stationId: 'stn_123',
  fuelType: 'PMS',
  quantity: 50.5,
  paymentMethod: 'mobile_money'
});
```

### Python SDK
```bash
pip install omc-erp-sdk
```

```python
from omc_erp import OMCClient

client = OMCClient(
    api_key='sk_live_...',
    tenant_id='tnt_123',
    base_url='https://api.omc-erp.com/v1'
)

# Get tank levels
tanks = client.inventory.get_tank_levels('stn_123')
```

### PHP SDK
```bash
composer require omc-erp/php-sdk
```

```php
<?php
use OMCEra\Client;

$client = new Client([
    'api_key' => 'sk_live_...',
    'tenant_id' => 'tnt_123',
    'base_url' => 'https://api.omc-erp.com/v1'
]);

// Create invoice
$invoice = $client->invoices->create([
    'customer_id' => 'cst_456',
    'line_items' => [...]
]);
```

---

## API Changelog

### Version 1.0.0 (2025-01-12)
- Initial API release
- Core transaction processing
- Inventory management
- Fleet tracking
- Financial operations
- Reporting system

---

## Support

### API Support
- **Email**: api-support@omc-erp.com
- **Documentation**: https://docs.omc-erp.com
- **Status Page**: https://status.omc-erp.com
- **Response Time**: < 24 hours

### Rate Limit Increases
Contact support for rate limit increases with:
- Current usage patterns
- Expected growth
- Use case description
- Business justification

---

*Document Version: 1.0*  
*Last Updated: January 2025*  
*Next Review: Quarterly*