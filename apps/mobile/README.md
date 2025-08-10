# Basket.fi Mobile App

A React Native mobile app built with Expo for managing DeFi portfolios on the go.

## Features

- **Portfolio Management**: View and manage your DeFi baskets
- **Push Notifications**: Real-time alerts for price changes and rebalancing
- **Quick Rebalance**: One-tap portfolio rebalancing
- **Biometric Authentication**: Secure login with Face ID/Touch ID
- **Offline Support**: Cached data with MMKV persistence
- **WalletConnect Integration**: Connect to Web3 wallets
- **Deep Linking**: Navigate directly to specific baskets

## Tech Stack

- **Framework**: Expo SDK 50+
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Query with MMKV persistence
- **Authentication**: Expo Local Authentication (biometrics)
- **Wallet Integration**: WalletConnect v2
- **Notifications**: Expo Notifications
- **Storage**: MMKV for fast key-value storage
- **Analytics**: Expo Analytics

## Getting Started

### Prerequisites

```bash
# Install Expo CLI
npm install -g @expo/cli

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run on device
npx expo start --tunnel
```

### Build

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both platforms
eas build --platform all
```

## Project Structure

```
apps/mobile/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   ├── basket/            # Basket detail screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
├── lib/                   # Utilities and configurations
├── hooks/                 # Custom React hooks
├── constants/             # App constants
└── assets/               # Images, fonts, etc.
```

## Screen Architecture

### Authentication Flow
- **Welcome Screen**: App introduction and login options
- **Biometric Setup**: Configure Face ID/Touch ID
- **Wallet Connect**: Connect Web3 wallet

### Main Application
- **Dashboard**: Portfolio overview and stats
- **Baskets**: List of user's baskets
- **Basket Detail**: Individual basket management
- **Alerts**: Notification settings and history
- **Settings**: App preferences and account

### Modal Screens
- **Quick Rebalance**: Fast rebalancing interface
- **Add Basket**: Create new basket
- **Notification Detail**: Alert details

## Deep Linking

The app supports deep links for direct navigation:

```
basketfi://basket/[id]          # Open specific basket
basketfi://rebalance/[id]       # Quick rebalance
basketfi://alerts               # Alerts screen
basketfi://settings             # Settings screen
```

## Push Notifications

- **Price Alerts**: Token price threshold notifications
- **Rebalance Alerts**: Portfolio drift notifications
- **Transaction Updates**: Blockchain transaction status
- **Market Updates**: General market news and updates

## Offline Support

- **Data Persistence**: MMKV for fast local storage
- **Query Caching**: React Query with offline persistence
- **Optimistic Updates**: Immediate UI feedback
- **Sync on Reconnect**: Automatic data synchronization

## Security

- **Biometric Authentication**: Face ID/Touch ID support
- **Secure Storage**: Encrypted local storage
- **API Security**: JWT token management
- **Wallet Security**: WalletConnect v2 integration

## Analytics

- **Screen Tracking**: Page view analytics
- **User Actions**: Button clicks and interactions
- **Performance**: App performance metrics
- **Crash Reporting**: Error tracking and reporting