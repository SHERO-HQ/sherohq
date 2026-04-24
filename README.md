# SheroTech E-Commerce Platform

A modern, responsive e-commerce web application built for the Ghanaian market. This platform has been fully migrated to a **Next.js Native Architecture**, utilizing App Router API routes for the backend, resulting in a unified, high-performance codebase.

## 🚀 Key Features

- **Next.js 16+ Native Architecture**: Unified full-stack codebase with App Router API routes.
- **Multi-Factor Authentication (MFA)**: Production-grade TOTP-based security for administrative accounts.
- **Modern User Interface**: Built with React 19, Tailwind CSS v4, and Framer Motion for premium animations.
- **Advanced Checkout Flow**:
  - Multi-step checkout (Cart -> Shipping -> Payment -> Confirmation).
  - **Ghana Phone Validation**: Strict regex validation for local phone numbers (`02x` / `05x`).
- **Flexible Payments**:
  - 📱 **Mobile Money**: MTN and Telecel Cash.
  - 💳 **Card Payment**: Visa/Mastercard via Paystack.
  - 💵 **Cash on Delivery** & **Store Pickup**.
- **Admin Dashboard**: Comprehensive panel with real-time analytics, order management, and activity logs.

## 🛠️ Tech Stack

### Full Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/))
- **Animations**: [Framer Motion / Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏁 Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- Yarn 4.x package manager

### Installation
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sherotech
   ```
2. **Install Dependencies**
   ```bash
   yarn install
   ```

### Environment Setup
Create a `.env.local` file in the root directory:
```env
# Database
DATABASE_URL=your_postgresql_connection_string

# Supabase (Storage/Auth)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# Email (Resend)
RESEND_API_KEY=your_resend_key
```

## 🏃‍♂️ Running the Project

### Development
```bash
yarn dev
```
- Frontend & API: [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
yarn build
yarn start
```

## 🧪 Testing
- **Unit/Integration**: `yarn test` (Vitest)
- **End-to-End**: `yarn test:e2e` (Playwright)

## 📂 Project Structure
```text
sherotech/
├── src/
│   ├── app/             # App Router (Pages & API Routes)
│   ├── components/      # UI Components (Atomic Design)
│   ├── context/         # Auth, Admin, and Global Contexts
│   ├── hooks/           # Custom React Hooks
│   ├── lib/             # Server-side utilities (DB, Auth, Utils)
│   ├── services/        # Client-side API service layers
│   ├── utils/           # Shared utility functions
│   └── views/           # Page-level view compositions
├── public/              # Static assets
├── tests/               # E2E and Integration tests
├── next.config.ts       # Framework configuration
└── package.json         # Dependencies and scripts
```

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License
This project is licensed under the MIT License.
