# Project Structure

## Monorepo Organization

The project follows a standard monorepo structure with apps and shared packages:

```
basket-fi/
├── apps/                    # Application code
│   ├── backend/            # NestJS API server
│   └── web/                # Next.js frontend
├── packages/               # Shared packages
│   ├── config/             # Shared configurations
│   ├── types/              # TypeScript type definitions
│   ├── ui/                 # Reusable UI components
│   └── utils/              # Utility functions
└── [config files]          # Root-level configuration
```

## Applications

### Backend (`apps/backend/`)
- **Framework**: NestJS with modular architecture
- **Database**: Prisma schema and migrations in `prisma/`
- **Source**: All application code in `src/`
- **Key modules**: Prisma service for database access

### Web (`apps/web/`)
- **Framework**: Next.js 14 with App Router
- **Source**: Application code in `src/app/`
- **Styling**: Global CSS and Tailwind configuration
- **Build**: Static and server-side rendering support

## Shared Packages

### Types (`packages/types/`)
- Zod schemas and TypeScript types
- Domain models: `user.ts`, `basket.ts`, `token.ts`, `api.ts`
- Shared between frontend and backend for type safety

### UI (`packages/ui/`)
- Reusable React components built with Tailwind
- Components: Button, Card, Dialog, Input, Label, Select, Toast
- Consistent design system across applications

### Utils (`packages/utils/`)
- Shared utility functions and constants
- Common formatting, validation, and helper functions
- Class name utilities (`cn.ts`) for Tailwind

### Config (`packages/config/`)
- Shared configuration files
- ESLint configs for different app types (NestJS, Next.js)
- Prettier and TypeScript configurations
- Promotes consistency across the monorepo

## Naming Conventions

- **Packages**: Scoped with `@basket-fi/` prefix
- **Workspace references**: Use `workspace:*` for internal dependencies
- **File naming**: kebab-case for files, PascalCase for components
- **Database**: snake_case table names, camelCase field names in Prisma

## Development Workflow

- Each package has its own `package.json` with specific scripts
- Turborepo orchestrates builds and ensures proper dependency order
- Shared configurations reduce duplication and maintain consistency
- Docker setup provides consistent development environment