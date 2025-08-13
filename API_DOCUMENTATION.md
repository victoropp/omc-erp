# API Documentation

## Ghana OMC ERP System - Complete API Reference

### Base URL
- **Production**: `https://api.omc-erp.com`
- **Staging**: `https://staging-api.omc-erp.com`
- **Development**: `http://localhost:3001`

### API Version
Current version: `v1`
All endpoints are prefixed with `/api/v1`

## Authentication

### Authentication Methods
The API supports multiple authentication methods:

1. **JWT Bearer Token** (Primary)
2. **API Key** (For system integrations)
3. **OAuth 2.0** (For third-party integrations)

### JWT Authentication

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password",
  "tenantId": "uuid-tenant-id"
}
```

**Response**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "role": "STATION_MANAGER",
      "tenantId": "tenant-uuid",
      "permissions": ["READ_TRANSACTIONS", "WRITE_TRANSACTIONS"]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 86400
    }
  }
}
```

#### Multi-Factor Authentication
```http
POST /api/v1/auth/mfa/verify
Authorization: Bearer <partial-token>
Content-Type: application/json

{
  "code": "123456",
  "method": "SMS" // or "EMAIL", "TOTP", "BIOMETRIC"
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
Authorization: Bearer <refresh-token>
```

### API Key Authentication
For system-to-system integration:
```http
GET /api/v1/stations
X-API-Key: your-api-key-here
X-Tenant-ID: tenant-uuid
```

## Core Services APIs

### 1. Authentication Service (Port 3001)

#### User Management
```http
# Get current user profile
GET /api/v1/auth/profile
Authorization: Bearer <token>

# Update user profile
PUT /api/v1/auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+233243123456",
  "language": "en",
  "timezone": "Africa/Accra"
}

# Change password
POST /api/v1/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}

# Logout
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

#### Role Management
```http
# Get user roles
GET /api/v1/auth/roles
Authorization: Bearer <token>

# Create role
POST /api/v1/auth/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "FUEL_ATTENDANT",
  "description": "Fuel station attendant role",
  "permissions": ["READ_TRANSACTIONS", "CREATE_TRANSACTIONS"]
}

# Assign role to user
POST /api/v1/auth/users/{userId}/roles
Authorization: Bearer <token>
Content-Type: application/json

{
  "roleId": "role-uuid"
}
```

### 2. Pricing Service (Port 3002)

#### Price Management
```http
# Get current fuel prices
GET /api/v1/pricing/current?stationId=uuid&fuelType=PETROL
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "stationId": "uuid",
    "fuelType": "PETROL",
    "prices": {
      "basePrice": 7.50,
      "dealerMargin": 0.90,
      "taxes": 1.25,
      "finalPrice": 9.65,
      "currency": "GHS",
      "effectiveDate": "2024-01-15T00:00:00Z",
      "priceBuildup": {
        "crudeCost": 4.20,
        "refineryMargin": 0.85,
        "marketingMargin": 0.95,
        "uppfLevy": 0.46,
        "roadFund": 0.18,
        "energyFund": 0.05,
        "vat": 0.95,
        "nhil": 0.19,
        "getfund": 0.19
      }
    }
  }
}

# Update station prices
PUT /api/v1/pricing/stations/{stationId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "fuelType": "PETROL",
  "basePrice": 7.60,
  "effectiveDate": "2024-01-16T06:00:00Z",
  "reason": "UPPF price adjustment"
}

# Get price history
GET /api/v1/pricing/history?stationId=uuid&fuelType=PETROL&from=2024-01-01&to=2024-01-31
Authorization: Bearer <token>

# Calculate dealer margin
POST /api/v1/pricing/calculate-margin
Authorization: Bearer <token>
Content-Type: application/json

{
  "basePrice": 7.50,
  "dealerCategory": "CATEGORY_A",
  "fuelType": "PETROL",
  "volume": 10000
}
```

#### UPPF Price Compliance
```http
# Validate price against UPPF guidelines
POST /api/v1/pricing/uppf/validate
Authorization: Bearer <token>
Content-Type: application/json

