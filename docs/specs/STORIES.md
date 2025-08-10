# Basket.fi User Stories

## Epic 1: Wallet Connection & Authentication

### Story 1.1: Connect Wallet
```gherkin
Feature: Wallet Connection
  As a DeFi user
  I want to connect my Web3 wallet
  So that I can access my funds and create baskets

  Background:
    Given I am on the Basket.fi homepage
    And I have MetaMask installed

  Scenario: Successful wallet connection
    Given I click the "Connect Wallet" button
    When MetaMask prompts for connection
    And I approve the connection
    Then I should see my wallet address displayed
    And I should be redirected to the dashboard

  Scenario: Wallet connection rejection
    Given I click the "Connect Wallet" button
    When MetaMask prompts for connection
    And I reject the connection
    Then I should see an error message "Wallet connection rejected"
    And I should remain on the homepage

  Scenario: Unsupported wallet
    Given I don't have MetaMask installed
    When I click "Connect Wallet"
    Then I should see "Please install MetaMask" message
    And I should see a link to download MetaMask
```

**Acceptance Criteria:**
- Supports MetaMask, WalletConnect, and Coinbase Wallet
- Displays clear error messages for connection failures
- Persists connection state across browser sessions
- Shows wallet balance and network information

---

## Epic 2: Basket Management

### Story 2.1: Create New Basket
```gherkin
Feature: Basket Creation
  As a DeFi investor
  I want to create a custom token basket
  So that I can diversify my portfolio automatically

  Background:
    Given I am logged in with my wallet
    And I am on the dashboard

  Scenario: Create basic basket
    Given I click "Create New Basket"
    When I enter basket name "DeFi Blue Chips"
    And I add ETH with 40% allocation
    And I add USDC with 30% allocation
    And I add UNI with 30% allocation
    And I click "Create Basket"
    Then I should see "Basket created successfully"
    And I should see the new basket in my portfolio

  Scenario: Invalid allocation percentages
    Given I am creating a new basket
    When I set allocations that don't sum to 100%
    And I click "Create Basket"
    Then I should see error "Allocations must sum to 100%"
    And the basket should not be created

  Scenario: Duplicate token selection
    Given I am creating a new basket
    When I try to add the same token twice
    Then I should see error "Token already added"
    And the duplicate token should not be added
```

**Acceptance Criteria:**
- Supports 2-20 tokens per basket
- Validates allocation percentages sum to 100%
- Prevents duplicate token selection
- Estimates gas costs before creation
- Allows public/private basket settings

### Story 2.2: Edit Existing Basket
```gherkin
Feature: Basket Editing
  As a basket owner
  I want to modify my basket allocations
  So that I can adjust my strategy over time

  Background:
    Given I have an existing basket "DeFi Blue Chips"
    And I am on the basket detail page

  Scenario: Update allocations
    Given I click "Edit Basket"
    When I change ETH allocation from 40% to 50%
    And I change USDC allocation from 30% to 20%
    And I click "Save Changes"
    Then I should see "Basket updated successfully"
    And the new allocations should be displayed

  Scenario: Add new token to basket
    Given I am editing my basket
    When I click "Add Token"
    And I select AAVE token
    And I set allocation to 10%
    And I adjust other tokens to maintain 100%
    And I click "Save Changes"
    Then AAVE should be added to the basket
    And all allocations should sum to 100%
```

**Acceptance Criteria:**
- Maintains 100% allocation constraint
- Shows preview of changes before confirmation
- Calculates rebalancing costs
- Preserves basket history and performance data

---

## Epic 3: Simulation & Backtesting

### Story 3.1: Strategy Simulation
```gherkin
Feature: Portfolio Simulation
  As an investor
  I want to simulate basket performance
  So that I can validate my strategy before investing

  Background:
    Given I have created a basket configuration
    And I am on the simulation page

  Scenario: Historical backtest
    Given I select a date range of "Last 6 months"
    When I click "Run Backtest"
    Then I should see historical performance chart
    And I should see key metrics (returns, volatility, Sharpe ratio)
    And I should see comparison to ETH benchmark

  Scenario: Monte Carlo simulation
    Given I select "Monte Carlo" simulation type
    When I set 1000 iterations
    And I click "Run Simulation"
    Then I should see probability distribution of returns
    And I should see confidence intervals
    And I should see worst-case scenario analysis
```

**Acceptance Criteria:**
- Supports 1 day to 2 years historical data
- Includes transaction costs and slippage
- Compares against ETH/BTC benchmarks
- Exports results to CSV/PDF

---

## Epic 4: Rebalancing

