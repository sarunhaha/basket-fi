# Basket.fi Sequence Diagrams

## Flow 1: Wallet Connection and Authentication

```mermaid
sequenceDiagram
    participant U as User
    participant W as Web App
    participant M as MetaMask
    participant B as Backend API
    participant DB as Database

    U->>W: Click "Connect Wallet"
    W->>M: Request wallet connection
    M->>U: Show connection prompt
    U->>M: Approve connection
    M->>W: Return wallet address
    
    W->>W: Generate auth message
    W->>M: Request message signature
    M->>U: Show signature prompt
    U->>M: Sign message
    M->>W: Return signature
    
    W->>B: POST /auth/login {address, signature, message}
    B->>B: Verify signature
    B->>DB: Check/create user record
    DB->>B: Return user data
    B->>B: Generate JWT tokens
    B->>W: Return {accessToken, refreshToken, user}
    
    W->>W: Store tokens securely
    W->>U: Redirect to dashboard
    
    Note over U,DB: User is now authenticated and can access protected features
```

---

## Flow 2: Create Basket and Initial Deposit

```mermaid
sequenceDiagram
    participant U as User
    participant W as Web App
    participant B as Backend API
    participant BC as Blockchain
    participant DEX as DEX Aggregator
    participant DB as Database

    U->>W: Click "Create New Basket"
    W->>U: Show basket creation form
    
    U->>W: Enter basket details (name, tokens, allocations)
    W->>W: Validate allocations sum to 100%
    W->>B: POST /baskets {name, tokens, allocations}
    B->>DB: Create basket record
    DB->>B: Return basket ID
    B->>W: Return basket details
    
    U->>W: Click "Fund Basket" with ETH amount
    W->>DEX: Get quotes for token swaps
    DEX->>W: Return swap quotes and routes
    W->>U: Show funding preview (tokens, amounts, gas)
    
    U->>W: Confirm funding
    W->>BC: Deploy basket contract (if needed)
    BC->>W: Return contract address
    
    loop For each token allocation
        W->>BC: Execute swap via DEX aggregator
        BC->>DEX: Swap ETH for target token
        DEX->>BC: Return tokens
        BC->>W: Confirm swap completion
    end
    
    W->>B: POST /baskets/{id}/transactions
    B->>DB: Record all transactions
    B->>DB: Update basket balances
    DB->>B: Confirm updates
    B->>W: Return updated basket state
    
    W->>U: Show "Basket created successfully"
    W->>U: Display basket dashboard with current allocations
    
    Note over U,DB: Basket is now active with initial token allocations
```

---

## Flow 3: Automated Rebalancing with DEX Integration

```mermaid
sequenceDiagram
    participant S as Scheduler
    participant B as Backend API
    participant DB as Database
    participant P as Price Oracle
    participant DEX as DEX Aggregator
    participant BC as Blockchain
    participant U as User
    participant N as Notification Service

    S->>B: Trigger rebalancing check (cron job)
    B->>DB: Get all active baskets
    DB->>B: Return basket list
    
    loop For each basket
        B->>P: Get current token prices
        P->>B: Return price data
        B->>B: Calculate current allocations
        B->>B: Compare with target allocations
        
        alt Drift > threshold
            B->>DB: Log rebalancing need
            B->>DEX: Get optimal swap routes
            DEX->>B: Return swap quotes
            B->>B: Calculate rebalancing trades
            
            B->>N: Send rebalancing alert to user
            N->>U: Push notification "Rebalancing suggested"
            
            alt Auto-rebalancing enabled
                B->>BC: Execute rebalancing trades
                
                loop For each required trade
                    BC->>DEX: Execute token swap
                    DEX->>BC: Complete swap
                    BC->>B: Confirm transaction
                end
                
                B->>DB: Update basket allocations
                B->>DB: Record rebalancing transactions
                DB->>B: Confirm updates
                
                B->>N: Send completion notification
                N->>U: Push notification "Rebalancing completed"
                
            else Manual approval required
                B->>N: Send approval request
                N->>U: Push notification "Approve rebalancing?"
                
                U->>N: Tap notification
                N->>B: User opened rebalancing screen
                B->>U: Show rebalancing preview
                
                alt User approves
                    U->>B: POST /baskets/{id}/rebalance
                    B->>BC: Execute approved trades
                    BC->>B: Return transaction results
                    B->>DB: Update basket state
                    B->>U: Show "Rebalancing completed"
                else User rejects
                    U->>B: Dismiss rebalancing suggestion
                    B->>DB: Log user rejection
                end
            end
        else No rebalancing needed
            B->>DB: Log "No action needed"
        end
    end
    
    Note over S,N: Rebalancing cycle complete, next check scheduled
```

---

## Additional Flow Diagrams

### Flow 4: Portfolio Performance Calculation

```mermaid
sequenceDiagram
    participant U as User
    participant W as Web App
    participant B as Backend API
    participant P as Price Oracle
    participant DB as Database
    participant C as Cache

    U->>W: View portfolio dashboard
    W->>B: GET /portfolio/performance
    
    B->>C: Check cached performance data
    alt Cache hit (< 5 minutes old)
        C->>B: Return cached data
        B->>W: Return performance metrics
    else Cache miss or stale
        B->>DB: Get user's baskets and transactions
        DB->>B: Return portfolio data
        
        B->>P: Get current token prices
        P->>B: Return price data
        
        B->>B: Calculate current portfolio value
        B->>B: Calculate historical performance
        B->>B: Calculate PnL and metrics
        
        B->>C: Cache performance data (5 min TTL)
        B->>W: Return performance metrics
    end
    
    W->>U: Display portfolio performance
    W->>U: Show charts and metrics
```

### Flow 5: Alert System

```mermaid
sequenceDiagram
    participant S as Scheduler
    participant B as Backend API
    participant DB as Database
    participant P as Price Oracle
    participant N as Notification Service
    participant U as User

    S->>B: Check alerts (every minute)
    B->>DB: Get active alerts
    DB->>B: Return alert configurations
    
    loop For each alert
        B->>P: Get current prices/values
        P->>B: Return current data
        B->>B: Evaluate alert condition
        
        alt Alert triggered
            B->>DB: Check alert cooldown
            alt Not in cooldown
                B->>DB: Log alert trigger
                B->>N: Send notification
                N->>U: Push/email notification
                B->>DB: Update last triggered time
            end
        end
    end
```

## Technical Notes

### Authentication Flow
- Uses EIP-712 structured message signing for security
- JWT tokens have 1-hour expiration with refresh capability
- Wallet disconnection clears all local authentication state

### Basket Creation Flow
- Smart contract deployment is optional (can use factory pattern)
- All swaps go through DEX aggregator for best prices
- Transaction batching reduces gas costs significantly

### Rebalancing Flow
- Configurable drift thresholds per basket (default 5%)
- Supports both automatic and manual rebalancing modes
- Uses MEV protection through private mempools when available

### Performance Considerations
- Price data cached for 1-5 minutes depending on volatility
- Portfolio calculations cached to reduce API calls
- WebSocket connections for real-time updates on active pages