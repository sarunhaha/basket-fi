# Technology Stack

## Build System
- **Monorepo**: Turborepo with pnpm workspaces
- **Package Manager**: pnpm (>=8.0.0)
- **Node Version**: >=18.17.0
- **TypeScript**: v5.2+ across all packages

## Backend Stack
- **Framework**: NestJS with Express
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Validation**: Zod schemas with nestjs-zod
- **API Documentation**: Swagger/OpenAPI
- **Authentication**: Web3 wallet-based

## Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS with custom UI components
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **Web3**: Wagmi v2 + Viem + RainbowKit
- **Charts**: Recharts
- **Internationalization**: next-intl

## Development Tools
- **Linting**: ESLint with custom configs per app type
- **Formatting**: Prettier with lint-staged
- **Git Hooks**: Husky for pre-commit checks
- **Containerization**: Docker with docker-compose for local development

## Common Commands

### Development
```bash
# Start all services in development mode
pnpm dev

# Start with Docker (includes database)
docker-compose up

# Database operations
pnpm db:generate    # Generate Prisma client
pnpm db:push        # Push schema changes
pnpm db:migrate     # Run migrations
```

### Building & Testing
```bash
# Build all packages
pnpm build

# Run linting
pnpm lint
pnpm lint:fix

# Type checking
pnpm typecheck

# Run tests
pnpm test

# Format code
pnpm format
```

### Package Management
```bash
# Install dependencies
pnpm install

# Add dependency to specific workspace
pnpm add <package> --filter @basket-fi/web
pnpm add <package> --filter @basket-fi/backend
```