{
  "fuelType": "PETROL",
  "proposedPrice": 9.65,
  "stationId": "uuid",
  "effectiveDate": "2024-01-16T00:00:00Z"
}

Response:
{
  "status": "success",
  "data": {
    "isCompliant": true,
    "uppfMaxPrice": 9.70,
    "uppfMinPrice": 9.60,
    "variance": 0.05,
    "complianceLevel": "WITHIN_LIMITS",
    "warnings": []
  }
}
```

### 3. Transaction Service (Port 3004)

#### Transaction Processing
```http
# Create transaction
POST /api/v1/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "stationId": "station-uuid",
  "pumpId": "pump-001",
  "attendantId": "user-uuid",
  "customerId": "customer-uuid",
  "fuelType": "PETROL",
  "volumeDispensed": 25.50,
  "unitPrice": 9.65,
  "totalAmount": 246.08,
  "paymentMethod": "MTN_MOMO",
  "customerPhone": "+233243123456"
}

Response:
{
  "status": "success",
  "data": {
    "transaction": {
      "id": "txn-uuid",
      "transactionNumber": "TXN-2024-001234",
      "stationId": "station-uuid",
      "pumpId": "pump-001",
      "fuelType": "PETROL",
      "volumeDispensed": 25.50,
      "unitPrice": 9.65,
      "totalAmount": 246.08,
      "paymentMethod": "MTN_MOMO",
      "paymentStatus": "PENDING",
      "createdAt": "2024-01-15T10:30:00Z",
      "receipt": {
        "receiptNumber": "RCP-2024-001234",
        "qrCode": "data:image/png;base64,..."
      }
    }
  }
}

# Get transaction details
GET /api/v1/transactions/{transactionId}
Authorization: Bearer <token>

# Update transaction status
PATCH /api/v1/transactions/{transactionId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "paymentStatus": "COMPLETED",
  "paymentReference": "MP240115.1030.A12345"
}

# Get station transactions
GET /api/v1/transactions?stationId=uuid&from=2024-01-01&to=2024-01-31&limit=100&offset=0
Authorization: Bearer <token>

# Transaction analytics
GET /api/v1/transactions/analytics?stationId=uuid&period=monthly&fuelType=PETROL
Authorization: Bearer <token>
```

#### Bulk Transaction Operations
```http
# Bulk transaction import
POST /api/v1/transactions/bulk
Authorization: Bearer <token>
Content-Type: application/json

{
  "transactions": [
    {
      "stationId": "station-uuid",
      "pumpId": "pump-001",
      "fuelType": "PETROL",
      "volumeDispensed": 30.00,
      "unitPrice": 9.65,
      "totalAmount": 289.50,
      "paymentMethod": "CASH",
      "timestamp": "2024-01-15T09:15:00Z"
    }
  ]
}

# Transaction reconciliation
POST /api/v1/transactions/reconcile
Authorization: Bearer <token>
Content-Type: application/json

{
  "stationId": "station-uuid",
  "date": "2024-01-15",
  "reconciliationType": "DAILY"
}
```

### 4. Payment Service (Port 3005)

#### Mobile Money Payments

**MTN Mobile Money**:
```http
# Initiate MTN MoMo payment
POST /api/v1/payments/mtn-momo/initiate
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50.00,
  "currency": "GHS",
  "phoneNumber": "+233243123456",
  "description": "Fuel payment - 5L Petrol",
  "externalId": "TXN-2024-001234",
  "callbackUrl": "https://your-webhook.com/mtn-callback"
}

Response:
{
  "status": "success",
  "data": {
    "paymentId": "payment-uuid",
    "referenceId": "ref-uuid",
    "status": "PENDING",
    "message": "Payment request sent to customer",
    "estimatedCompletionTime": "2024-01-15T10:32:00Z"
  }
}

# Check MTN MoMo payment status
GET /api/v1/payments/mtn-momo/{paymentId}/status
Authorization: Bearer <token>

# Cancel MTN MoMo payment
POST /api/v1/payments/mtn-momo/{paymentId}/cancel
Authorization: Bearer <token>
```

**Vodafone Cash**:
```http
# Initiate Vodafone Cash payment
POST /api/v1/payments/vodafone/initiate
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 75.50,
  "currency": "GHS",
  "phoneNumber": "+233200123456",
  "description": "Fuel payment - 7.5L Diesel",
  "transactionId": "TXN-2024-001235"
}

