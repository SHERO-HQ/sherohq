# SheroTech Solutions & Showcase Platform

A modern, responsive platform built for **SHERO HQ Technologies**. This website showcases premium hardware, custom systems configuration, managed software solutions, and expert consultation services, all backed by a high-performance Next.js Native Architecture.

## 🚀 Key Features

- **Next.js 16+ Native Architecture**: Unified full-stack codebase utilizing modern App Router API routes.
- **Premium Solutions Showcase**: Immersive displays for managed IT support, server infrastructure, custom software engineering, and procurement services.
- **Hardware & Products Showcase**: Elegant catalog featuring business-grade laptops, networking systems, accessories, and configured hardware solutions.
- **Direct Lead Generation**: Seamless client engagement with dynamic WhatsApp inquiry workflows and custom quote triggers on all products.
- **High-Fidelity Consultation Scheduler**: Integrated scheduler enabling clients to discover strategies and book discovery sessions directly.
- **Multi-Factor Authentication (MFA)**: Production-grade TOTP-based security for administrative accounts.
- **Modern User Interface**: Built with React 19, Tailwind CSS v4, and Framer Motion for premium visual depth.
- **Admin Command Center**: Comprehensive dashboard with real-time analytics, user audits, and activity logging.

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
