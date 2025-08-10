# Basket-Fi Backend API

NestJS REST API server for managing token baskets, users, and blockchain interactions.

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis
- **Validation**: Zod + class-validator
- **Documentation**: OpenAPI/Swagger
- **Testing**: Jest

## 🚀 Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start:prod

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e
```

## 📁 Project Structure

```
src/
├── app.module.ts       # Root application module
├── main.ts            # Application entry point
├── prisma/            # Database service
├── baskets/           # Basket management
├── tokens/            # Token data and prices
├── users/             # User management
├── alerts/            # Alert system
└── common/            # Shared utilities
```

## 🗄️ Database

### Setup

```bash
# Generate Prisma client
pnpm db:generate

# Run database migrations
pnpm db:migrate

# Push schema changes (development)
pnpm db:push

# Open Prisma Studio
pnpm db:studio
```

### Schema

The database includes these main entities:

- **Users**: Wallet addresses and preferences
- **Baskets**: Token basket configurations
- **Tokens**: Token metadata and prices
- **TokenAllocations**: Basket composition
- **TokenPriceHistory**: Historical price data
- **Alerts**: User notifications

## 🌐 Environment Variables

Create a `.env` file:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/basket_fi_dev"

# Redis
REDIS_URL="redis://localhost:6379"

# API Keys
COINGECKO_API_KEY="your_coingecko_api_key"
INFURA_API_KEY="your_infura_api_key"

# Blockchain
MONAD_RPC_URL="https://testnet-rpc.monad.xyz"
ETHEREUM_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"

# Application
NODE_ENV="development"
PORT=3001
API_PREFIX="api/v1"
CORS_ORIGIN="http://localhost:3000"

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100
```

## 📚 API Documentation

When running locally, visit:
- **Swagger UI**: http://localhost:3001/docs
- **OpenAPI JSON**: http://localhost:3001/docs-json

### Main Endpoints

```
GET    /api/v1/baskets          # List user baskets
POST   /api/v1/baskets          # Create basket
GET    /api/v1/baskets/:id      # Get basket details
PUT    /api/v1/baskets/:id      # Update basket
DELETE /api/v1/baskets/:id      # Delete basket

GET    /api/v1/tokens           # Search tokens
GET    /api/v1/tokens/:address  # Get token details
GET    /api/v1/tokens/:address/history # Price history

GET    /api/v1/users/profile    # Get user profile
PUT    /api/v1/users/profile    # Update profile

GET    /api/v1/alerts           # List user alerts
POST   /api/v1/alerts           # Create alert
DELETE /api/v1/alerts/:id       # Delete alert
```

## 🔐 Authentication

Currently using wallet-based authentication:

1. Frontend signs a message with user's wallet
2. Backend verifies the signature
3. JWT token issued for subsequent requests

## 📊 Data Sources

### Price Data
- **CoinGecko API**: Token prices and metadata
- **DEX Subgraphs**: On-chain price data
- **Monad RPC**: Direct blockchain queries

### Caching Strategy
- **Redis**: API response caching
- **Database**: Historical data storage
- **Memory**: Frequently accessed data

## 🧪 Testing

```bash
# Unit tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:cov

# E2E tests
pnpm test:e2e
```

## 🚀 Deployment

### Docker

```bash
# Build image
docker build -f Dockerfile -t basket-fi-backend .

# Run container
docker run -p 3001:3001 basket-fi-backend
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure production database
- [ ] Set up Redis cluster
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure CORS for production domains
- [ ] Set up SSL/TLS certificates

## 🔧 Configuration

### Rate Limiting

Default configuration:
- 100 requests per minute per IP
- Configurable via environment variables

### CORS

Configure allowed origins in production:
```bash
CORS_ORIGIN="https://yourdomain.com,https://app.yourdomain.com"
```

### Database Connection

Use connection pooling in production:
```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=20"
```