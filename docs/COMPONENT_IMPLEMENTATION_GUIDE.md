# SheroTech Component Implementation Guide

**Building consistent, accessible components aligned with the design system**

---

## Overview

This guide provides practical code examples for implementing components following SheroTech design patterns. All examples use:

- **Tailwind CSS** for styling
- **React** for component logic
- **Framer Motion** for animations
- **Lucide React** for icons

---

## Component Templates

### Button Component

#### Primary CTA Button

```jsx
// components/ui/Button.tsx
import { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const buttonVariants = cva(
  "inline-flex items-center justify-center font-black uppercase tracking-widest text-xs rounded transition-all active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary:
          "bg-emerald-500 hover:bg-emerald-400 text-white shadow shadow-emerald-500/20 hover:-translate-y-0.5",
        secondary:
          "bg-slate-100 dark:bg-slate-900 hover:bg-emerald-500 hover:text-white text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800",
        outline:
          "border border-slate-300 dark:border-slate-600 text-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        destructive:
          "bg-red-500 hover:bg-red-600 text-white shadow shadow-red-500/20",
      },
      size: {
        sm: "px-3 py-1.5 text-xs",
        md: "px-6 py-2 text-sm",
        lg: "px-8 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export function Button({
  variant,
  size,
  disabled,
  loading,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={buttonVariants({ variant, size, className })}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
```

#### Usage

```jsx
import { Button } from "@/components/ui/Button";

export function ProductActions() {
  return (
    <div className="flex gap-4">
      <Button variant="primary" size="lg">
        Add to Cart
      </Button>
      <Button variant="secondary" size="lg">
        Save to Wishlist
      </Button>
      <Button variant="outline" size="md">
        Share
      </Button>
    </div>
  );
}
```

---

### Card Component

```jsx
// components/ui/Card.tsx
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}

export function Card({ children, className = "", interactive = false }: CardProps) {
  return (
    <div
      className={`
        bg-card border border-border rounded p-6 shadow-sm
        ${interactive ? "hover:shadow-md hover:scale-102 transition-all cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// Subcomponents for structure
Card.Header = function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`border-b border-border pb-4 mb-4 ${className}`}>{children}</div>;
};

Card.Body = function CardBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`border-t border-border pt-4 mt-4 flex gap-3 ${className}`}>{children}</div>;
};
```

#### Usage

```jsx
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function ProductCard({ product }) {
  return (
    <Card interactive>
      <Card.Header>
        <h3 className="text-lg font-bold text-foreground">{product.name}</h3>
      </Card.Header>
      <Card.Body>
        <img
          src={product.image}
          alt={product.name}
          className="w-full rounded mb-4"
        />
        <p className="text-sm text-muted-foreground mb-3">
          {product.description}
        </p>
        <p className="text-2xl font-black text-emerald-500">{product.price}</p>
      </Card.Body>
      <Card.Footer>
        <Button variant="primary" className="flex-1">
          View Details
        </Button>
      </Card.Footer>
    </Card>
  );
}
```

---

### Input Field with Label

```jsx
// components/ui/FormField.tsx
import { InputHTMLAttributes, ReactNode } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
}

export function FormField({
  label,
  error,
  helperText,
  icon,
  type = "text",
  ...props
}: FormFieldProps) {
  return (
    <div className="flex flex-col w-full">
      <label className="text-sm font-semibold text-foreground mb-2">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}

        <input
          type={type}
          {...props}
          className={`
            w-full px-${icon ? "10" : "4"} py-2.5
            bg-input border border-input rounded
            text-foreground placeholder:text-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-emerald-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? "border-red-500 focus:ring-red-500" : ""}
            ${props.className || ""}
          `}
        />
      </div>

      {error && <p className="text-xs text-red-600 mt-1.5 font-medium">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-muted-foreground mt-1.5">{helperText}</p>
      )}
    </div>
  );
}
```

#### Usage

```jsx
import { FormField } from "@/components/ui/FormField";
import { Mail, Phone } from "lucide-react";

export function ContactForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  return (
    <form className="space-y-6">
      <FormField
        label="Email Address"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        icon={<Mail size={18} />}
        error={error}
        helperText="We'll never share your email"
        required
      />

      <FormField
        label="Phone Number"
        type="tel"
        placeholder="0246123456"
        icon={<Phone size={18} />}
        helperText="Ghana format: 02x or 05x"
      />
    </form>
  );
}
```

---

### Badge Component

```jsx
// components/ui/Badge.tsx
import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "error" | "warning" | "info";
  className?: string;
}

