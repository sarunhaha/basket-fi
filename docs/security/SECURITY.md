# Basket.fi Security Documentation

## STRIDE Threat Model Analysis

### System Components
- **Web Frontend** (Next.js 14, React)
- **Backend API** (NestJS, Node.js)
- **Database** (PostgreSQL)
- **Smart Contracts** (Solidity, Ethereum)
- **Mobile App** (React Native, Expo)

---

## Web Frontend Threats (STRIDE)

### Spoofing (S)
**Threats:**
- Phishing attacks mimicking the official domain
- DNS hijacking redirecting users to malicious sites
- Man-in-the-middle attacks on HTTP connections

**Mitigations:**
- HTTPS enforcement with HSTS headers
- Content Security Policy (CSP) implementation
- Subresource Integrity (SRI) for external resources
- Domain validation and certificate pinning
- Anti-phishing education and warnings

### Tampering (T)
**Threats:**
- Malicious browser extensions modifying transactions
- XSS attacks injecting malicious scripts
- Client-side code manipulation

**Mitigations:**
- Content Security Policy with strict directives
- Input sanitization and output encoding
- Transaction verification prompts in wallet
- Immutable deployments via IPFS
- Regular security audits of frontend code

### Repudiation (R)
**Threats:**
- Users denying they initiated transactions
- Lack of audit trail for user actions

**Mitigations:**
- Comprehensive client-side logging (no PII)
- Wallet signature requirements for all transactions
- Transaction history with cryptographic proofs
- User action tracking with timestamps

### Information Disclosure (I)
**Threats:**
- Sensitive data exposure in browser storage
- API keys or secrets in client-side code
- User data leakage through analytics

**Mitigations:**
- No sensitive data in localStorage/sessionStorage
- Environment variables for configuration only
- Data minimization in client-side state
- Privacy-focused analytics implementation

### Denial of Service (D)
**Threats:**
- Client-side resource exhaustion
- Malicious large file uploads
- Browser memory leaks

**Mitigations:**
- Rate limiting on API calls
- File size restrictions
- Memory leak monitoring
- Progressive loading for large datasets

### Elevation of Privilege (E)
**Threats:**
- Unauthorized access to admin functions
- Client-side authorization bypass

**Mitigations:**
- Server-side authorization enforcement
- Role-based access control (RBAC)
- JWT token validation
- Admin interface separation

---

## Backend API Threats (STRIDE)

### Spoofing (S)
**Threats:**
- API impersonation attacks
- Fake authentication tokens
- Service identity spoofing

**Mitigations:**
- JWT token validation with RS256 signing
- API key authentication for service-to-service
- Mutual TLS for internal communications
- Rate limiting per IP/user

### Tampering (T)
**Threats:**
- Request/response manipulation
- Database injection attacks
- Parameter tampering

**Mitigations:**
- Input validation with Zod schemas
- Parameterized queries (Prisma ORM)
- Request signing for critical operations
- Database connection encryption

### Repudiation (R)
**Threats:**
- Users denying API actions
- Lack of audit trails

**Mitigations:**
- Comprehensive audit logging
- Request/response logging (sanitized)
- Database change tracking
- User action attribution

### Information Disclosure (I)
**Threats:**
- Sensitive data in logs
- Database credential exposure
- API response information leakage

**Mitigations:**
- PII scrubbing in logs
- Secrets management (Doppler/Vault)
- Error message sanitization
- Database access controls

### Denial of Service (D)
**Threats:**
- API rate limiting bypass
- Resource exhaustion attacks
- Database connection flooding

**Mitigations:**
- Multi-tier rate limiting
- Request size limits
- Connection pooling
- Circuit breaker patterns

### Elevation of Privilege (E)
**Threats:**
- Horizontal/vertical privilege escalation
- Admin function access
- Database privilege escalation

**Mitigations:**
- Principle of least privilege
- Role-based access control
- Database user separation
- Regular permission audits

---

## Smart Contract Threats (STRIDE)

