# Ghana OMC SaaS ERP - Development Guidelines

## Table of Contents
1. [Development Philosophy](#development-philosophy)
2. [Code Standards](#code-standards)
3. [Git Workflow](#git-workflow)
4. [Testing Guidelines](#testing-guidelines)
5. [Documentation Standards](#documentation-standards)
6. [Security Guidelines](#security-guidelines)
7. [Performance Guidelines](#performance-guidelines)
8. [Code Review Process](#code-review-process)
9. [Release Process](#release-process)
10. [Tools and Setup](#tools-and-setup)

---

## Development Philosophy

### Core Principles
1. **Security First**: Every feature must consider security implications
2. **Performance by Design**: Optimize for scale from the beginning  
3. **Maintainable Code**: Write code for humans, not just computers
4. **Test-Driven Development**: Tests are documentation and safety nets
5. **Fail Fast**: Catch errors early in development cycle
6. **Documentation as Code**: Keep docs current and comprehensive

### Architecture Principles
- **Microservices**: Loosely coupled, highly cohesive services
- **API-First**: Design APIs before implementing business logic
- **Event-Driven**: Use events for service communication when possible
- **Database per Service**: Each service owns its data
- **Stateless Services**: Enable horizontal scaling
- **Idempotent Operations**: Safe to retry operations

---

## Code Standards

### General Guidelines

#### Naming Conventions
```typescript
// Use descriptive, intention-revealing names
// ✅ Good
const unpaidInvoicesCount = await getUnpaidInvoicesCount();
const isTransactionValid = validateTransaction(transaction);

// ❌ Bad  
const cnt = await getCount();
const isValid = validate(data);

// Use consistent naming patterns
// Services: {Entity}Service
class TransactionService {}
class InventoryService {}

// Controllers: {Entity}Controller  
class TransactionController {}
class StationController {}

// Types: {Entity} or I{Entity} for interfaces
interface Transaction {}
interface ITransactionRepository {}
```

#### Function and Method Design
```typescript
// Functions should do one thing and do it well
// ✅ Good - Single responsibility
async function processTransaction(transactionData: TransactionData): Promise<Transaction> {
  const validatedData = validateTransactionData(transactionData);
  const savedTransaction = await saveTransaction(validatedData);
  await publishTransactionEvent(savedTransaction);
  return savedTransaction;
}

// ❌ Bad - Multiple responsibilities
async function processTransactionAndSendEmailAndUpdateInventory(data: any): Promise<any> {
  // Too many responsibilities
}

// Use pure functions when possible
// ✅ Good - Pure function
function calculateTotalAmount(quantity: number, unitPrice: number, taxRate: number): number {
  const subtotal = quantity * unitPrice;
  const tax = subtotal * taxRate;
  return subtotal + tax;
}

// Limit function parameters (max 3-4)
// ✅ Good - Use object for multiple parameters
interface CreateTransactionParams {
  stationId: string;
  fuelType: FuelType;
  quantity: number;
  customerId?: string;
}

function createTransaction(params: CreateTransactionParams): Promise<Transaction> {
  // Implementation
}
```

### TypeScript Standards

#### Type Definitions
```typescript
// Use strict TypeScript configuration
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}

// Define explicit interfaces for all data structures
interface Transaction {
  readonly id: string;
  readonly stationId: string;
  readonly fuelType: FuelType;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly totalAmount: number;
  readonly status: TransactionStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// Use enums for constants
enum FuelType {
  PMS = 'PMS',
  AGO = 'AGO', 
  IFO = 'IFO',
  LPG = 'LPG',
  KERO = 'KERO'
}

enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  FAILED = 'failed'
}

// Use utility types for variations
type CreateTransactionRequest = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateTransactionRequest = Partial<Pick<Transaction, 'status'>>;
```

#### Error Handling
```typescript
// Use custom error classes
class TransactionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400
  ) {
    super(message);
    this.name = 'TransactionError';
  }
}

class InsufficientInventoryError extends TransactionError {
  constructor(stationId: string, fuelType: FuelType) {
    super(
      `Insufficient ${fuelType} inventory at station ${stationId}`,
      'INSUFFICIENT_INVENTORY',
      422
    );
  }
}

// Consistent error handling pattern
class TransactionService {
  async processTransaction(data: CreateTransactionRequest): Promise<Transaction> {
    try {
      // Validate input
      const validationResult = await this.validateTransaction(data);
      if (!validationResult.isValid) {
        throw new TransactionError('Invalid transaction data', 'VALIDATION_ERROR');
      }

      // Check inventory
      const hasInventory = await this.checkInventory(data.stationId, data.fuelType, data.quantity);
      if (!hasInventory) {
        throw new InsufficientInventoryError(data.stationId, data.fuelType);
      }

      // Process transaction
      return await this.createTransaction(data);
      
    } catch (error) {
      this.logger.error('Transaction processing failed', {
        error: error.message,
        data,
        stack: error.stack
      });
      throw error;
    }
  }
}
```

### Backend (Node.js/NestJS) Standards

#### Project Structure
```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   └── guards/
│   │       └── jwt-auth.guard.ts
│   ├── transactions/
│   │   ├── transactions.controller.ts
│   │   ├── transactions.service.ts
│   │   ├── transactions.module.ts
│   │   ├── entities/
│   │   │   └── transaction.entity.ts
│   │   └── repositories/
│   │       └── transactions.repository.ts
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── middleware/
├── config/
├── database/
│   ├── migrations/
│   └── seeds/
└── shared/
    ├── constants/
    ├── enums/
    └── types/
```

#### Service Layer Pattern
```typescript
// Use dependency injection
@Injectable()
export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly inventoryService: InventoryService,
    private readonly paymentService: PaymentService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: Logger
  ) {}

  async createTransaction(dto: CreateTransactionDto): Promise<Transaction> {
    this.logger.log(`Creating transaction for station ${dto.stationId}`);
    
    // Use database transactions for consistency
    return this.transactionRepository.manager.transaction(async (manager) => {
      // Validate and reserve inventory
      await this.inventoryService.reserveInventory(
        dto.stationId, 
        dto.fuelType, 
        dto.quantity,
        manager
      );

      // Create transaction record
      const transaction = await this.transactionRepository.create({
        ...dto,
        status: TransactionStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date()
      }, manager);

      // Emit domain event
      this.eventEmitter.emit('transaction.created', {
        transactionId: transaction.id,
        stationId: dto.stationId,
        amount: dto.totalAmount
      });

      return transaction;
    });
  }
}
```

#### Controller Layer
```typescript
@Controller('transactions')
@ApiTags('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createTransaction(
    @Body() createTransactionDto: CreateTransactionDto,
    @GetUser() user: User,
    @Req() req: Request
  ): Promise<TransactionResponseDto> {
    // Add audit context
    const auditContext = {
      userId: user.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    };

    const transaction = await this.transactionService.createTransaction(
      createTransactionDto,
      auditContext
    );

    return new TransactionResponseDto(transaction);
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  async getTransaction(@Param('id') id: string): Promise<TransactionResponseDto> {
    const transaction = await this.transactionService.findById(id);
    
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return new TransactionResponseDto(transaction);
  }
}
```

### Frontend (React/Next.js) Standards

#### Component Structure
```typescript
// Use functional components with hooks
interface TransactionFormProps {
  onSubmit: (transaction: CreateTransactionRequest) => Promise<void>;
  initialValues?: Partial<CreateTransactionRequest>;
  isLoading?: boolean;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  initialValues,
  isLoading = false
}) => {
  // Custom hook for form logic
  const {
    values,
    errors,
    isValid,
    handleChange,
    handleSubmit,
    resetForm
  } = useTransactionForm(initialValues);

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isValid) {
      await onSubmit(values);
      resetForm();
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="transaction-form">
      <div className="form-group">
        <label htmlFor="fuelType">Fuel Type</label>
        <select
          id="fuelType"
          value={values.fuelType}
          onChange={handleChange}
          disabled={isLoading}
          aria-describedby="fuelType-error"
        >
          <option value="">Select fuel type</option>
          {Object.values(FuelType).map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        {errors.fuelType && (
          <span id="fuelType-error" className="error" role="alert">
            {errors.fuelType}
          </span>
        )}
      </div>
      
      <button 
        type="submit" 
        disabled={!isValid || isLoading}
        className="btn btn-primary"
      >
        {isLoading ? 'Processing...' : 'Create Transaction'}
      </button>
    </form>
  );
};
```

#### State Management (Zustand)
```typescript
// Use Zustand for global state
interface TransactionState {
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchTransactions: () => Promise<void>;
  createTransaction: (data: CreateTransactionRequest) => Promise<void>;
  selectTransaction: (id: string) => void;
  clearError: () => void;
}

export const useTransactionStore = create<TransactionState>()((set, get) => ({
  transactions: [],
  currentTransaction: null,
  loading: false,
  error: null,

  fetchTransactions: async () => {
    set({ loading: true, error: null });
    try {
      const response = await transactionApi.getTransactions();
      set({ transactions: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        loading: false 
      });
    }
  },

  createTransaction: async (data: CreateTransactionRequest) => {
    set({ loading: true, error: null });
    try {
      const response = await transactionApi.createTransaction(data);
      set((state) => ({
        transactions: [response.data, ...state.transactions],
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create transaction',
        loading: false 
      });
      throw error; // Re-throw for component handling
    }
  },

  selectTransaction: (id: string) => {
    const transaction = get().transactions.find(t => t.id === id) || null;
    set({ currentTransaction: transaction });
  },

  clearError: () => set({ error: null })
}));
```

#### Custom Hooks
```typescript
// Reusable custom hooks
export const useTransactionForm = (initialValues?: Partial<CreateTransactionRequest>) => {
  const [values, setValues] = useState<CreateTransactionRequest>({
    stationId: '',
    fuelType: FuelType.PMS,
    quantity: 0,
    unitPrice: 0,
    ...initialValues
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!values.stationId) {
      newErrors.stationId = 'Station is required';
    }
    
    if (values.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (values.unitPrice <= 0) {
      newErrors.unitPrice = 'Unit price must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values]);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;
    const parsedValue = type === 'number' ? parseFloat(value) || 0 : value;
    
    setValues(prev => ({
      ...prev,
      [name]: parsedValue
    }));
  }, []);

  const resetForm = useCallback(() => {
    setValues({
      stationId: '',
      fuelType: FuelType.PMS,
      quantity: 0,
      unitPrice: 0,
      ...initialValues
    });
    setErrors({});
  }, [initialValues]);

  const isValid = useMemo(() => validate(), [validate]);

  return {
    values,
    errors,
    isValid,
    handleChange,
    resetForm,
    validate
  };
};
```

---

## Git Workflow

### Branch Strategy

#### GitFlow Model
```bash
# Main branches
main        # Production-ready code
develop     # Integration branch for features

# Supporting branches  
feature/    # New features (branch from develop)
bugfix/     # Bug fixes (branch from develop)
hotfix/     # Critical fixes (branch from main)
release/    # Release preparation (branch from develop)
```

#### Branch Naming Convention
```bash
# Feature branches
feature/OMC-123-add-transaction-processing
feature/OMC-456-implement-mobile-payments

# Bug fix branches  
bugfix/OMC-789-fix-inventory-calculation
bugfix/OMC-101-resolve-login-issue

# Hotfix branches
hotfix/OMC-999-critical-security-patch
hotfix/OMC-888-payment-gateway-timeout

# Release branches
release/v1.2.0
release/v1.2.1
```

### Commit Standards

#### Commit Message Format
```bash
# Format: <type>(<scope>): <description>
#
# <type>: feat, fix, docs, style, refactor, test, chore
# <scope>: module or feature area
# <description>: imperative mood, lowercase, no period

# Examples
feat(auth): add multi-factor authentication support
fix(transactions): resolve duplicate transaction issue  
docs(api): update authentication endpoints documentation
test(inventory): add unit tests for stock calculations
refactor(payments): simplify mobile money integration
style(frontend): fix eslint warnings in dashboard
chore(deps): update dependencies to latest versions
```

#### Detailed Commit Guidelines
```bash
# Good commit messages
✅ feat(stations): add real-time fuel level monitoring
✅ fix(api): handle timeout errors in payment processing  
✅ docs(deployment): add kubernetes configuration guide
✅ test(transactions): increase coverage to 85%

# Bad commit messages  
❌ fix bug
❌ update code
❌ changes
❌ WIP

# Multi-line commits for complex changes
feat(reporting): implement advanced analytics dashboard

- Add interactive charts for sales trends
- Integrate with TimescaleDB for time-series data  
- Include export functionality for PDF/Excel
- Add role-based access control for reports

Closes #OMC-234
```

### Pull Request Process

#### PR Template
```markdown
## Description
Brief description of changes and motivation behind them.

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass locally
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] New tests added for new functionality

## Screenshots (if applicable)
Include screenshots for UI changes.

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have made corresponding changes to documentation
- [ ] My changes generate no new warnings
- [ ] New and existing unit tests pass locally

## Related Issues
Fixes #OMC-123
Closes #OMC-456
```

#### PR Review Guidelines
```bash
# Before requesting review
1. Self-review your changes
2. Run all tests locally  
3. Check for linting errors
4. Update documentation if needed
5. Add meaningful commit messages

# Code review checklist
- Code functionality and logic
- Security implications
- Performance impact  
- Test coverage
- Documentation updates
- Breaking changes
- Error handling
- Code style consistency
```

### Git Hooks

#### Pre-commit Hook
```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running pre-commit checks..."

# Check if this is an initial commit
if git rev-parse --verify HEAD >/dev/null 2>&1; then
    against=HEAD
else
    # Initial commit: diff against an empty tree object
    against=4b825dc642cb6eb9a060e54bf8d69288fbee4904
fi

# Redirect output to stderr
exec 1>&2

# Check for whitespace errors
git diff-index --check --cached $against --

# Run linting
echo "Running ESLint..."
npm run lint:staged

# Run type checking
echo "Running TypeScript checks..."
npm run type-check

# Run tests
echo "Running tests..."
npm run test:staged

echo "Pre-commit checks completed successfully!"
```

#### Commit Message Hook
```bash
#!/bin/bash
# .git/hooks/commit-msg

commit_regex='^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "Invalid commit message format!"
    echo "Format: <type>(<scope>): <description>"
    echo "Example: feat(auth): add OAuth integration"
    exit 1
fi
```

---

## Testing Guidelines

### Testing Strategy

#### Testing Pyramid
```
         ┌─────────────┐
         │     E2E     │ <- Few, High-level
         │   Tests     │
         └─────────────┘
       ┌─────────────────┐
       │  Integration    │ <- Some, Service-level  
       │    Tests        │
       └─────────────────┘
     ┌───────────────────────┐
     │     Unit Tests        │ <- Many, Fast
     └───────────────────────┘
```

### Unit Testing

#### Backend Unit Tests (Jest)
```typescript
// __tests__/transaction.service.spec.ts
describe('TransactionService', () => {
  let service: TransactionService;
  let mockRepository: jest.Mocked<TransactionRepository>;
  let mockInventoryService: jest.Mocked<InventoryService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
        {
          provide: TransactionRepository,
          useFactory: () => createMockRepository()
        },
        {
          provide: InventoryService,
          useFactory: () => createMockInventoryService()
        }
      ]
    }).compile();

    service = module.get<TransactionService>(TransactionService);
    mockRepository = module.get(TransactionRepository);
    mockInventoryService = module.get(InventoryService);
  });

  describe('createTransaction', () => {
    it('should create transaction successfully', async () => {
      // Arrange
      const createDto: CreateTransactionDto = {
        stationId: 'station-123',
        fuelType: FuelType.PMS,
        quantity: 50,
        unitPrice: 15.75
      };

      const expectedTransaction: Transaction = {
        id: 'transaction-456',
        ...createDto,
        totalAmount: 787.50,
        status: TransactionStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockInventoryService.checkAvailability.mockResolvedValue(true);
      mockRepository.create.mockResolvedValue(expectedTransaction);

      // Act  
      const result = await service.createTransaction(createDto);

      // Assert
      expect(result).toEqual(expectedTransaction);
      expect(mockInventoryService.checkAvailability).toHaveBeenCalledWith(
        'station-123',
        FuelType.PMS,
        50
      );
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createDto,
          status: TransactionStatus.PENDING
        })
      );
    });

    it('should throw error when insufficient inventory', async () => {
      // Arrange
      const createDto: CreateTransactionDto = {
        stationId: 'station-123',
        fuelType: FuelType.PMS,
        quantity: 1000,
        unitPrice: 15.75
      };

      mockInventoryService.checkAvailability.mockResolvedValue(false);

      // Act & Assert
      await expect(service.createTransaction(createDto))
        .rejects
        .toThrow(InsufficientInventoryError);

      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  // Test error scenarios, edge cases, etc.
  describe('edge cases', () => {
    it('should handle database transaction rollback', async () => {
      // Test rollback scenarios
    });

    it('should handle concurrent transactions', async () => {
      // Test race conditions
    });
  });
});
```

#### Frontend Unit Tests (Jest + React Testing Library)
```typescript
// __tests__/TransactionForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionForm } from '../TransactionForm';
import { FuelType } from '@/types';

describe('TransactionForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders form fields correctly', () => {
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/fuel type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/unit price/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create transaction/i })).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    // Fill out form
    await user.selectOptions(screen.getByLabelText(/fuel type/i), FuelType.PMS);
    await user.type(screen.getByLabelText(/quantity/i), '50');
    await user.type(screen.getByLabelText(/unit price/i), '15.75');

    // Submit form
    await user.click(screen.getByRole('button', { name: /create transaction/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        fuelType: FuelType.PMS,
        quantity: 50,
        unitPrice: 15.75
      });
    });
  });

  it('shows validation errors for invalid input', async () => {
    const user = userEvent.setup();
    
    render(<TransactionForm onSubmit={mockOnSubmit} />);

    // Try to submit empty form
    await user.click(screen.getByRole('button', { name: /create transaction/i }));

    await waitFor(() => {
      expect(screen.getByText(/fuel type is required/i)).toBeInTheDocument();
      expect(screen.getByText(/quantity must be greater than 0/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('disables form during submission', () => {
    render(<TransactionForm onSubmit={mockOnSubmit} isLoading={true} />);

    const submitButton = screen.getByRole('button', { name: /processing/i });
    const fuelTypeSelect = screen.getByLabelText(/fuel type/i);

    expect(submitButton).toBeDisabled();
    expect(fuelTypeSelect).toBeDisabled();
  });
});
```

### Integration Testing

#### API Integration Tests
```typescript
// __tests__/integration/transactions.integration.spec.ts
describe('Transactions API Integration', () => {
  let app: INestApplication;
  let testDb: TestDatabase;

  beforeAll(async () => {
    // Setup test database
    testDb = await TestDatabase.create();
    
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(DatabaseService)
    .useValue(testDb.connection)
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    await testDb.clean();
    await testDb.seed();
  });

  afterAll(async () => {
    await app.close();
    await testDb.destroy();
  });

  describe('POST /transactions', () => {
    it('should create transaction and update inventory', async () => {
      // Arrange
      const stationId = 'test-station-1';
      const transactionData = {
        stationId,
        fuelType: FuelType.PMS,
        quantity: 50,
        unitPrice: 15.75,
        paymentMethod: 'cash'
      };

      // Get initial inventory
      const initialInventory = await testDb.getInventoryLevel(stationId, FuelType.PMS);

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${await getTestToken()}`)
        .send(transactionData)
        .expect(201);

      // Assert
      expect(response.body).toMatchObject({
        id: expect.any(String),
        stationId,
        fuelType: FuelType.PMS,
        quantity: 50,
        totalAmount: 787.50,
        status: 'completed'
      });

      // Verify inventory was updated
      const updatedInventory = await testDb.getInventoryLevel(stationId, FuelType.PMS);
      expect(updatedInventory).toBe(initialInventory - 50);

      // Verify transaction was recorded
      const savedTransaction = await testDb.getTransaction(response.body.id);
      expect(savedTransaction).toBeTruthy();
    });

    it('should return 422 when insufficient inventory', async () => {
      // Arrange - Request more fuel than available
      const transactionData = {
        stationId: 'test-station-1',
        fuelType: FuelType.PMS,
        quantity: 10000, // More than available
        unitPrice: 15.75,
        paymentMethod: 'cash'
      };

      // Act & Assert
      const response = await request(app.getHttpServer())
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${await getTestToken()}`)
        .send(transactionData)
        .expect(422);

      expect(response.body.error.code).toBe('INSUFFICIENT_INVENTORY');
    });
  });
});
```

### End-to-End Testing

#### E2E Tests with Playwright
```typescript
// e2e/transaction-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Transaction Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="username"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard');
  });

  test('should create transaction from dashboard', async ({ page }) => {
    // Navigate to transactions page
    await page.click('[data-testid="nav-transactions"]');
    await page.waitForURL('/transactions');

    // Click create transaction button
    await page.click('[data-testid="create-transaction-button"]');

    // Fill transaction form
    await page.selectOption('[data-testid="station-select"]', 'station-1');
    await page.selectOption('[data-testid="fuel-type-select"]', 'PMS');
    await page.fill('[data-testid="quantity-input"]', '50');
    await page.fill('[data-testid="unit-price-input"]', '15.75');
    await page.selectOption('[data-testid="payment-method-select"]', 'cash');

    // Submit form
    await page.click('[data-testid="submit-transaction"]');

    // Wait for success message
    await expect(page.locator('[data-testid="success-message"]'))
      .toContainText('Transaction created successfully');

    // Verify transaction appears in list
    await expect(page.locator('[data-testid="transaction-list"]'))
      .toContainText('50.0 L');
    await expect(page.locator('[data-testid="transaction-list"]'))
      .toContainText('₵787.50');
  });

  test('should handle payment failure gracefully', async ({ page }) => {
    // Mock payment service failure
    await page.route('**/api/v1/payments/**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Payment service unavailable' })
      });
    });

    // Attempt to create transaction
    await page.click('[data-testid="nav-transactions"]');
    await page.click('[data-testid="create-transaction-button"]');
    
    // Fill form and submit
    await page.selectOption('[data-testid="payment-method-select"]', 'mobile_money');
    // ... fill other fields
    await page.click('[data-testid="submit-transaction"]');

    // Expect error message
    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('Payment processing failed');
  });
});
```

### Test Data Management

#### Test Database Seeding
```typescript
// tests/utils/test-database.ts
export class TestDatabase {
  constructor(private connection: DataSource) {}

  static async create(): Promise<TestDatabase> {
    const connection = await createTestConnection();
    return new TestDatabase(connection);
  }

  async seed(): Promise<void> {
    // Seed test tenants
    await this.connection.getRepository(Tenant).save([
      {
        id: 'test-tenant-1',
        companyName: 'Test Oil Company',
        companyCode: 'TEST001',
        subscriptionPlan: 'professional'
      }
    ]);

    // Seed test stations
    await this.connection.getRepository(Station).save([
      {
        id: 'test-station-1',
        tenantId: 'test-tenant-1',
        name: 'Test Station 1',
        code: 'TST001',
        status: 'active'
      }
    ]);

    // Seed test inventory
    await this.connection.getRepository(Tank).save([
      {
        id: 'test-tank-1',
        stationId: 'test-station-1',
        fuelType: FuelType.PMS,
        capacity: 10000,
        currentLevel: 5000
      }
    ]);
  }

  async clean(): Promise<void> {
    const entities = [Transaction, Tank, Station, Tenant];
    for (const entity of entities) {
      await this.connection.getRepository(entity).delete({});
    }
  }

  async destroy(): Promise<void> {
    await this.connection.destroy();
  }
}
```

---

## Documentation Standards

### Code Documentation

#### JSDoc Standards
```typescript
/**
 * Processes a fuel transaction and updates inventory levels.
 * 
 * @param transactionData - The transaction details
 * @param auditContext - User and request context for auditing
 * @returns Promise resolving to the created transaction
 * 
 * @throws {InsufficientInventoryError} When station doesn't have enough fuel
 * @throws {ValidationError} When transaction data is invalid
 * @throws {PaymentError} When payment processing fails
 * 
 * @example
 * ```typescript
 * const transaction = await transactionService.createTransaction({
 *   stationId: 'station-123',
 *   fuelType: FuelType.PMS,
 *   quantity: 50,
 *   unitPrice: 15.75,
 *   paymentMethod: 'cash'
 * }, { userId: 'user-456', ipAddress: '192.168.1.1' });
 * ```
 */
async createTransaction(
  transactionData: CreateTransactionDto,
  auditContext: AuditContext
): Promise<Transaction> {
  // Implementation
}
```

#### Interface Documentation
```typescript
/**
 * Represents a fuel transaction in the system.
 * 
 * @interface Transaction
 */
interface Transaction {
  /** Unique identifier for the transaction */
  readonly id: string;
  
  /** ID of the station where transaction occurred */
  readonly stationId: string;
  
  /** Type of fuel dispensed */
  readonly fuelType: FuelType;
  
  /** 
   * Quantity of fuel dispensed in liters
   * @minimum 0.001
   * @maximum 50000
   */
  readonly quantity: number;
  
  /** 
   * Unit price per liter at time of transaction
   * @minimum 0.01
   */
  readonly unitPrice: number;
  
  /** 
   * Total amount charged (quantity * unitPrice + taxes)
   * @computed
   */
  readonly totalAmount: number;
  
  /** Current status of the transaction */
  readonly status: TransactionStatus;
  
  /** Timestamp when transaction was created */
  readonly createdAt: Date;
  
  /** Timestamp when transaction was last updated */
  readonly updatedAt: Date;
}
```

### README Standards

#### Project README Template
```markdown
# Ghana OMC SaaS ERP - [Service Name]

Brief description of the service and its purpose.

## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## Features
- Feature 1
- Feature 2  
- Feature 3

## Prerequisites
- Node.js >= 18.0.0
- PostgreSQL >= 15
- Redis >= 7.0

## Installation
```bash
# Clone repository
git clone https://github.com/omc-erp/service-name.git
cd service-name

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

## Configuration
Environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - Secret for JWT token signing

## Testing
```bash
# Run unit tests
npm run test

# Run integration tests  
npm run test:integration

# Run with coverage
npm run test:coverage
```

## API Documentation
API documentation is available at `/api/docs` when running the development server.

## Contributing
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.
```

---

## Security Guidelines

### Input Validation

#### Backend Validation
```typescript
// Use class-validator for DTOs
export class CreateTransactionDto {
  @IsUUID(4, { message: 'Station ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Station ID is required' })
  stationId: string;

  @IsEnum(FuelType, { message: 'Invalid fuel type' })
  fuelType: FuelType;

  @IsNumber({}, { message: 'Quantity must be a number' })
  @Min(0.001, { message: 'Quantity must be greater than 0' })
  @Max(50000, { message: 'Quantity cannot exceed 50,000 liters' })
  quantity: number;

  @IsNumber({}, { message: 'Unit price must be a number' })
  @Min(0.01, { message: 'Unit price must be greater than 0' })
  unitPrice: number;

  @IsEnum(['cash', 'card', 'mobile_money', 'credit'], {
    message: 'Invalid payment method'
  })
  paymentMethod: string;

  @IsOptional()
  @IsUUID(4, { message: 'Customer ID must be a valid UUID' })
  customerId?: string;
}
```

#### SQL Injection Prevention
```typescript
// ❌ Never use string concatenation for queries
const query = `SELECT * FROM transactions WHERE id = '${id}'`;

// ✅ Always use parameterized queries
const transaction = await this.repository.findOne({
  where: { id },
  relations: ['station', 'customer']
});

// ✅ For complex queries, use query builder
const transactions = await this.repository
  .createQueryBuilder('t')
  .leftJoinAndSelect('t.station', 's')
  .where('t.stationId = :stationId', { stationId })
  .andWhere('t.createdAt >= :startDate', { startDate })
  .orderBy('t.createdAt', 'DESC')
  .getMany();
```

#### XSS Prevention
```typescript
// Frontend input sanitization
import DOMPurify from 'dompurify';

const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

// Use in form handlers
const handleSubmit = (formData: FormData) => {
  const sanitizedData = {
    stationName: sanitizeInput(formData.get('stationName') as string),
    address: sanitizeInput(formData.get('address') as string)
  };
  
  // Process sanitized data
};
```

### Authentication & Authorization

#### JWT Implementation
```typescript
// JWT service with proper security
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async generateTokens(user: User): Promise<TokenPair> {
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      roles: user.roles.map(r => r.name)
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m', // Short-lived access token
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      algorithm: 'HS256'
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, tokenType: 'refresh' },
      {
        expiresIn: '7d',
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        algorithm: 'HS256'
      }
    );

    // Store refresh token hash in database
    await this.storeRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }
}
```

#### Role-Based Access Control
```typescript
// Custom decorator for role-based authorization
export const RequireRole = (...roles: string[]) => 
  SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.some(role => user.roles.includes(role));
  }
}

// Usage in controller
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @RequireRole('admin', 'super_admin')
  async getUsers() {
    // Only admin and super_admin can access
  }

  @Post('stations')
  @RequireRole('admin', 'regional_manager')
  async createStation() {
    // Admin and regional managers can create stations
  }
}
```

### Data Protection

#### Sensitive Data Handling
```typescript
// Encrypt sensitive data before storing
import { createCipher, createDecipher } from 'crypto';

export class EncryptionService {
  private algorithm = 'aes-256-cbc';
  private key: string;

  constructor(private configService: ConfigService) {
    this.key = this.configService.get('ENCRYPTION_KEY');
  }

  encrypt(text: string): string {
    const cipher = createCipher(this.algorithm, this.key);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  decrypt(encryptedText: string): string {
    const decipher = createDecipher(this.algorithm, this.key);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

// Use for sensitive fields
@Entity()
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  // Encrypt phone number
  @Column({ transformer: new EncryptionTransformer() })
  phoneNumber: string;

  // Encrypt tax ID
  @Column({ transformer: new EncryptionTransformer() })
  taxId: string;
}
```

#### Secrets Management
```typescript
// Use AWS Secrets Manager or similar
@Injectable()
export class SecretsService {
  constructor(private configService: ConfigService) {}

  async getSecret(secretName: string): Promise<string> {
    if (process.env.NODE_ENV === 'development') {
      return process.env[secretName];
    }

    // In production, fetch from AWS Secrets Manager
    const client = new SecretsManagerClient({
      region: this.configService.get('AWS_REGION')
    });

    const command = new GetSecretValueCommand({
      SecretId: secretName
    });

    const response = await client.send(command);
    return response.SecretString;
  }
}
```

---

## Performance Guidelines

### Database Optimization

#### Query Optimization
```typescript
// ❌ N+1 query problem
const stations = await stationRepository.find();
for (const station of stations) {
  // This creates N additional queries
  station.tanks = await tankRepository.find({ 
    where: { stationId: station.id } 
  });
}

// ✅ Use eager loading or query builder
const stations = await stationRepository.find({
  relations: ['tanks', 'manager']
});

// ✅ Or use query builder for complex queries
const stationsWithTanks = await stationRepository
  .createQueryBuilder('station')
  .leftJoinAndSelect('station.tanks', 'tank')
  .leftJoinAndSelect('station.manager', 'manager')
  .where('station.status = :status', { status: 'active' })
  .getMany();
```

#### Pagination Implementation
```typescript
// Implement cursor-based pagination for large datasets
interface PaginationParams {
  limit: number;
  cursor?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  hasNextPage: boolean;
  nextCursor?: string;
}

async function getTransactionsPaginated(
  params: PaginationParams
): Promise<PaginatedResponse<Transaction>> {
  const { limit, cursor } = params;
  const queryBuilder = transactionRepository
    .createQueryBuilder('t')
    .orderBy('t.createdAt', 'DESC')
    .limit(limit + 1); // Fetch one extra to check if there's a next page

  if (cursor) {
    const cursorDate = new Date(Buffer.from(cursor, 'base64').toString());
    queryBuilder.where('t.createdAt < :cursor', { cursor: cursorDate });
  }

  const transactions = await queryBuilder.getMany();
  const hasNextPage = transactions.length > limit;
  
  if (hasNextPage) {
    transactions.pop(); // Remove the extra record
  }

  const nextCursor = hasNextPage 
    ? Buffer.from(transactions[transactions.length - 1].createdAt.toISOString()).toString('base64')
    : undefined;

  return {
    data: transactions,
    hasNextPage,
    nextCursor
  };
}
```

### Caching Strategy

#### Redis Caching
```typescript
@Injectable()
export class CacheService {
  constructor(
    @Inject('REDIS_CLIENT') private redis: Redis,
    private logger: Logger
  ) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      this.logger.error(`Cache get failed for key ${key}`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      this.logger.error(`Cache set failed for key ${key}`, error);
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.error(`Cache invalidation failed for pattern ${pattern}`, error);
    }
  }
}

// Cache decorator for service methods
export function Cacheable(ttl: number, keyPrefix?: string) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${keyPrefix || target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      
      // Try to get from cache
      const cached = await this.cacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      await this.cacheService.set(cacheKey, result, ttl);
      
      return result;
    };
  };
}

// Usage
@Injectable()
export class StationService {
  @Cacheable(300, 'station') // Cache for 5 minutes
  async getStationById(id: string): Promise<Station> {
    return this.stationRepository.findOne({ where: { id } });
  }
}
```

### Frontend Performance

#### React Optimization
```typescript
// Use React.memo for expensive components
export const TransactionList = React.memo<TransactionListProps>(({
  transactions,
  onTransactionClick
}) => {
  const memoizedTransactions = useMemo(() => {
    return transactions.map(transaction => ({
      ...transaction,
      formattedAmount: formatCurrency(transaction.totalAmount)
    }));
  }, [transactions]);

  return (
    <div className="transaction-list">
      {memoizedTransactions.map(transaction => (
        <TransactionItem
          key={transaction.id}
          transaction={transaction}
          onClick={onTransactionClick}
        />
      ))}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function
  return (
    prevProps.transactions.length === nextProps.transactions.length &&
    prevProps.transactions.every((prev, index) => 
      prev.id === nextProps.transactions[index]?.id
    )
  );
});

// Virtualization for large lists
import { FixedSizeList as List } from 'react-window';

export const VirtualizedTransactionList: React.FC<{
  transactions: Transaction[];
}> = ({ transactions }) => {
  const Row = ({ index, style }: any) => (
    <div style={style}>
      <TransactionItem transaction={transactions[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={transactions.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

#### Bundle Optimization
```typescript
// Code splitting with lazy loading
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const TransactionReports = lazy(() => 
  import('./TransactionReports').then(module => ({
    default: module.TransactionReports
  }))
);

const StationAnalytics = lazy(() => import('./StationAnalytics'));

// Use in routing
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/transactions" element={<TransactionList />} />
        <Route 
          path="/reports" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <TransactionReports />
            </Suspense>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <StationAnalytics />
            </Suspense>
          } 
        />
      </Routes>
    </Router>
  );
}
```

---

## Code Review Process

### Review Checklist

#### Functionality Review
- [ ] Code solves the intended problem
- [ ] Business logic is correct
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] Input validation is thorough

#### Code Quality Review
- [ ] Code is readable and self-documenting
- [ ] Functions are focused and single-purpose
- [ ] Variable and function names are descriptive
- [ ] Code follows established patterns
- [ ] No code duplication (DRY principle)

#### Performance Review
- [ ] No obvious performance bottlenecks
- [ ] Database queries are optimized
- [ ] Caching is used appropriately
- [ ] Memory usage is reasonable
- [ ] No blocking operations on main thread

#### Security Review
- [ ] Input is properly validated and sanitized
- [ ] Authentication and authorization are correct
- [ ] Sensitive data is protected
- [ ] No hardcoded secrets or credentials
- [ ] SQL injection prevention measures in place

#### Testing Review
- [ ] Unit tests cover new functionality
- [ ] Integration tests for external dependencies
- [ ] Edge cases are tested
- [ ] Test coverage meets minimum requirements
- [ ] Tests are maintainable and reliable

### Review Comments Guidelines

#### Constructive Feedback
```bash
# ✅ Good feedback - specific and actionable
"Consider extracting this validation logic into a separate function 
to improve readability and reusability. You could create a 
`validateTransactionData()` function."

"This query could cause performance issues with large datasets. 
Consider adding pagination or using cursor-based pagination."

# ❌ Poor feedback - vague and unhelpful  
"This doesn't look right"
"Fix this"
```

#### Severity Levels
```bash
# Critical (Must fix before merge)
CRITICAL: This creates a security vulnerability - passwords are logged in plaintext

# Major (Should fix before merge)
MAJOR: This N+1 query will cause performance issues in production

# Minor (Nice to have)
MINOR: Consider using a more descriptive variable name here

# Nitpick (Optional style suggestion)
NIT: Extra whitespace on line 45
```

---

## Release Process

### Version Management

#### Semantic Versioning
```bash
# Version format: MAJOR.MINOR.PATCH
# Example: 1.2.3

# MAJOR: Breaking changes that require migration
1.0.0 -> 2.0.0 (Database schema changes, API breaking changes)

# MINOR: New features that are backwards compatible  
1.1.0 -> 1.2.0 (New API endpoints, new features)

# PATCH: Bug fixes and small improvements
1.1.1 -> 1.1.2 (Bug fixes, security patches)
```

#### Release Branch Strategy
```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Update version numbers
npm version 1.2.0
git add .
git commit -m "chore: bump version to 1.2.0"

# Create PR to main
git push origin release/v1.2.0
# Create PR: release/v1.2.0 -> main

# After PR approval and merge
git checkout main
git pull origin main
git tag v1.2.0
git push origin v1.2.0

# Merge back to develop
git checkout develop
git merge main
git push origin develop
```

### Deployment Pipeline

#### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test:coverage
        
      - name: Run integration tests
        run: npm run test:integration
        
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: af-south-1
          
      - name: Login to Amazon ECR
        uses: aws-actions/amazon-ecr-login@v1
        
      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: omc-erp
          IMAGE_TAG: ${{ github.ref_name }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Update ArgoCD Application
        run: |
          # Update Helm values with new image tag
          argocd app patch omc-erp-production \
            --patch '{"spec":{"source":{"helm":{"parameters":[{"name":"image.tag","value":"'${{ github.ref_name }}'"}]}}}}' \
            --type merge
```

### Release Documentation

#### Changelog Format
```markdown
# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2025-01-12

### Added
- Mobile money integration for MTN and Vodafone Cash
- Real-time fuel level monitoring via IoT sensors
- Advanced analytics dashboard with predictive insights
- Multi-language support (English and French)

### Changed  
- Improved transaction processing performance by 40%
- Updated API response format for better consistency
- Enhanced error messages for better user experience

### Fixed
- Resolved memory leak in real-time data processing
- Fixed timezone issues in transaction timestamps
- Corrected inventory calculation edge cases

### Security
- Implemented rate limiting on authentication endpoints
- Added input sanitization for all user inputs
- Updated JWT token security configuration

## [1.1.2] - 2025-01-05

### Fixed
- Critical security vulnerability in password reset flow
- Database connection pool exhaustion under high load

### Security
- Updated all dependencies to latest secure versions
```

---

## Tools and Setup

### Development Environment

#### Required Extensions (VS Code)
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-jest",
    "humao.rest-client",
    "ms-vscode.vscode-docker",
    "ms-kubernetes-tools.vscode-kubernetes-tools",
    "github.vscode-pull-request-github"
  ]
}
```

#### VS Code Settings
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "jest.autoRun": "off",
  "files.associations": {
    "*.env*": "dotenv"
  }
}
```

### Code Quality Tools

#### ESLint Configuration
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    '@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'max-len': ['error', { code: 100 }],
    'max-depth': ['error', 4],
    'complexity': ['error', 10]
  }
};
```

#### Prettier Configuration
```javascript
// .prettierrc.js
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  endOfLine: 'lf'
};
```

#### Husky Git Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged && npm run type-check",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS",
      "pre-push": "npm run test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yaml,yml}": [
      "prettier --write"
    ]
  }
}
```

---

*Document Version: 1.0*  
*Last Updated: January 2025*  
*Next Review: Quarterly*