const badgeVariants = {
  default: "bg-muted text-muted-foreground",
  success: "bg-emerald-100/80 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-500/20",
  error: "bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-500/20",
  warning: "bg-amber-100/80 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-500/20",
  info: "bg-blue-100/80 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-500/20",
  premium: "bg-brand-secondary-100/80 text-brand-secondary-700 dark:bg-brand-secondary-900/30 dark:text-brand-secondary-400 border border-brand-secondary-500/20",
};

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-block px-2.5 py-1
        rounded
        text-[10px] font-bold uppercase tracking-wider
        ${badgeVariants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
```

#### Usage

```jsx
import { Badge } from "@/components/ui/Badge";

export function ProductStatus({ product }) {
  return (
    <div className="flex gap-2">
      <Badge variant="success">In Stock</Badge>
      {product.isNew && <Badge variant="info">New</Badge>}
      {product.discount > 0 && (
        <Badge variant="warning">{product.discount}% Off</Badge>
      )}
    </div>
  );
}
```

---

### Modal Component

```jsx
// components/ui/Modal.tsx
import { ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={`
                bg-card border border-border rounded shadow-2xl
                w-full ${sizeClasses[size]}
                max-h-[90vh] overflow-y-auto
              `}
            >
              {/* Header */}
              {title && (
                <div className="border-b border-border p-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-foreground">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-muted rounded transition-colors"
                  >
                    <X size={20} className="text-muted-foreground" />
                  </button>
                </div>
              )}

              {/* Content */}
              <div className="p-6">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

#### Usage

```jsx
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export function ProductPreview() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>View Details</Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Product Details"
        size="lg"
      >
        <div className="space-y-4">
          <img src={product.image} alt="" className="w-full rounded" />
          <h3 className="text-2xl font-bold">{product.name}</h3>
          <p className="text-muted-foreground">{product.description}</p>
          <div className="flex gap-3 pt-4">
            <Button variant="primary" className="flex-1">
              Add to Cart
            </Button>
            <Button variant="secondary">Save</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
```

---

### Animation Wrapper

```jsx
// components/common/AnimatedContent.tsx
import { ReactNode } from "react";
import { motion } from "motion/react";

interface AnimatedContentProps {
  children: ReactNode;
  type?: "fade" | "slide-up" | "scale" | "fade-scale";
  delay?: number;
  duration?: number;
}

export function AnimatedContent({
  children,
  type = "fade",
  delay = 0,
  duration = 0.4,
}: AnimatedContentProps) {
  const variants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
    },
    "slide-up": {
      initial: { y: 20, opacity: 0 },
      animate: { y: 0, opacity: 1 },
    },
    scale: {
      initial: { scale: 0.95, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
    },
    "fade-scale": {
      initial: { scale: 0.9, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
    },
  };

  return (
    <motion.div
      initial={variants[type].initial}
      animate={variants[type].animate}
      transition={{
        duration,
        delay,
        type: type === "scale" || type === "fade-scale" ? "spring" : "easeInOut",
        damping: type.includes("scale") ? 20 : undefined,
      }}
    >
      {children}
    </motion.div>
  );
}
```

#### Usage

```jsx
import { AnimatedContent } from "@/components/common/AnimatedContent";

export function HeroSection() {
  return (
    <section>
      <AnimatedContent type="fade">
        <h1 className="text-7xl font-black">Hero Title</h1>
      </AnimatedContent>

      <AnimatedContent type="slide-up" delay={0.2}>
        <p className="text-lg text-muted-foreground mt-4">
          Description comes here
        </p>
      </AnimatedContent>

      <AnimatedContent type="scale" delay={0.4}>
        <Button className="mt-8">Call to Action</Button>
      </AnimatedContent>
    </section>
  );
}
```

---

### Process Step Component

Used for "The Path to Partnership" and "Consultation Framework" sections.

```jsx
// components/ui/ProcessStep.tsx
import { ReactNode } from "react";

interface ProcessStepProps {
  number: string;
  title: string;
  description: string;
  isLast?: boolean;
}

export function ProcessStep({ number, title, description, isLast }: ProcessStepProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex items-center w-full mb-6">
        <div className="size-12 shrink-0 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center font-mono font-bold text-brand-secondary-600 dark:text-brand-secondary-400">
          {number}
        </div>
        {!isLast && (
          <div className="hidden md:block h-px flex-1 bg-linear-to-r from-slate-200 to-transparent dark:from-slate-800 ml-4" />
        )}
      </div>
      <div className="space-y-2">
        <h4 className="text-xl font-bold dark:text-white text-slate-900">{title}</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
          {description}
        </p>
      </div>
    </div>
  );
}
```

---

### Select Dropdown

```jsx
// components/ui/Select.tsx
import { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export function Select({
  label,
  options,
  error,
  ...props
}: SelectProps) {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="text-sm font-semibold text-foreground mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          {...props}
          className={`
            w-full px-4 py-2.5
            bg-input border border-input rounded
            text-foreground
            appearance-none cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-emerald-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? "border-red-500" : ""}
          `}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={18}
          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground"
        />
      </div>

      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}
```

#### Usage

```jsx
import { Select } from "@/components/ui/Select";

export function FilterPanel() {
  return (
    <Select
      label="Category"
      options={[
        { value: "phones", label: "Phones" },
        { value: "accessories", label: "Accessories" },
        { value: "laptops", label: "Laptops" },
      ]}
    />
  );
}
```

---

## Best Practices

### Do's ✅

1. **Use Compound Components**: Break complex UI into smaller, composable pieces
2. **Export Subcomponents**: Allow flexible usage patterns (`Card.Header`, `Card.Body`)
3. **Respect Design System**: Always use CSS variables and design tokens
4. **Make Props Optional**: Provide sensible defaults
5. **Add TypeScript**: Full type safety for props and children
6. **Test in Both Modes**: Light and dark mode compatibility
7. **Document Props**: JSDoc comments for props and usage
8. **Handle Edge Cases**: Disabled state, loading state, error state

### Don'ts ❌

1. **Don't Hardcode Colors**: Always use CSS variables
2. **Don't Create Similar Components**: Reuse existing components with variants
3. **Don't Skip Accessibility**: ARIA labels, semantic HTML, keyboard support
4. **Don't Over-Animate**: Motion should enhance, not distract
5. **Don't Ignore TypeScript Errors**: Type-safe components prevent bugs
6. **Don't Repeat CSS**: Use Tailwind utilities, not custom CSS blocks
7. **Don't Make Assumptions**: Props over magic behavior
8. **Don't Forget Testing**: Unit test components, especially complex logic

---

## File Organization

```
src/components/
├── ui/                          # Reusable UI primitives
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   ├── FormField.tsx
│   ├── Badge.tsx
│   └── Select.tsx
├── common/                       # Shared layout components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── AnimatedContent.tsx
│   └── PageContainer.tsx
├── layout/                       # Full-page layout
│   ├── TopBarStack.tsx
│   ├── NavigationBar.tsx
│   └── PWAInstallBanner.tsx
├── products/                     # Product-specific
│   ├── ProductCard.tsx
│   ├── ProductGallery.tsx
│   └── ProductSpotlight.tsx
├── checkout/                     # Checkout flow
│   ├── CheckoutStep.tsx
│   └── PaymentMethod.tsx
└── admin/                        # Admin dashboard
    ├── AdminHeader.tsx
    └── StatCard.tsx
```

---

## Component Testing Checklist

Before shipping a component:

- [ ] Renders without errors
- [ ] Responsive on mobile, tablet, desktop
- [ ] Accessible (keyboard nav, screen reader, contrast)
- [ ] Works in light and dark mode
- [ ] Animations respect `prefers-reduced-motion`
- [ ] TypeScript compiles without errors
- [ ] Props have sensible defaults
- [ ] Disabled states work correctly
- [ ] Error states display properly
- [ ] Loading states are visible
- [ ] Focus ring visible on interactive elements
- [ ] No console warnings or errors

---

## Quick Reference: Common Imports

```jsx
// React Basics
import { useState, useEffect, useCallback } from "react";

// UI Components
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { FormField } from "@/components/ui/FormField";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";

// Layout/Common
import { AnimatedContent } from "@/components/common/AnimatedContent";

// Animation
import { motion, AnimatePresence } from "motion/react";

// Icons
import { ShoppingCart, Menu, X, ChevronDown } from "lucide-react";

// Next.js
import Link from "next/link";
import Image from "next/image";

// Utilities
import { formatCurrency } from "@/utils/format";
import { cn } from "@/lib/utils";
```

---

## Resources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Lucide React Icons](https://lucide.dev/)
- [Class Variance Authority](https://cva.style/)
- [React Docs](https://react.dev/)

---

**Version**: 1.0 | **Updated**: April 18, 2026