# Vodafone Cash payment status
GET /api/v1/payments/vodafone/{paymentId}/status
Authorization: Bearer <token>
```

**AirtelTigo Money**:
```http
# Initiate AirtelTigo payment
POST /api/v1/payments/airteltigo/initiate
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100.00,
  "currency": "GHS",
  "phoneNumber": "+233260123456",
  "description": "Fuel payment - 10L Petrol",
  "merchantCode": "MERCHANT123"
}
```

#### Payment Analytics
```http
# Payment method analytics
GET /api/v1/payments/analytics?stationId=uuid&period=weekly
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "period": "2024-W03",
    "totalTransactions": 1250,
    "totalAmount": 125000.00,
    "currency": "GHS",
    "paymentMethods": [
      {
        "method": "MTN_MOMO",
        "transactions": 450,
        "amount": 45000.00,
        "percentage": 36.0,
        "successRate": 98.5
      },
      {
        "method": "VODAFONE_CASH",
        "transactions": 320,
        "amount": 32000.00,
        "percentage": 25.6,
        "successRate": 97.8
      },
      {
        "method": "CASH",
        "transactions": 380,
        "amount": 38000.00,
        "percentage": 30.4,
        "successRate": 100.0
      },
      {
        "method": "CARD",
        "transactions": 100,
        "amount": 10000.00,
        "percentage": 8.0,
        "successRate": 95.2
      }
    ]
  }
}

# Failed payments report
GET /api/v1/payments/failed?from=2024-01-01&to=2024-01-31
Authorization: Bearer <token>
```

### 5. AI/ML Platform (Port 8000)

#### Demand Forecasting
```http
# Train demand forecasting model
POST /api/v1/ml/train/demand-forecasting
Authorization: Bearer <token>
Content-Type: application/json

{
  "stationIds": ["station-uuid-1", "station-uuid-2"],
  "productTypes": ["PETROL", "DIESEL"],
  "forecastHorizon": 30,
  "modelConfig": {
    "includeWeather": true,
    "includeHolidays": true,
    "includeEvents": true
  }
}

Response:
{
  "status": "training_started",
  "data": {
    "jobId": "job-uuid",
    "estimatedDuration": "2-3 hours",
    "modelTypes": ["LSTM", "Prophet", "ARIMA", "XGBoost"],
    "targetAccuracy": "95%"
  }
}

# Get demand forecast
GET /api/v1/ml/predict/demand?stationId=uuid&fuelType=PETROL&days=7
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "stationId": "station-uuid",
    "fuelType": "PETROL",
    "forecastPeriod": "7 days",
    "predictions": [
      {
        "date": "2024-01-16",
        "predictedDemand": 2850.5,
        "confidence": 0.94,
        "upperBound": 3120.8,
        "lowerBound": 2580.2,
        "factors": {
          "historicalTrend": 0.4,
          "seasonality": 0.3,
          "weather": 0.2,
          "events": 0.1
        }
      }
    ],
    "accuracy": 95.2,
    "modelVersion": "v2.1.0"
  }
}

# Get forecasting model status
GET /api/v1/ml/models/demand-forecasting/status
Authorization: Bearer <token>
```

#### Fraud Detection
```http
# Real-time fraud check
POST /api/v1/ml/predict/fraud
Authorization: Bearer <token>
Content-Type: application/json

{
  "transactionData": {
    "transactionId": "txn-uuid",
    "stationId": "station-uuid",
    "pumpId": "pump-001",
    "attendantId": "user-uuid",
    "fuelType": "PETROL",
    "volumeDispensed": 50.0,
    "unitPrice": 9.65,
    "totalAmount": 482.50,
    "timestamp": "2024-01-15T14:30:00Z",
    "paymentMethod": "MTN_MOMO"
  },
  "contextData": {
    "attendantShift": "AFTERNOON",
    "stationBusyness": "HIGH",
    "customerType": "REGULAR"
  }
}

