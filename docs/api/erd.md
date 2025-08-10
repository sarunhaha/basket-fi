# Entity Relationship Diagram

```mermaid
erDiagram
    User {
        string id PK
        string walletAddress UK
        string email UK
        string displayName
        string role
        boolean emailNotifications
        boolean pushNotifications
        string language
        string currency
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }
    
    Wallet {
        string id PK
        string address UK
        string chainId
        string userId FK
        string provider
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }
    
    Basket {
        string id PK
        string name
        string description
        string userId FK
        decimal totalValue
        boolean isPublic
        boolean isActive
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }
    
    BasketAsset {
        string id PK
        string basketId FK
        string tokenAddress
        string symbol
        string name
        int decimals
        string logoUri
        datetime createdAt
        datetime updatedAt
    }
    
    Allocation {
        string id PK
        string basketId FK
        string tokenAddress
        decimal targetPercentage
        decimal currentPercentage
        decimal amount
        datetime createdAt
        datetime updatedAt
    }
    
    Rebalance {
        string id PK
        string basketId FK
        string userId FK
        string status
        decimal totalValue
        json trades
        decimal estimatedGas
        string transactionHash
        datetime executedAt
        datetime createdAt
        datetime updatedAt
    }
    
    Transaction {
        string id PK
        string userId FK
        string basketId FK
        string type
        string status
        decimal amount
        string tokenAddress
        string transactionHash
        decimal gasUsed
        decimal gasPrice
        datetime createdAt
        datetime updatedAt
    }
    
    PriceSnapshot {
        string id PK
        string tokenAddress
        decimal price
        decimal volume24h
        decimal marketCap
        decimal priceChange24h
        datetime timestamp
        datetime createdAt
    }
    
    Alert {
        string id PK
        string userId FK
        string basketId FK
        string tokenAddress FK
        string type
        string condition
        decimal value
        boolean isActive
        boolean isTriggered
        datetime lastTriggered
        datetime createdAt
        datetime updatedAt
        datetime deletedAt
    }

    User ||--o{ Wallet : "owns"
    User ||--o{ Basket : "creates"
    User ||--o{ Rebalance : "initiates"
    User ||--o{ Transaction : "executes"
    User ||--o{ Alert : "sets"
    
    Basket ||--o{ BasketAsset : "contains"
    Basket ||--o{ Allocation : "defines"
    Basket ||--o{ Rebalance : "triggers"
    Basket ||--o{ Transaction : "involves"
    Basket ||--o{ Alert : "monitors"
    
    BasketAsset ||--o{ Allocation : "allocated"
    BasketAsset ||--o{ PriceSnapshot : "priced"
    BasketAsset ||--o{ Alert : "watched"
```

## Relationship Explanations

### Core Entities
- **User**: Central entity representing platform users with Web3 wallet authentication
- **Wallet**: Multiple wallet addresses per user for different chains/providers
- **Basket**: User-created token portfolios with configurable allocations

### Asset Management
- **BasketAsset**: Tokens included in baskets with metadata
- **Allocation**: Target vs current percentage allocations for each token
- **PriceSnapshot**: Historical price data for portfolio valuation

### Operations
- **Rebalance**: Automated or manual portfolio rebalancing operations
- **Transaction**: On-chain transactions for basket operations
- **Alert**: User-configured notifications for price/allocation changes

### Key Relationships
1. **User → Basket**: One-to-many (users can create multiple baskets)
2. **Basket → Allocation**: One-to-many (each basket has multiple token allocations)
3. **Basket → Rebalance**: One-to-many (baskets can be rebalanced multiple times)
4. **User → Alert**: One-to-many (users can set multiple alerts)
5. **PriceSnapshot**: Independent price data linked to tokens by address