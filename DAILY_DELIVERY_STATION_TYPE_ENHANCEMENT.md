# Daily Delivery Station Type Enhancement

## Overview

This enhancement adds comprehensive station type support and revenue recognition logic to the daily delivery module of the Ghana OMC ERP system. The implementation addresses different business models for fuel distribution in Ghana's oil and gas industry.

## Station Types Supported

### COCO (Company Owned Company Operated)
- **Business Model**: Company owns and operates the station
- **Revenue Recognition**: Deferred (inventory transfer)
- **Accounting Treatment**: Inventory movement, no immediate sale
- **Pricing**: Base cost without retail margins

### DOCO (Dealer Owned Company Operated)
- **Business Model**: Dealer owns, company operates
- **Revenue Recognition**: Deferred (inventory transfer)
- **Accounting Treatment**: Inventory movement to dealer
- **Pricing**: Base cost with operational margins

### DODO (Dealer Owned Dealer Operated)
- **Business Model**: Dealer owns and operates
- **Revenue Recognition**: Immediate (direct sale)
- **Accounting Treatment**: Immediate sale transaction
- **Pricing**: Full retail price with dealer margins

### Industrial Customers
- **Business Model**: Direct sales to industrial facilities
- **Revenue Recognition**: Immediate
- **Accounting Treatment**: Direct sale
- **Pricing**: Wholesale pricing with volume discounts

### Commercial Customers
- **Business Model**: Direct sales to commercial entities
- **Revenue Recognition**: Immediate
- **Accounting Treatment**: Direct sale
- **Pricing**: Commercial pricing tiers

## Key Features Implemented

### 1. Enhanced Entity Model

**New Fields Added to DailyDelivery:**
- `stationType`: Enum field for station classification
- `revenueRecognitionType`: IMMEDIATE or DEFERRED
- `priceBuildupSnapshot`: JSON snapshot of price components
- `pricingWindowId`: Reference to pricing window

**New Business Logic Methods:**
```typescript
delivery.requiresInventoryMovement()  // Returns true for COCO/DOCO
delivery.requiresImmediateSale()      // Returns true for DODO/Industrial/Commercial
delivery.shouldDeferRevenue()         // Returns true for deferred recognition
delivery.getCalculatedSellingPrice() // Returns price based on station type
```

### 2. Updated User Interface

**Form Enhancements:**
- Station type selection dropdown
- Automatic revenue recognition type determination
- Visual indicators for transaction type
- Price build-up component display

### 3. Business Logic Implementation

**Revenue Recognition Logic:**
```typescript
// Automatic determination based on station type
if (stationType === 'COCO' || stationType === 'DOCO') {
  revenueRecognitionType = 'DEFERRED';
} else {
  revenueRecognitionType = 'IMMEDIATE';
}
```

**Pricing Logic:**
- COCO/DOCO: Base cost for inventory valuation
- DODO: Base cost + dealer margin
- Industrial/Commercial: Negotiated pricing with margins

### 4. Integration Services

**Price Build-up Integration Service:**
- Fetches current price components from pricing service
- Stores historical snapshots for audit compliance
- Validates against NPA templates
- Calculates margin accruals and UPPF claims

**AP-AR Integration Enhancements:**
- Station-type specific invoice generation
- Inventory vs. sale transaction routing
- Deferred revenue journal entries
- Margin accrual calculations

### 5. Event-Driven Architecture

**Inventory Movement Events:**
```typescript
// For COCO/DOCO stations
eventEmitter.emit('inventory.movement_required', {
  deliveryId,
  movementType: 'INBOUND_TRANSFER',
  stationType,
  revenueRecognitionRequired: true
});
```

**Immediate Sale Events:**
```typescript
// For DODO/Industrial/Commercial
eventEmitter.emit('sale.immediate_recognition_required', {
  deliveryId,
  saleType: 'IMMEDIATE',
  stationType,
  sellingPrice
});
```

**Deferred Revenue Events:**
```typescript
// For deferred recognition
eventEmitter.emit('revenue.deferred_recognition_required', {
  deliveryId,
  recognitionType: 'DEFERRED',
  deferralReason: 'INVENTORY_MOVEMENT'
});
```

## Database Changes