Response:
{
  "status": "success",
  "data": {
    "fraudProbability": 0.15,
    "riskLevel": "LOW",
    "fraudTypes": [
      {
        "type": "VOLUME_MANIPULATION",
        "probability": 0.05,
        "confidence": 0.88
      },
      {
        "type": "PRICE_MANIPULATION",
        "probability": 0.02,
        "confidence": 0.92
      }
    ],
    "recommendation": "ALLOW",
    "requiresReview": false,
    "explanation": [
      "Transaction amount within normal range for customer",
      "Attendant performance within expected parameters",
      "No unusual patterns detected"
    ]
  }
}

# Train fraud detection model
POST /api/v1/ml/train/fraud-detection
Authorization: Bearer <token>
Content-Type: application/json

{
  "fraudTypes": ["PUMP_TAMPERING", "TRANSACTION_MANIPULATION", "INVENTORY_THEFT"],
  "trainingPeriod": "6 months",
  "rebalanceData": true
}

# Get fraud analytics
GET /api/v1/ml/fraud/analytics?stationId=uuid&period=monthly
Authorization: Bearer <token>
```

#### Predictive Maintenance
```http
# Get maintenance predictions
GET /api/v1/ml/predict/maintenance?equipmentId=pump-001&horizon=30
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "equipmentId": "pump-001",
    "equipmentType": "FUEL_PUMP",
    "currentHealth": 0.85,
    "predictions": [
      {
        "component": "FLOW_METER",
        "failureProbability": 0.12,
        "estimatedFailureDate": "2024-02-20",
        "severity": "MEDIUM",
        "recommendedAction": "SCHEDULE_INSPECTION",
        "costImpact": 1500.00
      },
      {
        "component": "PUMP_MOTOR",
        "failureProbability": 0.03,
        "estimatedFailureDate": "2024-04-15",
        "severity": "LOW",
        "recommendedAction": "MONITOR",
        "costImpact": 5000.00
      }
    ],
    "overallRisk": "LOW",
    "nextMaintenanceRecommended": "2024-02-01"
  }
}

# Schedule maintenance
POST /api/v1/ml/maintenance/schedule
Authorization: Bearer <token>
Content-Type: application/json

{
  "equipmentId": "pump-001",
  "maintenanceType": "PREVENTIVE",
  "scheduledDate": "2024-02-01T09:00:00Z",
  "components": ["FLOW_METER"],
  "priority": "MEDIUM"
}
```

### 6. IoT Service (Port 3007)

#### Tank Monitoring
```http
# Get tank status
GET /api/v1/iot/tanks/{tankId}/status
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "tankId": "tank-uuid",
    "stationId": "station-uuid",
    "fuelType": "PETROL",
    "capacity": 10000,
    "currentLevel": 7500.5,
    "fillPercentage": 75.01,
    "temperature": 28.5,
    "pressure": 1.02,
    "lastUpdated": "2024-01-15T14:45:00Z",
    "sensors": {
      "level": {
        "value": 7500.5,
        "unit": "litres",
        "status": "NORMAL",
        "lastCalibration": "2024-01-01T00:00:00Z"
      },
      "temperature": {
        "value": 28.5,
        "unit": "celsius",
        "status": "NORMAL",
        "threshold": { "min": -5, "max": 45 }
      },
      "leak": {
        "detected": false,
        "sensitivity": "HIGH",
        "lastTest": "2024-01-10T00:00:00Z"
      }
    },
    "alerts": []
  }
}

# Get tank history
GET /api/v1/iot/tanks/{tankId}/history?from=2024-01-01&to=2024-01-15&interval=hourly
Authorization: Bearer <token>

# Set tank alert thresholds
PUT /api/v1/iot/tanks/{tankId}/thresholds
Authorization: Bearer <token>
Content-Type: application/json

{
  "lowLevel": 1000,
  "criticalLevel": 500,
  "highTemperature": 40,
  "lowTemperature": 0,
  "leakSensitivity": "HIGH"
}

# Calibrate tank sensors
POST /api/v1/iot/tanks/{tankId}/calibrate
Authorization: Bearer <token>
Content-Type: application/json