### Spoofing (S)
**Threats:**
- Contract address spoofing
- Fake token contracts
- Impersonation of legitimate protocols

**Mitigations:**
- Contract address verification
- Token whitelist validation
- Multi-signature requirements
- Address book for trusted contracts

### Tampering (T)
**Threats:**
- Reentrancy attacks
- Integer overflow/underflow
- Logic manipulation

**Mitigations:**
- ReentrancyGuard implementation
- SafeMath usage (Solidity 0.8+)
- Formal verification
- Comprehensive testing

### Repudiation (R)
**Threats:**
- Transaction denial
- State change disputes

**Mitigations:**
- Blockchain immutability
- Event logging for all actions
- Transaction hash tracking
- State verification mechanisms

### Information Disclosure (I)
**Threats:**
- Private data exposure
- Business logic revelation
- User balance disclosure

**Mitigations:**
- Minimal on-chain data storage
- Access control for sensitive functions
- Private variable protection
- Commit-reveal schemes where needed

### Denial of Service (D)
**Threats:**
- Gas limit attacks
- Block gas limit exhaustion
- Infinite loops

**Mitigations:**
- Gas optimization
- Loop bounds checking
- Circuit breaker patterns
- Emergency pause functionality

### Elevation of Privilege (E)
**Threats:**
- Admin function exploitation
- Access control bypass
- Ownership takeover

**Mitigations:**
- Multi-signature admin functions
- Time-locked upgrades
- Role-based permissions
- Ownership transfer protection

---

## Authentication & Authorization Policy

### Web3 Authentication
```typescript
// Authentication Flow
1. User connects wallet (MetaMask, WalletConnect)
2. Backend generates challenge message
3. User signs message with private key
4. Backend verifies signature and issues JWT
5. JWT used for subsequent API calls
```

### JWT Token Policy
- **Algorithm:** RS256 (asymmetric signing)
- **Expiration:** 1 hour for access tokens
- **Refresh:** 7 days for refresh tokens
- **Claims:** user_id, wallet_address, role, issued_at
- **Rotation:** Automatic on refresh

### Role-Based Access Control
```yaml
Roles:
  user:
    - Read own baskets
    - Create/edit own baskets
    - Execute own transactions
  
  admin:
    - All user permissions
    - View system metrics
    - Manage platform settings
    - Emergency controls
```

### Session Management
- **Storage:** HTTP-only cookies for web, secure storage for mobile
- **Timeout:** 24 hours of inactivity
- **Concurrent Sessions:** Maximum 3 per user
- **Invalidation:** Immediate on logout or security events

---

## Input/Output Validation

### Input Validation
```typescript
// Zod Schema Example
const CreateBasketSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9\s-_]+$/),
  description: z.string().max(500).optional(),
  allocations: z.array(z.object({
    tokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    percentage: z.number().min(0.01).max(100)
  })).min(1).max(20)
});
```

### Validation Rules
- **String Length:** Enforce min/max lengths
- **Numeric Ranges:** Validate percentage bounds (0-100)
- **Format Validation:** Regex for addresses, emails
- **Business Logic:** Sum of percentages = 100%
- **Sanitization:** HTML encoding, SQL injection prevention

### Output Sanitization
- **API Responses:** Remove sensitive fields
- **Error Messages:** Generic messages for security errors
- **Logging:** PII scrubbing before log output
- **Client Data:** Minimal data exposure

---

## Logging Policy

### Log Levels
- **ERROR:** System errors, security events
- **WARN:** Business rule violations, rate limits
- **INFO:** User actions, system events
- **DEBUG:** Development debugging (disabled in production)

