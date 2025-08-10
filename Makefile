# Basket.fi Development Makefile

# Load environment variables
include .env
export

# Colors for output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
BLUE=\033[0;34m
NC=\033[0m # No Color

# Default target
.PHONY: help
help: ## Show this help message
	@echo "$(BLUE)Basket.fi Development Commands$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*##"; printf "Usage: make $(BLUE)<target>$(NC)\n\nTargets:\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

# =============================================================================
# DEVELOPMENT COMMANDS
# =============================================================================

.PHONY: install
install: ## Install all dependencies
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	pnpm install

.PHONY: dev
dev: ## Start development environment
	@echo "$(YELLOW)Starting development environment...$(NC)"
	docker-compose up -d postgres redis
	@sleep 5
	pnpm dev

.PHONY: dev-full
dev-full: ## Start full development environment with Docker
	@echo "$(YELLOW)Starting full development environment...$(NC)"
	docker-compose up -d

.PHONY: dev-observability
dev-observability: ## Start development with observability stack
	@echo "$(YELLOW)Starting development with observability...$(NC)"
	docker-compose --profile observability up -d

.PHONY: stop
stop: ## Stop all services
	@echo "$(YELLOW)Stopping all services...$(NC)"
	docker-compose down

.PHONY: restart
restart: stop dev-full ## Restart all services

# =============================================================================
# DATABASE COMMANDS
# =============================================================================

.PHONY: db-setup
db-setup: ## Setup database (migrate and seed)
	@echo "$(YELLOW)Setting up database...$(NC)"
	pnpm --filter @basket-fi/backend db:generate
	pnpm --filter @basket-fi/backend db:push
	pnpm --filter @basket-fi/backend db:seed

.PHONY: db-migrate
db-migrate: ## Run database migrations
	@echo "$(YELLOW)Running database migrations...$(NC)"
	pnpm --filter @basket-fi/backend db:migrate

.PHONY: db-reset
db-reset: ## Reset database (WARNING: destroys all data)
	@echo "$(RED)Resetting database (this will destroy all data)...$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		pnpm --filter @basket-fi/backend db:reset; \
	fi

.PHONY: db-studio
db-studio: ## Open Prisma Studio
	@echo "$(YELLOW)Opening Prisma Studio...$(NC)"
	pnpm --filter @basket-fi/backend db:studio

.PHONY: db-backup
db-backup: ## Create database backup
	@echo "$(YELLOW)Creating database backup...$(NC)"
	docker-compose exec postgres pg_dump -U $(POSTGRES_USER) $(POSTGRES_DB) > backup_$(shell date +%Y%m%d_%H%M%S).sql

# =============================================================================
# BUILD COMMANDS
# =============================================================================

.PHONY: build
build: ## Build all applications
	@echo "$(YELLOW)Building all applications...$(NC)"
	pnpm build

.PHONY: build-backend
build-backend: ## Build backend only
	@echo "$(YELLOW)Building backend...$(NC)"
	pnpm --filter @basket-fi/backend build

.PHONY: build-web
build-web: ## Build web frontend only
	@echo "$(YELLOW)Building web frontend...$(NC)"
	pnpm --filter @basket-fi/web build

.PHONY: build-docker
build-docker: ## Build Docker images
	@echo "$(YELLOW)Building Docker images...$(NC)"
	docker-compose build

.PHONY: build-docker-no-cache
build-docker-no-cache: ## Build Docker images without cache
	@echo "$(YELLOW)Building Docker images without cache...$(NC)"
	docker-compose build --no-cache

# =============================================================================
# TESTING COMMANDS
# =============================================================================

.PHONY: test
test: ## Run all tests
	@echo "$(YELLOW)Running all tests...$(NC)"
	pnpm test

.PHONY: test-unit
test-unit: ## Run unit tests
	@echo "$(YELLOW)Running unit tests...$(NC)"
	pnpm test:unit

.PHONY: test-integration
test-integration: ## Run integration tests
	@echo "$(YELLOW)Running integration tests...$(NC)"
	pnpm test:integration

.PHONY: test-e2e
test-e2e: ## Run end-to-end tests
	@echo "$(YELLOW)Running end-to-end tests...$(NC)"
	pnpm test:e2e

.PHONY: test-coverage
test-coverage: ## Generate test coverage report
	@echo "$(YELLOW)Generating test coverage report...$(NC)"
	pnpm test:coverage

# =============================================================================
# CODE QUALITY COMMANDS
# =============================================================================

.PHONY: lint
lint: ## Run linting
	@echo "$(YELLOW)Running linting...$(NC)"
	pnpm lint

.PHONY: lint-fix
lint-fix: ## Fix linting issues
	@echo "$(YELLOW)Fixing linting issues...$(NC)"
	pnpm lint:fix

.PHONY: format
format: ## Format code
	@echo "$(YELLOW)Formatting code...$(NC)"
	pnpm format

.PHONY: typecheck
typecheck: ## Run TypeScript type checking
	@echo "$(YELLOW)Running type checking...$(NC)"
	pnpm typecheck

.PHONY: audit
audit: ## Run security audit
	@echo "$(YELLOW)Running security audit...$(NC)"
	pnpm audit

# =============================================================================
# DEPLOYMENT COMMANDS
# =============================================================================

.PHONY: deploy-staging
deploy-staging: ## Deploy to staging environment
	@echo "$(YELLOW)Deploying to staging...$(NC)"
	./scripts/deploy-staging.sh

.PHONY: deploy-production
deploy-production: ## Deploy to production environment
	@echo "$(RED)Deploying to production...$(NC)"
	@read -p "Are you sure you want to deploy to production? [y/N] " -n 1 -r; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		./scripts/deploy-production.sh; \
	fi

# =============================================================================
# MONITORING COMMANDS
# =============================================================================

.PHONY: logs
logs: ## View application logs
	@echo "$(YELLOW)Viewing application logs...$(NC)"
	docker-compose logs -f

.PHONY: logs-backend
logs-backend: ## View backend logs
	@echo "$(YELLOW)Viewing backend logs...$(NC)"
	docker-compose logs -f backend

.PHONY: logs-web
logs-web: ## View web frontend logs
	@echo "$(YELLOW)Viewing web frontend logs...$(NC)"
	docker-compose logs -f web

.PHONY: health
health: ## Check service health
	@echo "$(YELLOW)Checking service health...$(NC)"
	@curl -f http://localhost:3001/health && echo "$(GREEN)Backend: Healthy$(NC)" || echo "$(RED)Backend: Unhealthy$(NC)"
	@curl -f http://localhost:3000/api/health && echo "$(GREEN)Frontend: Healthy$(NC)" || echo "$(RED)Frontend: Unhealthy$(NC)"

.PHONY: stats
stats: ## Show Docker container stats
	@echo "$(YELLOW)Docker container stats:$(NC)"
	docker-compose ps
	docker stats --no-stream

# =============================================================================
# CLEANUP COMMANDS
# =============================================================================

.PHONY: clean
clean: ## Clean build artifacts and dependencies
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	pnpm clean
	rm -rf node_modules
	rm -rf apps/*/node_modules
	rm -rf packages/*/node_modules

.PHONY: clean-docker
clean-docker: ## Clean Docker containers and images
	@echo "$(YELLOW)Cleaning Docker containers and images...$(NC)"
	docker-compose down -v --remove-orphans
	docker system prune -f

.PHONY: clean-all
clean-all: clean clean-docker ## Clean everything

# =============================================================================
# UTILITY COMMANDS
# =============================================================================

.PHONY: setup
setup: install db-setup ## Initial project setup
	@echo "$(GREEN)Project setup complete!$(NC)"
	@echo "Run 'make dev' to start development"

.PHONY: update
update: ## Update all dependencies
	@echo "$(YELLOW)Updating dependencies...$(NC)"
	pnpm update

.PHONY: check-env
check-env: ## Check environment configuration
	@echo "$(YELLOW)Checking environment configuration...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(RED)Error: .env file not found. Copy .env.example to .env$(NC)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Environment configuration OK$(NC)"

.PHONY: generate-keys
generate-keys: ## Generate JWT keys for production
	@echo "$(YELLOW)Generating JWT keys...$(NC)"
	@mkdir -p keys
	@openssl genrsa -out keys/jwt-private.pem 2048
	@openssl rsa -in keys/jwt-private.pem -pubout -out keys/jwt-public.pem
	@echo "$(GREEN)JWT keys generated in keys/ directory$(NC)"

# =============================================================================
# DOCKER SHORTCUTS
# =============================================================================

.PHONY: shell-backend
shell-backend: ## Open shell in backend container
	docker-compose exec backend sh

.PHONY: shell-web
shell-web: ## Open shell in web container
	docker-compose exec web sh

.PHONY: shell-postgres
shell-postgres: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

.PHONY: shell-redis
shell-redis: ## Open Redis CLI
	docker-compose exec redis redis-cli

# =============================================================================
# DEVELOPMENT HELPERS
# =============================================================================

.PHONY: new-migration
new-migration: ## Create new database migration
	@read -p "Migration name: " name; \
	pnpm --filter @basket-fi/backend prisma migrate dev --name $$name

.PHONY: seed-data
seed-data: ## Seed database with sample data
	@echo "$(YELLOW)Seeding database with sample data...$(NC)"
	pnpm --filter @basket-fi/backend db:seed

.PHONY: reset-dev
reset-dev: db-reset db-setup seed-data ## Reset development environment
	@echo "$(GREEN)Development environment reset complete!$(NC)"