{
  "calibrationType": "LEVEL",
  "actualVolume": 5000.0,
  "technician": "tech-user-uuid"
}
```

#### Environmental Monitoring
```http
# Get environmental data
GET /api/v1/iot/environmental?stationId=uuid&from=2024-01-01&to=2024-01-15
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "stationId": "station-uuid",
    "period": "2024-01-01 to 2024-01-15",
    "airQuality": {
      "benzene": { "average": 0.8, "max": 1.2, "unit": "ppm", "limit": 1.6 },
      "toluene": { "average": 1.5, "max": 2.1, "unit": "ppm", "limit": 5.0 },
      "xylene": { "average": 0.5, "max": 0.8, "unit": "ppm", "limit": 2.0 }
    },
    "groundwater": {
      "contaminationDetected": false,
      "lastSample": "2024-01-01",
      "nextSampleDue": "2024-04-01"
    },
    "soilQuality": {
      "hydrocarbonLevel": 10.5,
      "unit": "mg/kg",
      "limit": 100,
      "status": "NORMAL"
    },
    "compliance": {
      "epaCompliant": true,
      "violations": [],
      "nextInspection": "2024-03-01"
    }
  }
}

# Report environmental incident
POST /api/v1/iot/environmental/incident
Authorization: Bearer <token>
Content-Type: application/json

{
  "stationId": "station-uuid",
  "incidentType": "FUEL_SPILL",
  "severity": "MEDIUM",
  "location": {
    "latitude": 5.6037,
    "longitude": -0.1870,
    "description": "Near pump 3"
  },
  "substanceSpilled": "PETROL",
  "estimatedVolume": 25.0,
  "immediateActions": ["Contained spill", "Notified supervisor"],
  "reportedBy": "user-uuid"
}
```

### 7. UPPF Service (Port 3003)

#### UPPF Claims Management
```http
# Submit UPPF claim
POST /api/v1/uppf/claims
Authorization: Bearer <token>
Content-Type: application/json

{
  "dealerId": "DEALER_001",
  "period": "2024-01",
  "claimData": {
    "petrolVolume": 50000,
    "dieselVolume": 75000,
    "keroseneVolume": 10000
  },
  "supportingDocuments": [
    "delivery_notes_january.pdf",
    "sales_reports_january.pdf"
  ]
}

Response:
{
  "status": "success",
  "data": {
    "claimId": "CLAIM-2024-001234",
    "dealerId": "DEALER_001",
    "period": "2024-01",
    "status": "SUBMITTED",
    "submissionDate": "2024-02-05T10:00:00Z",
    "estimatedAmount": 125000.00,
    "currency": "GHS",
    "processingTime": "5-7 business days",
    "trackingReference": "UPPF-TR-001234"
  }
}

# Get claim status
GET /api/v1/uppf/claims/{claimId}/status
Authorization: Bearer <token>

# Get UPPF parameters
GET /api/v1/uppf/parameters?effectiveDate=2024-01-15
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "effectiveDate": "2024-01-15",
    "parameters": {
      "crudeCostPerLitre": 4.20,
      "refineryMarginPerLitre": 0.85,
      "distributionCostPerLitre": 0.45,
      "marketingMarginPerLitre": 0.95,
      "uppfLevyPerLitre": 0.46,
      "roadFundLevyPerLitre": 0.18,
      "energyFundLevyPerLitre": 0.05,
      "stabilizationComponentPerLitre": 0.25
    },
    "dealerMargins": {
      "CATEGORY_A": 0.12,
      "CATEGORY_B": 0.15,
      "CATEGORY_C": 0.18
    }
  }
}

# Calculate dealer subsidy
POST /api/v1/uppf/calculate-subsidy
Authorization: Bearer <token>
Content-Type: application/json

{
  "dealerId": "DEALER_001",
  "fuelType": "PETROL",
  "volume": 10000,
  "marketPrice": 9.65,
  "uppfPrice": 9.50,
  "period": "2024-01"
}
```

### 8. Regulatory Service (Port 3008)

#### Multi-Agency Compliance
```http
# Get compliance status
GET /api/v1/regulatory/compliance?tenantId=uuid
Authorization: Bearer <token>