### Migration Script Applied
- Added `station_type` enum column
- Added `revenue_recognition_type` enum column
- Added `price_buildup_snapshot` text column
- Added `pricing_window_id` uuid column
- Created performance indexes

### Data Migration Considerations
- Existing deliveries default to `IMMEDIATE` revenue recognition
- Station type can be populated based on customer classification
- Price build-up snapshots are generated for new deliveries

## API Changes

### New DTO Fields
```typescript
export class CreateDailyDeliveryDto {
  stationType?: StationType;
  revenueRecognitionType?: RevenueRecognitionType;
  priceBuildupSnapshot?: string;
  pricingWindowId?: string;
}
```

### New Service Methods
```typescript
// Station type specific processing
completeDeliveryWithStationTypeLogic(id, userId, tenantId)
createInventoryMovement(delivery, userId)
createImmediateSale(delivery, userId)
processDeferredRevenueRecognition(delivery, userId)
calculateTaxAccruals(delivery)
```

## Testing

### Unit Tests Implemented
- Station type business logic validation
- Revenue recognition logic testing
- Price calculation testing
- Event emission testing
- Error handling scenarios

### Integration Tests Recommended
- End-to-end delivery processing
- Price build-up service integration
- Accounting service integration
- UPPF service synchronization

## Configuration

### Environment Variables
```env
PRICING_SERVICE_URL=http://pricing-service:3000
ACCOUNTING_SERVICE_URL=http://accounting-service:3000
UPPF_SERVICE_URL=http://uppf-service:3000
```

### Feature Flags
```typescript
// Enable automatic price build-up fetching
ENABLE_PRICE_BUILDUP_INTEGRATION=true

// Enable automatic revenue recognition
ENABLE_AUTO_REVENUE_RECOGNITION=true

// Enable station type validation
REQUIRE_STATION_TYPE=true
```

## Monitoring and Alerts

### Key Metrics to Monitor
- Delivery completion rates by station type
- Revenue recognition timing
- Price build-up fetch success rates
- Tax accrual accuracy

### Alerts Configuration
- Failed price build-up integrations
- Mismatched revenue recognition
- Large price deviations from NPA templates
- Delayed dealer margin accruals

## Compliance and Audit

### Ghana Regulatory Compliance
- NPA price template validation
- UPPF levy calculations
- Dealer margin regulations
- Environmental compliance tracking

### Audit Trail
- Complete price build-up history
- Revenue recognition changes
- Station type modifications
- User action logging

## Performance Considerations

### Database Optimization
- Indexed station type and revenue recognition fields
- JSON price build-up storage for fast retrieval
- Partitioning by delivery date for large datasets

### Service Performance
- Cached price build-up components
- Async event processing
- Batch operations for bulk deliveries

## Future Enhancements

### Planned Features
1. **Dynamic Pricing**: Real-time price adjustments
2. **Multi-Currency Support**: USD/GHS automated conversion
3. **Regional Pricing**: Location-based price variations
4. **Loyalty Programs**: Customer-specific pricing tiers

### Integration Roadmap
1. **Mobile App**: Station operator mobile interface
2. **IoT Integration**: Tank level monitoring
3. **Blockchain**: Supply chain transparency
4. **AI/ML**: Demand forecasting and pricing optimization

## Deployment Instructions

### 1. Database Migration
```bash
npm run migration:run
```

### 2. Service Deployment
```bash
docker-compose up -d daily-delivery-service
```

### 3. Configuration Update
Update environment variables and restart services

### 4. Data Validation
Run data integrity checks post-deployment

## Support and Troubleshooting

### Common Issues
1. **Price Build-up Service Unavailable**: Falls back to manual entry
2. **Invalid Station Type**: Validation errors prevent processing
3. **Revenue Recognition Conflicts**: Manual override available

### Debug Commands
```bash
# Check delivery processing status
npm run debug:delivery-status

# Validate price build-up integration
npm run test:price-buildup

# Monitor event processing
npm run monitor:events
```

## Contributors

- Daily Delivery Service Agent
- Price Build-up Integration Team
- Revenue Recognition Specialists
- Ghana Compliance Team

---

This enhancement ensures the Ghana OMC ERP system properly handles the diverse business models in the fuel distribution industry while maintaining regulatory compliance and accurate financial reporting.