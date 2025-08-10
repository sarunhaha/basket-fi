# Basket-Fi Web App

Next.js 14 frontend application for creating and managing token baskets.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod validation
- **Blockchain**: Wagmi + Viem
- **Wallet**: RainbowKit
- **Charts**: Recharts
- **Internationalization**: next-intl

## 🚀 Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint

# Run type checking
pnpm typecheck
```

## 📁 Project Structure

```
src/
├── app/                 # App Router pages
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
├── hooks/             # Custom React hooks
├── lib/               # Utility libraries
├── providers/         # Context providers
└── types/             # TypeScript types
```

## 🌐 Environment Variables

Create a `.env.local` file:

```bash
# API
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"

# Blockchain
NEXT_PUBLIC_MONAD_RPC_URL="https://testnet-rpc.monad.xyz"
NEXT_PUBLIC_ETHEREUM_RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_KEY"

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID="your_walletconnect_project_id"

# Application
NEXT_PUBLIC_APP_NAME="Basket-Fi"
NEXT_PUBLIC_APP_DESCRIPTION="Create, track, and rebalance token baskets on Monad"
```

## 🎨 UI Components

This app uses a custom component library built on:

- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Beautiful component system
- **Lucide React**: Icon library

## 🔗 Key Features

- **Wallet Connection**: Connect MetaMask and other wallets
- **Basket Management**: Create, edit, and delete token baskets
- **Portfolio Tracking**: Real-time PnL and performance metrics
- **Backtesting**: Historical performance simulation
- **Rebalancing**: Smart rebalancing suggestions
- **Alerts**: Price and percentage-based notifications
- **Internationalization**: English and Thai language support

## 📱 Responsive Design

The application is fully responsive and optimized for:

- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🧪 Testing

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Docker

```bash
# Build Docker image
docker build -f Dockerfile -t basket-fi-web .

# Run container
docker run -p 3000:3000 basket-fi-web
```

### Static Export

```bash
# Build static export
pnpm build && pnpm export

# Serve static files
npx serve out
```