### Story 4.1: Rebalancing Suggestions
```gherkin
Feature: Rebalancing Recommendations
  As a basket owner
  I want to receive rebalancing suggestions
  So that I can maintain my target allocations

  Background:
    Given I have a basket with target allocations
    And current allocations have drifted >5% from targets

  Scenario: View rebalancing suggestions
    Given I am on my basket dashboard
    When allocations drift beyond threshold
    Then I should see a "Rebalance Needed" notification
    And I should see suggested trades to rebalance
    And I should see estimated gas costs

  Scenario: Custom rebalancing threshold
    Given I am in basket settings
    When I set rebalancing threshold to 3%
    And allocations drift 3.5% from target
    Then I should receive rebalancing suggestion
    And the suggestion should appear in notifications
```

**Acceptance Criteria:**
- Configurable drift thresholds (1-20%)
- Shows exact trades needed for rebalancing
- Estimates gas costs and slippage
- Supports partial rebalancing options

### Story 4.2: One-Click Rebalancing
```gherkin
Feature: Automated Rebalancing
  As a basket owner
  I want to rebalance with one click
  So that I can maintain allocations efficiently

  Background:
    Given I have rebalancing suggestions
    And I am on the basket detail page

  Scenario: Execute rebalancing
    Given I see rebalancing suggestions
    When I click "Rebalance Now"
    And I confirm the transaction in my wallet
    Then trades should execute via DEX aggregator
    And I should see "Rebalancing in progress"
    And I should receive confirmation when complete

  Scenario: Insufficient gas
    Given I want to rebalance my basket
    When I have insufficient ETH for gas
    And I click "Rebalance Now"
    Then I should see "Insufficient gas" error
    And the rebalancing should not execute
```

**Acceptance Criteria:**
- Uses DEX aggregator for best prices
- Batches trades to minimize gas costs
- Shows real-time transaction status
- Handles failed transactions gracefully

---

## Epic 5: Performance Tracking

### Story 5.1: PnL Dashboard
```gherkin
Feature: Profit and Loss Tracking
  As an investor
  I want to track my basket performance
  So that I can measure investment success

  Background:
    Given I have active baskets with trading history
    And I am on the portfolio dashboard

  Scenario: View overall PnL
    Given I have multiple baskets
    When I view my portfolio dashboard
    Then I should see total portfolio value
    And I should see overall PnL ($ and %)
    And I should see performance vs ETH benchmark

  Scenario: Individual basket performance
    Given I click on a specific basket
    When I view the basket detail page
    Then I should see basket-specific PnL
    And I should see performance chart over time
    And I should see contribution by token
```

**Acceptance Criteria:**
- Real-time portfolio valuation
- Historical performance charts
- Benchmark comparisons (ETH, BTC, S&P 500)
- Tax-loss harvesting suggestions

---

## Epic 6: Alerts & Notifications

### Story 6.1: Price Alerts
```gherkin
Feature: Price and Portfolio Alerts
  As an investor
  I want to receive alerts for important events
  So that I can take timely action

  Background:
    Given I have configured alert preferences
    And I have active baskets

  Scenario: Portfolio value alert
    Given I set an alert for portfolio value below $10,000
    When my portfolio value drops to $9,500
    Then I should receive a push notification
    And I should receive an email alert
    And the alert should appear in my notifications

  Scenario: Rebalancing alert
    Given I set automatic rebalancing alerts
    When my basket drifts 5% from target allocation
    Then I should receive a rebalancing suggestion
    And I should see the alert in my dashboard
```

**Acceptance Criteria:**
- Supports price, percentage, and portfolio value alerts
- Multiple notification channels (push, email, SMS)
- Configurable alert frequencies
- Alert history and management

---

## Epic 7: Data Export

### Story 7.1: Portfolio Export
```gherkin
Feature: Data Export for Tax Reporting
  As an investor
  I want to export my trading data
  So that I can file accurate tax returns

  Background:
    Given I have trading history across multiple baskets
    And I am on the portfolio page

  Scenario: Export transaction history
    Given I click "Export Data"
    When I select date range "2024 Tax Year"
    And I select format "CSV"
    And I click "Download"
    Then I should receive a CSV file
    And it should contain all transactions with timestamps
    And it should include cost basis and PnL data

  Scenario: Export for specific basket
    Given I am viewing a specific basket
    When I click "Export Basket Data"
    And I select "PDF Report" format
    Then I should get a comprehensive basket report
    And it should include performance metrics
    And it should include all rebalancing history
```

**Acceptance Criteria:**
- Supports CSV, PDF, and JSON formats
- Includes all transaction data with timestamps
- Calculates cost basis using FIFO/LIFO methods
- Compatible with popular tax software (TurboTax, etc.)
- Includes gas fees and transaction costs