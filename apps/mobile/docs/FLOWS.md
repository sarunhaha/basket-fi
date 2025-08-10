# User Flows - Basket.fi Mobile App

## Primary User Flows

### 1. Onboarding & Authentication Flow

#### First-Time User
```mermaid
graph TD
    A[App Launch] --> B[Welcome Screen]
    B --> C[Get Started]
    C --> D[Biometric Setup]
    D --> E{Biometric Available?}
    E -->|Yes| F[Enable Face ID/Touch ID]
    E -->|No| G[Skip Biometric]
    F --> H[Wallet Connect]
    G --> H
    H --> I[Connect Wallet]
    I --> J{Wallet Connected?}
    J -->|Yes| K[Sign Message]
    J -->|No| L[Show Error]
    K --> M[Dashboard]
    L --> H
```

#### Returning User with Biometrics
```mermaid
graph TD
    A[App Launch] --> B{Biometric Enabled?}
    B -->|Yes| C[Biometric Prompt]
    B -->|No| D[Wallet Connect]
    C --> E{Authenticated?}
    E -->|Yes| F[Dashboard]
    E -->|No| G[Fallback to Wallet]
    G --> D
    D --> H[Connect & Sign]
    H --> F
```

### 2. Portfolio Management Flow

#### View Baskets
```mermaid
graph TD
    A[Dashboard] --> B[View Recent Baskets]
    A --> C[Baskets Tab]
    B --> D[Basket Detail]
    C --> E[Search/Filter]
    C --> D
    E --> D
    D --> F[View Allocations]
    D --> G[Quick Rebalance]
    D --> H[Edit Basket]
    G --> I[Rebalance Screen]
    H --> J[Edit Form]
```

#### Create New Basket
```mermaid
graph TD
    A[Baskets Screen] --> B[+ Create Button]
    A --> C[Dashboard FAB]
    B --> D[Add Basket Form]
    C --> D
    D --> E[Enter Name/Description]
    E --> F[Select Tokens]
    F --> G[Set Allocations]
    G --> H{Allocations = 100%?}
    H -->|No| I[Show Error]
    H -->|Yes| J[Preview Basket]
    I --> G
    J --> K[Create Basket]
    K --> L[Basket Detail]
```

### 3. Quick Rebalance Flow

#### Dry Run Rebalance
```mermaid
graph TD
    A[Basket Detail] --> B[Quick Rebalance]
    A --> C[Dashboard Quick Action]
    B --> D[Rebalance Screen]
    C --> D
    D --> E[Select Dry Run]
    E --> F[Preview Rebalance]
    F --> G[Show Trades]
    G --> H[Show Gas Estimate]
    H --> I{Satisfied?}
    I -->|Yes| J[Switch to Execute]
    I -->|No| K[Go Back]
    J --> L[Execute Rebalance]
```

#### Execute Rebalance
```mermaid
graph TD
    A[Rebalance Screen] --> B[Select Execute]
    B --> C[Confirm Dialog]
    C --> D{Confirmed?}
    D -->|No| E[Cancel]
    D -->|Yes| F[Submit Transaction]
    F --> G[Show Loading]
    G --> H{Transaction Success?}
    H -->|Yes| I[Success Message]
    H -->|No| J[Error Message]
    I --> K[Update Basket Data]
    J --> L[Retry Option]
```

### 4. Alert Management Flow

#### Create Price Alert
```mermaid
graph TD
    A[Alerts Screen] --> B[+ Create Alert]
    B --> C[Select Alert Type]
    C --> D[Price Alert]
    D --> E[Select Token/Basket]
    E --> F[Set Condition]
    F --> G[Set Threshold Value]
    G --> H[Enable Notifications]
    H --> I[Create Alert]
    I --> J[Alert List]
```

#### Handle Alert Notification
```mermaid
graph TD
    A[Push Notification] --> B{App State?}
    B -->|Foreground| C[In-App Toast]
    B -->|Background| D[System Notification]
    C --> E[Tap to View]
    D --> F[Tap Notification]
    E --> G[Alert Detail]
    F --> G
    G --> H[View Related Basket]
    G --> I[Dismiss Alert]
    G --> J[Modify Alert]
```

### 5. Error Handling Flows

#### Network Error Recovery
```mermaid
graph TD
    A[API Request] --> B{Network Available?}
    B -->|No| C[Show Offline State]
    B -->|Yes| D[Make Request]
    C --> E[Cache Data Available?]
    E -->|Yes| F[Show Cached Data]
    E -->|No| G[Show Empty State]
    F --> H[Network Restored]
    G --> H
    H --> I[Retry Request]
    D --> J{Request Success?}
    J -->|No| K[Show Error Toast]
    J -->|Yes| L[Update UI]
    K --> M[Retry Button]
    M --> D
```

#### Authentication Error Recovery
```mermaid
graph TD
    A[API Request] --> B{Token Valid?}
    B -->|No| C[Refresh Token]
    C --> D{Refresh Success?}
    D -->|Yes| E[Retry Request]
    D -->|No| F[Clear Tokens]
    F --> G[Redirect to Auth]
    G --> H[Wallet Connect]
    H --> I[Re-authenticate]
    B -->|Yes| J[Continue Request]
```

## Secondary Flows

### Deep Link Handling
```mermaid
graph TD
    A[Deep Link Received] --> B{User Authenticated?}
    B -->|No| C[Store Link]
    B -->|Yes| D[Navigate to Screen]
    C --> E[Show Auth]
    E --> F[Complete Auth]
    F --> G[Navigate to Stored Link]
    D --> H[Show Content]
```

### Background Sync
```mermaid
graph TD
    A[App Backgrounded] --> B[Schedule Sync]
    B --> C[App Foregrounded]
    C --> D[Check Data Freshness]
    D --> E{Data Stale?}
    E -->|Yes| F[Sync Data]
    E -->|No| G[Use Cache]
    F --> H[Update UI]
    G --> H
```

### Biometric Setup
```mermaid
graph TD
    A[Settings] --> B[Security Settings]
    B --> C[Enable Biometrics]
    C --> D{Hardware Available?}
    D -->|No| E[Show Not Available]
    D -->|Yes| F{Enrolled?}
    F -->|No| G[Prompt to Enroll]
    F -->|Yes| H[Test Biometric]
    H --> I{Success?}
    I -->|Yes| J[Enable Feature]
    I -->|No| K[Show Error]
```

## Edge Cases & Error States

### Wallet Connection Issues
- Wallet app not installed
- User rejects connection
- Network timeout during connection
- Wallet disconnected during session

### Data Synchronization Issues
- Partial data load
- Conflicting local/remote state
- Cache corruption
- Background sync failures

### Performance Edge Cases
- Large basket lists (100+ baskets)
- Complex allocation calculations
- Heavy image loading
- Memory pressure scenarios

## Analytics Tracking Points

### User Journey Tracking
- Screen views and time spent
- Button taps and interactions
- Flow completion rates
- Drop-off points

### Performance Tracking
- Screen load times
- API response times
- Error rates by flow
- Crash reports by screen

### Business Metrics
- Basket creation rate
- Rebalance frequency
- Alert engagement
- Feature adoption rates