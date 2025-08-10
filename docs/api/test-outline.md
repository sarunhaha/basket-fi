# Test Strategy for Basket.fi MVP API

## Testing Pyramid

### Unit Tests (70%)
- **Service Layer**: Business logic, calculations, validations
- **Utility Functions**: Formatting, validation helpers
- **Guards & Middleware**: Authentication, authorization, rate limiting
- **DTOs & Schemas**: Zod validation schemas

### Integration Tests (20%)
- **API Endpoints**: Full request/response cycle
- **Database Operations**: Prisma queries and transactions
- **External Services**: Price feeds, blockchain interactions
- **Authentication Flow**: JWT token generation and validation

### End-to-End Tests (10%)
- **Critical User Journeys**: Complete workflows
- **Cross-Service Integration**: Frontend + Backend + Database
- **Performance Testing**: Load and stress testing

## Test Categories

### 1. Authentication & Authorization Tests

#### Unit Tests
```typescript
// auth.service.spec.ts
describe('AuthService', () => {
  describe('validateWalletSignature', () => {
    it('should validate correct signature')
    it('should reject invalid signature')
    it('should handle malformed addresses')
  })
  
  describe('login', () => {
    it('should create new user on first login')
    it('should return existing user')
    it('should generate valid JWT tokens')
  })
})
```

#### Integration Tests
```typescript
// auth.e2e-spec.ts
describe('/auth (e2e)', () => {
  describe('POST /auth/login', () => {
    it('should authenticate with valid signature')
    it('should reject invalid signature')
    it('should handle rate limiting')
  })
})
```

### 2. Basket Management Tests

#### Unit Tests
```typescript
// baskets.service.spec.ts
describe('BasketsService', () => {
  describe('create', () => {
    it('should create basket with valid allocations')
    it('should reject allocations not summing to 100%')
    it('should validate token addresses')
  })
  
  describe('rebalance', () => {
    it('should calculate rebalance trades')
    it('should handle dry run scenarios')
    it('should respect idempotency')
  })
})
```

#### Integration Tests
```typescript
// baskets.e2e-spec.ts
describe('/baskets (e2e)', () => {
  describe('POST /baskets', () => {
    it('should create basket with allocations')
    it('should enforce user ownership')
    it('should validate allocation percentages')
  })
  
  describe('POST /baskets/:id/rebalance', () => {
    it('should initiate rebalance')
    it('should handle idempotency keys')
    it('should calculate gas estimates')
  })
})
```

### 3. Data Validation Tests

#### Schema Validation
```typescript
// validation.spec.ts
describe('Zod Schemas', () => {
  describe('CreateBasketSchema', () => {
    it('should validate valid basket data')
    it('should reject invalid allocations')
    it('should enforce string length limits')
  })
  
  describe('AllocationSchema', () => {
    it('should validate percentage ranges')
    it('should require token address')
    it('should handle decimal precision')
  })
})
```

### 4. Database Tests

#### Repository Tests
```typescript
// prisma.service.spec.ts
describe('PrismaService', () => {
  describe('basket operations', () => {
    it('should create basket with relations')
    it('should soft delete baskets')
    it('should handle concurrent updates')
  })
  
  describe('pagination', () => {
    it('should implement cursor pagination')
    it('should handle edge cases')
    it('should maintain sort order')
  })
})
```

### 5. Security Tests

#### Authentication Tests
```typescript
// jwt-auth.guard.spec.ts
describe('JwtAuthGuard', () => {
  it('should allow valid tokens')
  it('should reject expired tokens')
  it('should handle malformed tokens')
})

// rate-limiting.spec.ts
describe('Rate Limiting', () => {
  it('should enforce request limits')
  it('should reset limits after window')
  it('should handle different endpoints')
})
```

### 6. Performance Tests

#### Load Testing
```typescript
// load.spec.ts
describe('Load Testing', () => {
  it('should handle 100 concurrent users')
  it('should maintain response times under load')
  it('should not leak memory')
})
```

## Test Data Management

### Test Database Setup
```typescript
// test-setup.ts
beforeAll(async () => {
  // Setup test database
  await prisma.$executeRaw`CREATE DATABASE test_basket_fi`;
  await prisma.migrate.deploy();
});

afterAll(async () => {
  // Cleanup
  await prisma.$executeRaw`DROP DATABASE test_basket_fi`;
  await prisma.$disconnect();
});
```

### Factory Pattern for Test Data
```typescript
// factories/user.factory.ts
export const createTestUser = (overrides = {}) => ({
  walletAddress: ethers.Wallet.createRandom().address,
  displayName: 'Test User',
  email: 'test@example.com',
  ...overrides,
});

// factories/basket.factory.ts
export const createTestBasket = (userId: string, overrides = {}) => ({
  name: 'Test Basket',
  description: 'Test Description',
  userId,
  isPublic: false,
  ...overrides,
});
```

## Mock Strategies

### External Service Mocks
```typescript
// mocks/price-service.mock.ts
export const mockPriceService = {
  getTokenPrice: jest.fn().mockResolvedValue('100.00'),
  getHistoricalPrices: jest.fn().mockResolvedValue([]),
  subscribeToUpdates: jest.fn(),
};

// mocks/blockchain.mock.ts
export const mockBlockchainService = {
  estimateGas: jest.fn().mockResolvedValue('0.005'),
  executeTransaction: jest.fn().mockResolvedValue('0x123...'),
  getTransactionStatus: jest.fn().mockResolvedValue('confirmed'),
};
```

## Test Configuration

### Jest Configuration
```javascript
// jest.config.js
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/*.e2e-spec.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};
```

### Test Environment Variables
```bash
# .env.test
DATABASE_URL="postgresql://test:test@localhost:5432/test_basket_fi"
JWT_SECRET="test-secret"
REDIS_URL="redis://localhost:6379/1"
NODE_ENV="test"
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run unit tests
        run: pnpm test
      
      - name: Run e2e tests
        run: pnpm test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Test Metrics & Coverage

### Coverage Targets
- **Overall Coverage**: 85%
- **Service Layer**: 90%
- **Controller Layer**: 80%
- **Critical Paths**: 95%

### Quality Gates
- All tests must pass
- Coverage thresholds must be met
- No security vulnerabilities
- Performance benchmarks met

## Test Maintenance

### Regular Tasks
- Update test data factories
- Review and update mocks
- Maintain test database schemas
- Update integration test scenarios

### Test Review Process
- Peer review for new tests
- Regular test suite performance review
- Quarterly test strategy assessment
- Annual testing tool evaluation