### Log Format
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "INFO",
  "service": "basket-api",
  "action": "basket_created",
  "user_id": "user_123",
  "request_id": "req_456",
  "ip_address": "192.168.1.1",
  "user_agent": "Mozilla/5.0...",
  "duration_ms": 150
}
```

### PII Protection
- **Wallet Addresses:** Hash or truncate (0x123...abc)
- **Email Addresses:** Hash with salt
- **Personal Data:** Never log directly
- **Request Bodies:** Sanitize before logging

### Log Retention
- **Application Logs:** 90 days
- **Security Logs:** 1 year
- **Audit Logs:** 7 years
- **Debug Logs:** 7 days

---

## Rate Limiting

### API Rate Limits
```yaml
Global:
  - 1000 requests per hour per IP
  - 10000 requests per hour per authenticated user

Endpoints:
  /auth/login:
    - 5 attempts per 15 minutes per IP
    - 10 attempts per hour per wallet
  
  /baskets:
    - 100 requests per hour per user
    - 10 creates per day per user
  
  /rebalance:
    - 20 requests per hour per user
    - 5 executions per day per basket
```

### Implementation
- **Redis-based:** Sliding window counters
- **Headers:** Rate limit status in responses
- **Bypass:** Admin users and internal services
- **Escalation:** Temporary bans for abuse

---

## CORS Policy

### Allowed Origins
```javascript
const corsOptions = {
  origin: [
    'https://basket.fi',
    'https://www.basket.fi',
    'https://app.basket.fi',
    /^https:\/\/.*\.basket\.fi$/,
    process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
```

---

## Secrets Management

### Environment Variables (.env)
```bash
# Development only - never commit to git
DATABASE_URL=postgresql://user:pass@localhost:5432/basket_dev
JWT_SECRET=dev-secret-key-change-in-production
REDIS_URL=redis://localhost:6379
```

### Production Secrets (Doppler/Vault)
```yaml
Secrets:
  database:
    - DATABASE_URL
    - DB_ENCRYPTION_KEY
  
  authentication:
    - JWT_PRIVATE_KEY
    - JWT_PUBLIC_KEY
  
  external_apis:
    - COINGECKO_API_KEY
    - ALCHEMY_API_KEY
    - WALLETCONNECT_PROJECT_ID
  
  infrastructure:
    - REDIS_PASSWORD
    - S3_ACCESS_KEY
    - MONITORING_API_KEY
```

### Key Rotation Plan
- **JWT Keys:** Rotate every 90 days
- **Database Keys:** Rotate every 180 days
- **API Keys:** Rotate every 365 days or on compromise
- **Process:** Blue-green deployment with key overlap period

---

## Data Retention & Backup Policy

### PostgreSQL Data Retention
```yaml
Tables:
  users:
    retention: Indefinite (until account deletion)
    backup: Daily incremental, weekly full
  
  baskets:
    retention: 7 years after deletion
    backup: Daily incremental, weekly full
  
  transactions:
    retention: 7 years (regulatory requirement)
    backup: Daily incremental, weekly full
  
  logs:
    retention: 90 days (application), 1 year (security)
    backup: Daily, compressed after 30 days
```

### Backup Strategy
- **Frequency:** Daily incremental, weekly full backups
- **Retention:** 30 daily, 12 weekly, 7 yearly backups
- **Encryption:** AES-256 encryption at rest
- **Testing:** Monthly restore tests
- **Geographic:** Multi-region backup storage
- **Recovery:** RTO 4 hours, RPO 1 hour

### Data Deletion
- **User Request:** 30-day grace period, then permanent deletion
- **Regulatory:** Comply with GDPR right to be forgotten
- **Audit Trail:** Maintain deletion logs for compliance
- **Verification:** Confirm deletion across all systems

---

## Security Headers

### HTTP Security Headers
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.coingecko.com"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

## Monitoring & Alerting

### Security Monitoring
- **Failed Authentication:** >10 failures in 5 minutes
- **Rate Limit Violations:** >100 violations per hour
- **Unusual API Patterns:** Anomaly detection
- **Database Errors:** Connection failures, query timeouts
- **Smart Contract Events:** Unusual transaction patterns

### Alert Channels
- **Critical:** PagerDuty + Slack + Email
- **High:** Slack + Email
- **Medium:** Email only
- **Response Time:** <5 minutes for critical alerts