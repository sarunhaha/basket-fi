# Route Map - Basket.fi Frontend

## App Router Structure

```
apps/web/src/app/
├── (auth)/                     # Auth route group
│   ├── layout.tsx             # Auth layout (centered, no nav)
│   ├── sign-in/
│   │   └── page.tsx           # Sign in with wallet
│   ├── sign-up/
│   │   └── page.tsx           # Sign up flow
│   └── reset/
│       └── page.tsx           # Password reset (future)
├── (dashboard)/               # Protected dashboard routes
│   ├── layout.tsx             # Dashboard layout (sidebar, nav)
│   ├── page.tsx               # Dashboard home
│   ├── baskets/
│   │   ├── page.tsx           # Baskets list
│   │   ├── create/
│   │   │   └── page.tsx       # Create new basket
│   │   └── [id]/
│   │       ├── page.tsx       # Basket detail
│   │       ├── edit/
│   │       │   └── page.tsx   # Edit basket
│   │       └── rebalance/
│   │           └── page.tsx   # Rebalance basket
│   ├── transactions/
│   │   └── page.tsx           # Transaction history
│   ├── alerts/
│   │   └── page.tsx           # Alert management
│   └── settings/
│       └── page.tsx           # User settings
├── api/                       # API routes (if needed)
│   └── auth/
│       └── [...nextauth]/
│           └── route.ts       # NextAuth.js handler
├── globals.css                # Global styles
├── layout.tsx                 # Root layout
├── loading.tsx                # Global loading UI
├── error.tsx                  # Global error UI
├── not-found.tsx              # 404 page
└── page.tsx                   # Landing page (redirect to dashboard)
```

## Route Protection Strategy

### Public Routes
- `/` - Landing page (redirects to dashboard if authenticated)
- `/sign-in` - Authentication
- `/sign-up` - Registration

### Protected Routes (require authentication)
- `/dashboard` - Main dashboard
- `/baskets/*` - All basket-related pages
- `/transactions` - Transaction history
- `/alerts` - Alert management
- `/settings` - User settings

## Navigation Structure

### Main Navigation (Sidebar)
```typescript
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Baskets', href: '/baskets', icon: FolderIcon },
  { name: 'Transactions', href: '/transactions', icon: ArrowsRightLeftIcon },
  { name: 'Alerts', href: '/alerts', icon: BellIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];
```

### Breadcrumb Examples
- Dashboard: `Home`
- Baskets: `Home > Baskets`
- Basket Detail: `Home > Baskets > DeFi Blue Chips`
- Create Basket: `Home > Baskets > Create`
- Edit Basket: `Home > Baskets > DeFi Blue Chips > Edit`
- Rebalance: `Home > Baskets > DeFi Blue Chips > Rebalance`

## Internationalization Routes

### Locale Handling
- Default locale: `en`
- Supported locales: `en`, `th`
- URL structure: `/[locale]/...` (optional, defaults to `en`)

### Localized Routes
```
/en/dashboard (or /dashboard)
/th/dashboard
/en/baskets
/th/baskets
```

## Data Loading Patterns

### Server Components (Default)
- Page components load initial data
- Use React Suspense for loading states
- Error boundaries for error handling

### Client Components (When Needed)
- Interactive forms
- Real-time updates
- Optimistic updates
- Complex state management

## SEO & Meta Tags

### Dynamic Meta Tags
```typescript
// Example for basket detail page
export async function generateMetadata({ params }: { params: { id: string } }) {
  const basket = await getBasket(params.id);
  return {
    title: `${basket.name} - Basket.fi`,
    description: basket.description,
  };
}
```

## Error Handling Strategy

### Error Boundaries
- Global error boundary in root layout
- Route-specific error boundaries
- Component-level error handling

### Loading States
- Page-level loading components
- Skeleton components for content
- Suspense boundaries for async components

## Accessibility Considerations

### Focus Management
- Proper focus order
- Skip links for navigation
- Focus indicators

### ARIA Labels
- Screen reader support
- Semantic HTML structure
- Proper heading hierarchy

### Keyboard Navigation
- All interactive elements accessible via keyboard
- Proper tab order
- Escape key handling for modals