Response:
{
  "status": "success",
  "data": {
    "tenantId": "tenant-uuid",
    "overallCompliance": 92,
    "lastUpdated": "2024-01-15T12:00:00Z",
    "agencies": {
      "NPA": {
        "complianceScore": 95,
        "status": "COMPLIANT",
        "licenses": [
          {
            "type": "OMC_LICENSE",
            "number": "NPA/OMC/001234",
            "status": "ACTIVE",
            "expiryDate": "2025-06-30"
          }
        ],
        "lastInspection": "2023-11-15",
        "nextInspectionDue": "2024-05-15"
      },
      "GRA": {
        "complianceScore": 88,
        "status": "COMPLIANT",
        "vatReturns": {
          "lastSubmission": "2024-01-15",
          "nextDue": "2024-02-15",
          "status": "UP_TO_DATE"
        },
        "taxClearance": {
          "status": "VALID",
          "expiryDate": "2024-12-31"
        }
      },
      "EPA": {
        "complianceScore": 94,
        "status": "COMPLIANT",
        "environmentalPermit": {
          "status": "ACTIVE",
          "expiryDate": "2025-03-31"
        },
        "incidents": 0,
        "lastAssessment": "2023-12-01"
      },
      "BOG": {
        "complianceScore": 92,
        "status": "COMPLIANT",
        "forexReporting": {
          "lastSubmission": "2024-01-05",
          "nextDue": "2024-02-05",
          "status": "UP_TO_DATE"
        }
      }
    },
    "upcomingDeadlines": [
      {
        "agency": "GRA",
        "requirement": "VAT Return",
        "dueDate": "2024-02-15",
        "daysRemaining": 31
      }
    ]
  }
}

# Submit regulatory report
POST /api/v1/regulatory/reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "agency": "EPA",
  "reportType": "ENVIRONMENTAL_INCIDENT",
  "data": {
    "incidentDate": "2024-01-15",
    "incidentType": "MINOR_SPILL",
    "volume": 5.0,
    "substanceSpilled": "PETROL",
    "location": "Pump area",
    "actionsTaken": ["Immediate containment", "Soil testing"]
  }
}
```

### 9. Fleet Service

#### Fleet Management
```http
# Get fleet vehicles
GET /api/v1/fleet/vehicles?tenantId=uuid&status=ACTIVE
Authorization: Bearer <token>

# Track vehicle location
GET /api/v1/fleet/vehicles/{vehicleId}/location
Authorization: Bearer <token>

# Update vehicle status
PUT /api/v1/fleet/vehicles/{vehicleId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "IN_TRANSIT",
  "currentLocation": {
    "latitude": 5.6037,
    "longitude": -0.1870
  },
  "fuel_level": 75,
  "mileage": 125000
}

# Create delivery order
POST /api/v1/fleet/deliveries
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicleId": "vehicle-uuid",
  "driverId": "driver-uuid",
  "destinationStationId": "station-uuid",
  "fuelType": "PETROL",
  "volume": 30000,
  "scheduledDelivery": "2024-01-16T08:00:00Z",
  "priority": "HIGH"
}
```

## Mobile App APIs

### 1. Mobile Authentication
```http
# Mobile login with biometric
POST /api/v1/auth/mobile/login
Content-Type: application/json

{
  "email": "attendant@station.com",
  "biometricToken": "encrypted-biometric-data",
  "deviceId": "device-uuid",
  "deviceInfo": {
    "platform": "android",
    "version": "13",
    "model": "Samsung Galaxy A54"
  }
}

# Offline token generation
POST /api/v1/auth/mobile/offline-token
Authorization: Bearer <token>
```

### 2. Offline Sync
```http
# Sync offline transactions
POST /api/v1/mobile/sync/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "transactions": [
    {
      "offlineId": "offline-txn-001",
      "stationId": "station-uuid",
      "fuelType": "PETROL",
      "volume": 20.0,
      "amount": 193.0,
      "timestamp": "2024-01-15T08:30:00Z",
      "paymentMethod": "CASH"
    }
  ],
  "lastSyncTimestamp": "2024-01-15T06:00:00Z"
}

