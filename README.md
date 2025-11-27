# Moneyfer - Cross-Border Payments Platform

A modern, full-featured fintech application for cross-border payments using stablecoins and local settlement. Built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure login and signup with form validation
- **KYC Verification**: Multi-step identity verification process
- **Cross-Border Transfers**: Send money to 60+ countries
- **Real-time Exchange Rates**: Dynamic rate fetching based on destination country
- **Transaction History**: Complete history with filtering and search
- **Wallet Management**: Multi-wallet support (USDC, ETH, USDT)
- **Dark Mode**: Full theme support with system preference detection

### Technical Features
- **Form Validation**: Comprehensive validation using React Hook Form + Zod
- **State Management**: Context-based state with localStorage persistence
- **Toast Notifications**: User-friendly feedback for all actions
- **Loading States**: Proper loading indicators throughout the app
- **Error Handling**: Graceful error handling with user feedback
- **Responsive Design**: Mobile-first, fully responsive UI

## 📁 Project Structure

```
moneyfer/
├── app/
│   ├── app-provider.tsx      # Global state management
│   ├── globals.css           # Global styles and theme
│   ├── layout.tsx            # Root layout with theme provider
│   └── page.tsx              # Main entry point
├── components/
│   ├── app-shell.tsx         # Main app container with navigation
│   ├── navigation.tsx        # Bottom navigation bar
│   ├── theme-provider.tsx    # Theme context provider
│   ├── screens/              # Screen components
│   │   ├── dashboard-screen.tsx
│   │   ├── kyc-screen.tsx
│   │   ├── login-screen.tsx
│   │   ├── send-money-flow.tsx
│   │   ├── settings-screen.tsx
│   │   ├── signup-screen.tsx
│   │   ├── splash-screen.tsx
│   │   └── transaction-history-screen.tsx
│   └── ui/                   # Reusable UI components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── loading-spinner.tsx
│       ├── toast.tsx
│       └── toaster.tsx
├── hooks/
│   └── use-toast.ts          # Toast notification hook
├── lib/
│   ├── api.ts                # Mock API layer with localStorage
│   └── utils.ts              # Utility functions
└── public/                   # Static assets
```

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives
- **Form Handling**: React Hook Form + Zod
- **State Management**: React Context API
- **Theme**: next-themes
- **Icons**: Lucide React

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (or npm/yarn)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd v0-fintech-design-system
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
pnpm build
pnpm start
```

## 📱 Usage

### Authentication Flow
1. Start at the splash screen
2. Sign up with email, name, and password
3. Complete KYC verification (document upload, liveness check)
4. Access the dashboard

### Sending Money
1. Navigate to "Send" from the bottom navigation
2. Select destination country
3. Choose payout method (Mobile Money, Bank Transfer, Wallet)
4. Enter recipient details
5. Enter amount (real-time exchange rate displayed)
6. Choose transfer route (Direct, Optimal, Fast Track)
7. Select payment method
8. Complete payment and confirm

### Viewing Transactions
- Navigate to "History" to see all transactions
- Filter by status (all, completed, pending, failed)
- Search by recipient name
- View transaction details

### Settings
- Toggle dark mode
- View connected wallets
- Manage security settings
- View profile information

## 🔧 Key Implementation Details

### Data Persistence
- All data is stored in localStorage for demo purposes
- In production, replace `lib/api.ts` with actual API calls
- Session management with automatic expiration

### State Management
- Global state via React Context (`app/app-provider.tsx`)
- Automatic data loading on app initialization
- Real-time updates across components

### Form Validation
- All forms use React Hook Form with Zod schemas
- Real-time validation feedback
- Error messages displayed via toast notifications

### Theme System
- Uses next-themes for theme management
- Supports light, dark, and system preferences
- Smooth transitions between themes

## 🎨 Design System

### Colors
- Primary: Purple/Blue gradient
- Secondary: Green accent
- Success: Green
- Error: Red
- Warning: Yellow

### Typography
- Font: Geist Sans (primary), Geist Mono (code)
- Responsive font sizes
- Clear hierarchy

### Components
- Consistent spacing (4px base unit)
- Rounded corners (0.75rem default)
- Smooth animations and transitions
- Accessible focus states

## 🔐 Security Notes

⚠️ **This is a demo application**. For production use:
- Implement proper authentication (JWT, OAuth, etc.)
- Add API rate limiting
- Implement proper KYC verification
- Add encryption for sensitive data
- Use secure payment processing
- Implement proper error logging
- Add monitoring and analytics

## 📝 License

This project is for demonstration purposes.

## 🤝 Contributing

This is a prototype application. For production use, consider:
- Adding unit and integration tests
- Implementing proper error boundaries
- Adding analytics
- Implementing proper logging
- Adding monitoring and alerting
- Security audit and penetration testing

---

Built with ❤️ using Next.js and modern web technologies.
