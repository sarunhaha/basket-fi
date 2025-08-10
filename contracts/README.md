# Basket.fi Smart Contracts

A minimal DeFi portfolio management protocol built for Monad EVM.

## Overview

The Basket.fi protocol consists of three core contracts:

1. **BasketFactory**: Factory contract for creating and managing basket tokens
2. **BasketToken**: ERC-20 index tokens representing diversified portfolios
3. **Rebalancer**: Automated rebalancing logic for maintaining target allocations

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  BasketFactory  │───▶│   BasketToken   │◀───│   Rebalancer    │
│                 │    │    (ERC-20)     │    │                 │
│ - Create baskets│    │ - Index token   │    │ - Auto rebalance│
│ - Manage fees   │    │ - Mint/Burn     │    │ - Price oracles │
│ - Access control│    │ - Allocations   │    │ - Slippage ctrl │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Key Features

- **Non-upgradeable**: Simple, immutable contracts for security
- **Gas Optimized**: Minimal storage and computation for Monad EVM
- **Composable**: Standard ERC-20 interface for DeFi integration
- **Automated**: Optional rebalancing with configurable parameters

## Security Model

- **Access Control**: Ownable pattern for administrative functions
- **Reentrancy Protection**: ReentrancyGuard on all external calls
- **Input Validation**: Comprehensive parameter validation
- **Emergency Controls**: Pause functionality for critical operations

## Deployment

### Prerequisites

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Install dependencies
forge install
```

### Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

### Deploy to Testnet

```bash
# Deploy all contracts
forge script script/Deploy.s.sol --rpc-url $MONAD_TESTNET_RPC --broadcast --verify

# Deploy specific contract
forge script script/DeployBasketFactory.s.sol --rpc-url $MONAD_TESTNET_RPC --broadcast
```

## Testing

```bash
# Run all tests
forge test

# Run with coverage
forge coverage

# Run specific test
forge test --match-test testCreateBasket

# Fuzz testing
forge test --fuzz-runs 1000
```

## Contract Addresses

### Monad Testnet
- BasketFactory: `TBD`
- Rebalancer: `TBD`

### Monad Mainnet
- BasketFactory: `TBD`
- Rebalancer: `TBD`

## Integration

See `abi/` directory for contract ABIs and integration examples.

## Security

- Audited by: TBD
- Bug Bounty: TBD
- Slither Analysis: See `slither-report.json`

## License

MIT