# Download offline data
GET /api/v1/mobile/offline/data?stationId=uuid&lastSync=2024-01-15T06:00:00Z
Authorization: Bearer <token>
```

## Webhook APIs

### 1. Payment Webhooks
```http
# MTN MoMo webhook endpoint (configured in MTN dashboard)
POST /webhooks/payments/mtn-momo
Content-Type: application/json

{
  "referenceId": "ref-uuid",
  "status": "SUCCESSFUL",
  "amount": "50.00",
  "currency": "EUR",
  "externalId": "TXN-2024-001234",
  "payerMessage": "Payment completed",
  "payeeNote": "Fuel payment received"
}

# Vodafone webhook endpoint
POST /webhooks/payments/vodafone
Content-Type: application/json

{
  "transaction_id": "vodafone-txn-id",
  "status": "SUCCESS",
  "amount": 75.50,
  "currency": "GHS",
  "merchant_transaction_id": "TXN-2024-001235"
}
```

### 2. IoT Sensor Webhooks
```http
# Tank level alerts
POST /webhooks/iot/tank-alerts
Content-Type: application/json

{
  "tankId": "tank-uuid",
  "stationId": "station-uuid",
  "alertType": "LOW_LEVEL",
  "currentLevel": 950.5,
  "threshold": 1000,
  "severity": "HIGH",
  "timestamp": "2024-01-15T14:30:00Z"
}
```

## Error Handling

### Standard Error Response Format
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "phoneNumber",
        "message": "Invalid Ghana phone number format",
        "code": "INVALID_FORMAT"
      }
    ],
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req-uuid"
  }
}
```

### Common Error Codes
- `AUTHENTICATION_FAILED` (401)
- `AUTHORIZATION_DENIED` (403)
- `RESOURCE_NOT_FOUND` (404)
- `VALIDATION_ERROR` (400)
- `PAYMENT_FAILED` (402)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_SERVER_ERROR` (500)
- `SERVICE_UNAVAILABLE` (503)

### Ghana-specific Error Codes
- `INVALID_GHANA_PHONE` (400)
- `UPPF_VALIDATION_FAILED` (400)
- `NPA_LICENSE_EXPIRED` (403)
- `GRA_TAX_OVERDUE` (403)
- `MOBILE_MONEY_TIMEOUT` (408)

## Rate Limiting

### Rate Limits by Endpoint Type
- **Authentication**: 5 requests/minute per IP
- **Transactions**: 100 requests/minute per tenant
- **Payments**: 50 requests/minute per tenant
- **IoT Data**: 1000 requests/minute per station
- **Analytics**: 20 requests/minute per user

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705340400
```

## SDKs and Integration

### JavaScript/TypeScript SDK
```bash
npm install @omc-erp/api-client
```

```typescript
import { OMCERPClient } from '@omc-erp/api-client';

const client = new OMCERPClient({
  baseURL: 'https://api.omc-erp.com',
  apiKey: 'your-api-key',
  tenantId: 'your-tenant-id'
});

// Create transaction
const transaction = await client.transactions.create({
  stationId: 'station-uuid',
  fuelType: 'PETROL',
  volume: 25.0,
  amount: 241.25,
  paymentMethod: 'MTN_MOMO',
  customerPhone: '+233243123456'
});
```

### Python SDK
```bash
pip install omc-erp-client
```

```python
from omc_erp_client import OMCERPClient

client = OMCERPClient(
    base_url="https://api.omc-erp.com",
    api_key="your-api-key",
    tenant_id="your-tenant-id"
)

# Get demand forecast
forecast = client.ml.predict_demand(
    station_id="station-uuid",
    fuel_type="PETROL",
    days=7
)
```

### cURL Examples
```bash
# Authentication
curl -X POST https://api.omc-erp.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password",
    "tenantId": "tenant-uuid"
  }'

# Create transaction
curl -X POST https://api.omc-erp.com/api/v1/transactions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "stationId": "station-uuid",
    "fuelType": "PETROL",
    "volume": 25.0,
    "amount": 241.25
  }'
```

---

**Complete API documentation for Ghana OMC ERP System with world-class standards and Ghana-specific optimizations**