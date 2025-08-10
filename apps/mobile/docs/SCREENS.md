# Screen Architecture - Basket.fi Mobile App

## Screen List

### Authentication Flow
1. **Welcome Screen** (`(auth)/welcome.tsx`)
   - App introduction and branding
   - Get Started / Sign In options
   - Feature highlights

2. **Biometric Setup** (`(auth)/biometric-setup.tsx`)
   - Face ID/Touch ID configuration
   - Security explanation
   - Skip option for later setup

3. **Wallet Connect** (`(auth)/wallet-connect.tsx`)
   - WalletConnect integration
   - QR code scanning
   - Wallet selection

### Main Application (Tab Navigation)
4. **Dashboard** (`(tabs)/index.tsx`)
   - Portfolio overview stats
   - Recent baskets
   - Quick actions
   - Market insights

5. **Baskets List** (`(tabs)/baskets.tsx`)
   - All user baskets
   - Search and filtering
   - Create basket FAB
   - Sort options

6. **Alerts** (`(tabs)/alerts.tsx`)
   - Active alerts list
   - Alert history
   - Create new alert
   - Notification settings

7. **Settings** (`(tabs)/settings.tsx`)
   - User profile
   - App preferences
   - Security settings
   - About/Help

### Detail Screens
8. **Basket Detail** (`basket/[id].tsx`)
   - Individual basket overview
   - Allocation breakdown
   - Performance charts
   - Management actions

9. **Quick Rebalance** (`rebalance/[id].tsx`)
   - Rebalance preview
   - Dry run vs execute
   - Trade breakdown
   - Gas estimation

### Modal Screens
10. **Add Basket** (`add-basket.tsx`)
    - Create new basket form
    - Token selection
    - Allocation setup
    - Preview and create

11. **Edit Basket** (`edit-basket/[id].tsx`)
    - Modify basket settings
    - Update allocations
    - Change visibility

12. **Notification Detail** (`notification/[id].tsx`)
    - Alert details
    - Action buttons
    - Related basket info

## Screen Flow Examples

### First-Time User Flow
```
Welcome → Biometric Setup → Wallet Connect → Dashboard
```

### Returning User Flow (with biometrics)
```
Biometric Auth → Dashboard
```

### Create Basket Flow
```
Dashboard/Baskets → Add Basket → Basket Detail
```

### Quick Rebalance Flow
```
Dashboard/Baskets → Basket Detail → Quick Rebalance → Confirmation
```

### Alert Management Flow
```
Alerts → Create Alert → Alert Detail → Notification
```

## Screen Components

### Common Components
- **Header**: Navigation, title, actions
- **Loading States**: Skeletons for each screen type
- **Empty States**: No data scenarios
- **Error States**: Network/API error handling
- **Pull to Refresh**: Data refresh mechanism

### Screen-Specific Components
- **BasketCard**: Basket preview with quick actions
- **StatsCard**: Portfolio metrics display
- **AllocationChart**: Visual allocation breakdown
- **TransactionItem**: Transaction history item
- **AlertItem**: Alert configuration item

## Navigation Patterns

### Tab Navigation
- Bottom tab bar with 4 main sections
- Badge indicators for alerts
- Deep linking support

### Stack Navigation
- Modal presentation for creation flows
- Card presentation for detail views
- Gesture-based navigation

### Deep Linking
```
basketfi://basket/123        # Open basket detail
basketfi://rebalance/123     # Quick rebalance
basketfi://alerts            # Alerts screen
basketfi://settings          # Settings screen
```

## Responsive Design

### Phone Layouts
- Single column layouts
- Collapsible sections
- Swipe gestures for actions

### Tablet Considerations
- Master-detail layouts
- Side-by-side views
- Enhanced navigation

## Accessibility Features

### Screen Reader Support
- Semantic labels for all interactive elements
- Proper heading hierarchy
- Content descriptions

### Keyboard Navigation
- Tab order management
- Focus indicators
- Keyboard shortcuts

### Visual Accessibility
- High contrast support
- Dynamic type scaling
- Color-blind friendly design

## Performance Considerations

### Screen Loading
- Skeleton screens during data fetch
- Progressive loading for large lists
- Image lazy loading

### Memory Management
- Screen unmounting cleanup
- Image caching strategies
- Query cache optimization

### Battery Optimization
- Background task management
- Efficient re-renders
- Network request batching