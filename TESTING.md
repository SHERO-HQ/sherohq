# Testing Guide

This document outlines the testing strategies and procedures for the SHERO Technologies platform.

## 🧪 Testing Levels

### 1. Unit Testing (Logic & Utils)

We use **Vitest** for fast unit testing of business logic, utility functions, and API interactions.

- **Frontend Tests**: Located in `src/**/*.test.ts`
- **Backend Tests**: Located in `server/src/**/*.test.ts`

**Commands:**

- Root: `yarn test` (Runs frontend tests)
- Backend: `cd server && yarn test` (Runs backend tests)

### 2. End-to-End Testing (User Journeys)

We use **Playwright** to simulate real user interactions across the entire stack.

- **Location**: `tests/*.spec.ts`

**Commands:**

- Run E2E: `yarn test:e2e`
- Interactive Mode: `yarn test:e2e:ui`

---

## 🛠️ Writing Tests

### Backend Unit Tests

When adding new backend features, extract logic into separate utility functions in `server/src/utils/` and create a corresponding `.test.ts` file.

Example: [sku.test.ts](file:///home/shero/Documents/Projects/webdev/sherotech/server/src/utils/sku.test.ts)

### Frontend Unit Tests

Use Vitest for testing pure functions and hooks. For component testing, use `@testing-library/react`.

Example: [api.test.ts](file:///home/shero/Documents/Projects/webdev/sherotech/src/services/api.test.ts)

---

## 🚦 Continuous Integration

All tests (Unit and E2E) should pass before submitting a Pull Request.
