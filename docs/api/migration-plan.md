# Migration Plan for Basket.fi MVP

## Overview
This document outlines the database migration strategy for the Basket.fi MVP, including schema changes, data migration, and deployment considerations.

## Migration Strategy

### Phase 1: Initial Schema Setup
```bash
# Generate initial migration
npx prisma migrate dev --name init

# Apply migration to development database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### Phase 2: Seed Data
```bash
# Run seed script to populate initial data
npx prisma db seed
```

### Phase 3: Production Deployment
```bash
# Deploy migrations to production
npx prisma migrate deploy

# Verify migration status
npx prisma migrate status
```

## Migration Files

### 001_init.sql
```sql
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "RebalanceStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'SWAP', 'REBALANCE');
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED');
CREATE TYPE "AlertType" AS ENUM ('PRICE', 'PERCENTAGE_CHANGE', 'REBALANCE_NEEDED', 'PORTFOLIO_VALUE');
CREATE TYPE "AlertCondition" AS ENUM ('ABOVE', 'BELOW', 'CHANGE_UP', 'CHANGE_DOWN');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "email" TEXT,
    "displayName" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT false,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "language" TEXT NOT NULL DEFAULT 'en',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "baskets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "totalValue" DECIMAL(20,8),
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "baskets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "basket_assets" (
    "id" TEXT NOT NULL,
    "basketId" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "logoUri" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "basket_assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocations" (
    "id" TEXT NOT NULL,
    "basketId" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "targetPercentage" DECIMAL(5,2) NOT NULL,
    "currentPercentage" DECIMAL(5,2) NOT NULL,
    "amount" DECIMAL(20,8) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rebalances" (
    "id" TEXT NOT NULL,
    "basketId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "RebalanceStatus" NOT NULL DEFAULT 'PENDING',
    "totalValue" DECIMAL(20,8),
    "trades" JSONB NOT NULL,
    "estimatedGas" DECIMAL(20,8),
    "transactionHash" TEXT,
    "executedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rebalances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "basketId" TEXT,
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(20,8) NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "transactionHash" TEXT,
    "gasUsed" DECIMAL(20,8),
    "gasPrice" DECIMAL(20,8),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_snapshots" (
    "id" TEXT NOT NULL,
    "tokenAddress" TEXT NOT NULL,
    "price" DECIMAL(20,8) NOT NULL,
    "volume24h" DECIMAL(20,8),
    "marketCap" DECIMAL(20,8),
    "priceChange24h" DECIMAL(10,4),
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "basketId" TEXT,
    "tokenAddress" TEXT,
    "type" "AlertType" NOT NULL,
    "condition" "AlertCondition" NOT NULL,
    "value" DECIMAL(20,8) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTriggered" BOOLEAN NOT NULL DEFAULT false,
    "lastTriggered" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_walletAddress_key" ON "users"("walletAddress");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_walletAddress_idx" ON "users"("walletAddress");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

CREATE UNIQUE INDEX "wallets_address_key" ON "wallets"("address");
CREATE INDEX "wallets_userId_idx" ON "wallets"("userId");
CREATE INDEX "wallets_address_idx" ON "wallets"("address");
CREATE INDEX "wallets_chainId_idx" ON "wallets"("chainId");

CREATE INDEX "baskets_userId_idx" ON "baskets"("userId");
CREATE INDEX "baskets_isPublic_idx" ON "baskets"("isPublic");
CREATE INDEX "baskets_isActive_idx" ON "baskets"("isActive");
CREATE INDEX "baskets_createdAt_idx" ON "baskets"("createdAt");

CREATE UNIQUE INDEX "basket_assets_basketId_tokenAddress_key" ON "basket_assets"("basketId", "tokenAddress");
CREATE INDEX "basket_assets_tokenAddress_idx" ON "basket_assets"("tokenAddress");
CREATE INDEX "basket_assets_symbol_idx" ON "basket_assets"("symbol");

CREATE UNIQUE INDEX "allocations_basketId_tokenAddress_key" ON "allocations"("basketId", "tokenAddress");
CREATE INDEX "allocations_basketId_idx" ON "allocations"("basketId");
CREATE INDEX "allocations_tokenAddress_idx" ON "allocations"("tokenAddress");

CREATE INDEX "rebalances_basketId_idx" ON "rebalances"("basketId");
CREATE INDEX "rebalances_userId_idx" ON "rebalances"("userId");
CREATE INDEX "rebalances_status_idx" ON "rebalances"("status");
CREATE INDEX "rebalances_createdAt_idx" ON "rebalances"("createdAt");

CREATE INDEX "transactions_userId_idx" ON "transactions"("userId");
CREATE INDEX "transactions_basketId_idx" ON "transactions"("basketId");
CREATE INDEX "transactions_type_idx" ON "transactions"("type");
CREATE INDEX "transactions_status_idx" ON "transactions"("status");
CREATE UNIQUE INDEX "transactions_transactionHash_key" ON "transactions"("transactionHash");
CREATE INDEX "transactions_transactionHash_idx" ON "transactions"("transactionHash");
CREATE INDEX "transactions_createdAt_idx" ON "transactions"("createdAt");

CREATE UNIQUE INDEX "price_snapshots_tokenAddress_timestamp_key" ON "price_snapshots"("tokenAddress", "timestamp");
CREATE INDEX "price_snapshots_tokenAddress_idx" ON "price_snapshots"("tokenAddress");
CREATE INDEX "price_snapshots_timestamp_idx" ON "price_snapshots"("timestamp");
CREATE INDEX "price_snapshots_createdAt_idx" ON "price_snapshots"("createdAt");

CREATE INDEX "alerts_userId_idx" ON "alerts"("userId");
CREATE INDEX "alerts_basketId_idx" ON "alerts"("basketId");
CREATE INDEX "alerts_tokenAddress_idx" ON "alerts"("tokenAddress");
CREATE INDEX "alerts_type_idx" ON "alerts"("type");
CREATE INDEX "alerts_isActive_idx" ON "alerts"("isActive");
CREATE INDEX "alerts_isTriggered_idx" ON "alerts"("isTriggered");

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "baskets" ADD CONSTRAINT "baskets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "basket_assets" ADD CONSTRAINT "basket_assets_basketId_fkey" FOREIGN KEY ("basketId") REFERENCES "baskets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_basketId_fkey" FOREIGN KEY ("basketId") REFERENCES "baskets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "allocations" ADD CONSTRAINT "allocations_basketId_tokenAddress_fkey" FOREIGN KEY ("basketId", "tokenAddress") REFERENCES "basket_assets"("basketId", "tokenAddress") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rebalances" ADD CONSTRAINT "rebalances_basketId_fkey" FOREIGN KEY ("basketId") REFERENCES "baskets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "rebalances" ADD CONSTRAINT "rebalances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_basketId_fkey" FOREIGN KEY ("basketId") REFERENCES "baskets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_basketId_fkey" FOREIGN KEY ("basketId") REFERENCES "baskets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_basketId_tokenAddress_fkey" FOREIGN KEY ("basketId", "tokenAddress") REFERENCES "basket_assets"("basketId", "tokenAddress") ON DELETE CASCADE ON UPDATE CASCADE;
```

## Data Migration Considerations

### Existing Data Compatibility
- If migrating from existing system, create data transformation scripts
- Validate data integrity after migration
- Backup existing data before migration

### Performance Optimization
- Create indexes after bulk data insertion
- Use batch operations for large datasets
- Monitor query performance post-migration

## Rollback Strategy

### Backup Procedures
```bash
# Create database backup before migration
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup if needed
psql $DATABASE_URL < backup_file.sql
```

### Migration Rollback
```bash
# Rollback last migration
npx prisma migrate resolve --rolled-back 001_init

# Reset database (development only)
npx prisma migrate reset
```

## Environment-Specific Considerations

### Development
- Use `prisma migrate dev` for schema changes
- Seed database with test data
- Reset database as needed

### Staging
- Mirror production migration process
- Test with production-like data volume
- Validate application functionality

### Production
- Use `prisma migrate deploy` only
- Schedule maintenance window
- Monitor application health post-migration
- Have rollback plan ready

## Post-Migration Validation

### Data Integrity Checks
```sql
-- Verify user data
SELECT COUNT(*) FROM users WHERE deletedAt IS NULL;

-- Check basket allocations sum to 100%
SELECT basketId, SUM(targetPercentage) as total
FROM allocations 
GROUP BY basketId 
HAVING SUM(targetPercentage) != 100;

-- Validate foreign key relationships
SELECT COUNT(*) FROM baskets b 
LEFT JOIN users u ON b.userId = u.id 
WHERE u.id IS NULL;
```

### Performance Monitoring
- Monitor query execution times
- Check index usage
- Validate connection pool performance
- Monitor database resource utilization

## Security Considerations

### Access Control
- Limit migration user permissions
- Use separate credentials for migrations
- Audit migration execution

### Data Protection
- Encrypt sensitive data in transit and at rest
- Implement proper backup encryption
- Follow data retention policies

## Monitoring and Alerting

### Migration Monitoring
- Track migration execution time
- Monitor for migration failures
- Alert on rollback scenarios

### Application Health
- Monitor API response times post-migration
- Check error rates
- Validate critical user flows