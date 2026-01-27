# SheroTech E-Commerce Platform

A modern, responsive e-commerce web application built for the Ghanaian market, specifically tailored for selling tech products like phones and accessories. This project features a robust frontend, a Node.js backend integration, and a seamless checkout experience with local payment options.

## 🚀 Features

- **Modern User Interface**: Built with React, Tailwind CSS, and Framer Motion for smooth animations and a premium feel.
- **Responsive Design**: Fully optimized for Mobile, Tablet, and Desktop devices.
- **Dark Mode Support**: System-aware dark mode integration.
- **Advanced Checkout Flow**:
  - Multi-step checkout (Cart -> Shipping -> Payment -> Confirmation).
  - **Ghana Phone Validation**: Strict regex validation for local phone numbers (`02x` / `05x`).
  - **Guest Checkout**: No mandatory login required for browsing.
- **Flexible Payment & Delivery Options**:
  - 📱 **Mobile Money**: Integration for MTN and Telecel Cash.
  - 💳 **Card Payment**: Visa and Mastercard support.
  - 💵 **Cash on Delivery**: Pay upon receipt.
  - 🏪 **Store Pickup**: Free shipping option for self-collection.
- **Admin Dashboard**: Capable of managing products and orders (requires admin login).
- **Product Management**: Filtering, sorting, and categorization of tech products.

## 🛠️ Tech Stack

### Frontend

- **Framework**: [React](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context API

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (via Supabase)
- **Payment Integration**: Hubtel (Planned/mocked integration logic)

## 🏁 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

- Node.js (v18 or higher recommended)
- Yarn package manager

### Installation

1.  **Clone the repository**

    ```bash
    git clone <repository-url>
    cd sherotech
    ```

2.  **Install Frontend Dependencies**

    ```bash
    yarn install
    ```

3.  **Install Backend Dependencies**

    ```bash
    cd server
    yarn install
    cd ..
    ```

4.  **Environment Setup**
    Create a `.env` file in the `server/` directory. You can copy the structure from `.env.example` if available.
    ```env
    PORT=5000
    DATABASE_URL=your_database_connection_string
    # Add other necessary API keys here
    ```

## 🏃‍♂️ Running the Project

To run both the frontend and backend servers concurrently:

```bash
yarn dev:all
```

- **Frontend**: http://localhost:5173
- **Backend Server**: http://localhost:5000

### Other Commands

- `yarn dev`: Run only the frontend.
- `yarn server`: Run only the backend.
- `yarn build`: Build the frontend for production.
- `yarn lint`: Run ESLint checks.

## 📂 Project Structure

```
sherotech/
├── public/              # Static assets
├── server/              # Node.js/Express Backend
│   ├── routes/          # API Routes
│   └── ...
├── src/
│   ├── components/      # Reusable UI Components
│   │   ├── checkout/    # Checkout specific components
│   │   ├── products/    # Product grids and cards
│   │   └── ...
│   ├── context/         # React Context (Auth, Cart, Theme)
│   ├── pages/           # Application Route Pages
│   ├── services/        # API functions
│   └── utils/           # Helper functions
├── .gitignore
├── package.json
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
