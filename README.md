# Basket-Fi

Create, track, and rebalance token baskets on Monad with backtesting, alerts, and optional on-chain deployment.

## 🏗️ Architecture

This is a pnpm + Turborepo monorepo with the following structure:

```
basket-fi/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   ├── backend/      # NestJS API server
│   └── mobile/       # Expo React Native (optional)
├── packages/
│   ├── ui/           # Shared React components
│   ├── types/        # Shared TypeScript types & Zod schemas
│   ├── utils/        # Shared utilities
│   └── config/       # Shared configs (ESLint, Prettier, TypeScript)
└── docker-compose.yml # Local development services
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd basket-fi
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# Copy example env files
cp apps/web/.env.example apps/web/.env.local
cp apps/backend/.env.example apps/backend/.env
```

4. Start development services:
```bash
# Start database and Redis
docker-compose up postgres redis -d

# Generate Prisma client and run migrations
pnpm db:generate
pnpm db:migrate

# Start all apps in development mode
pnpm dev
```

## 📱 Development Commands

### Global Commands

```bash
# Install dependencies
pnpm install

# Start all apps in development
pnpm dev

# Build all packages and apps
pnpm build

# Run linting across all packages
pnpm lint
pnpm lint:fix

# Run type checking
pnpm typecheck

# Run tests
pnpm test

# Format code
pnpm format

# Clean build artifacts
pnpm clean
```

### Database Commands

```bash
# Generate Prisma client
pnpm db:generate

# Push schema changes to database
pnpm db:push

# Run database migrations
pnpm db:migrate

# Open Prisma Studio
cd apps/backend && pnpm db:studio
```

## 🔧 Individual App Commands

### Web App (Frontend)
```bash
# Development server
cd apps/web && pnpm dev
# or
pnpm --filter @basket-fi/web dev

# Build for production
pnpm --filter @basket-fi/web build

# Start production server
pnpm --filter @basket-fi/web start
```

### Backend API
```bash
# Development server
cd apps/backend && pnpm dev
# or
pnpm --filter @basket-fi/backend dev

# Build for production
pnpm --filter @basket-fi/backend build

# Start production server
pnpm --filter @basket-fi/backend start:prod
```

### Mobile App (Optional)
```bash
# Development server
cd apps/mobile && pnpm dev
# or
pnpm --filter @basket-fi/mobile dev

# iOS simulator
pnpm --filter @basket-fi/mobile ios

# Android emulator
pnpm --filter @basket-fi/mobile android
```

## 🐳 Docker Development

### Full Stack with Docker Compose
```bash
# Start all services
docker-compose up

# Start specific services
docker-compose up postgres redis
docker-compose up backend
docker-compose up web

# Build and start
docker-compose up --build

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Individual Docker Builds
```bash
# Build backend image
docker build -f apps/backend/Dockerfile -t basket-fi-backend .

# Build web image
docker build -f apps/web/Dockerfile -t basket-fi-web .
```

## 🌐 Service URLs

When running locally:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/docs
- **Database**: localhost:5432
- **Redis**: localhost:6379

## 📦 Package Structure

### `@basket-fi/ui`
Shared React components built with Radix UI and Tailwind CSS.

### `@basket-fi/types`
Shared TypeScript types and Zod validation schemas.

### `@basket-fi/utils`
Shared utility functions for formatting, validation, and constants.

### `@basket-fi/config`
Shared configuration files for ESLint, Prettier, and TypeScript.

## 🔐 Environment Variables

### Backend (.env)
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/basket_fi_dev"
REDIS_URL="redis://localhost:6379"
COINGECKO_API_KEY="your_coingecko_api_key"
MONAD_RPC_URL="https://testnet-rpc.monad.xyz"
NODE_ENV="development"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
NEXT_PUBLIC_MONAD_RPC_URL="https://testnet-rpc.monad.xyz"
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_walletconnect_project_id"
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:cov

# Run E2E tests
pnpm test:e2e
```

## 📝 Code Quality

This project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for git hooks
- **lint-staged** for pre-commit checks

Pre-commit hooks will automatically:
- Run ESLint with auto-fix
- Format code with Prettier
- Run type checking

## 🚢 Deployment

### GitHub Actions

The project includes CI/CD workflows:

- **CI**: Runs on PRs and pushes to main/develop
  - Install dependencies
  - Run linting and type checking
  - Run tests
  - Build all packages

- **CD**: Runs on pushes to main
  - Build Docker images
  - Push to GitHub Container Registry

### Manual Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.