/**
 * React Router DOM → Next.js Compatibility Layer
 *
 * This module is aliased to replace `react-router-dom` and `react-router`
 * imports throughout the codebase, allowing existing components to work
 * with Next.js App Router without changing their imports.
 *
 * Usage: Configured via webpack/turbopack aliases in next.config.ts
 */
"use client";

import NextLink from "next/link";
import {
  useRouter as useNextRouter,
  usePathname,
  useParams as useNextParams,
} from "next/navigation";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentProps,
} from "react";

// ─── Link ───────────────────────────────────────────────────────────────────
// Maps react-router-dom's <Link to="/path"> to Next.js <Link href="/path">

interface LinkProps extends Omit<
  ComponentProps<typeof NextLink>,
  "href" | "className"
> {
  to: string;
  className?: string;
  replace?: boolean;
  state?: unknown;
  reloadDocument?: boolean;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, children, replace: shouldReplace, className, ...props }, ref) => {
    return (
      <NextLink
        href={to}
        replace={shouldReplace}
        className={className}
        ref={ref}
        {...props}
      >
        {children}
      </NextLink>
    );
  },
);
Link.displayName = "Link";

// ─── NavLink ────────────────────────────────────────────────────────────────
// Maps react-router-dom's <NavLink> with isActive support

interface NavLinkProps extends Omit<LinkProps, "className" | "children"> {
  className?:
    | string
    | ((props: { isActive: boolean; isPending: boolean }) => string);
  children?:
    | React.ReactNode
    | ((props: { isActive: boolean; isPending: boolean }) => React.ReactNode);
  end?: boolean;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ to, className, children, end = false, ...props }, ref) => {
    const pathname = usePathname() ?? "";

    const isActive = end
      ? pathname === to
      : pathname.startsWith(to) && (to !== "/" || pathname === "/");

    const resolvedClassName =
      typeof className === "function"
        ? className({ isActive, isPending: false })
        : className;

    const resolvedChildren =
      typeof children === "function"
        ? children({ isActive, isPending: false })
        : children;

    return (
      <NextLink href={to} className={resolvedClassName} ref={ref} {...props}>
        {resolvedChildren}
      </NextLink>
    );
  },
);
NavLink.displayName = "NavLink";

// ─── useNavigate ────────────────────────────────────────────────────────────

type NavigateFunction = {
  (to: string, options?: { replace?: boolean; state?: unknown }): void;
  (delta: number): void;
};

function useNavigate(): NavigateFunction {
  const router = useNextRouter();

  return useCallback(
    (
      toOrDelta: string | number,
      options?: { replace?: boolean; state?: unknown },
    ) => {
      if (typeof toOrDelta === "number") {
        if (toOrDelta === -1) {
          router.back();
        } else if (toOrDelta === 1) {
          router.forward();
        } else {
          // Next.js doesn't support arbitrary history deltas
          router.back();
        }
      } else {
        if (options?.replace) {
          router.replace(toOrDelta);
        } else {
          router.push(toOrDelta);
        }
      }
    },
    [router],
  );
}

// ─── useParams ──────────────────────────────────────────────────────────────

function useParams<
  T extends Record<string, string | undefined> = Record<
    string,
    string | undefined
  >,
>(): T {
  const params = useNextParams();
  return (params ?? {}) as T;
}

// ─── useLocation ────────────────────────────────────────────────────────────

interface Location {
  pathname: string;
  search: string;
  hash: string;
  state: unknown;
  key: string;
}

function useLocation(): Location {
  const pathname = usePathname() ?? "/";

  // Avoid useNextSearchParams() — it requires a <Suspense> boundary and causes
  // "Rendered more hooks than previous render" in the Next.js App Router.
  // Instead sync from window.location which is always correct on the client.
  const [search, setSearch] = useState(
    typeof window !== "undefined" ? window.location.search : "",
  );
  const [hash, setHash] = useState(
    typeof window !== "undefined" ? window.location.hash : "",
  );

  // Re-sync whenever the path changes (covers push/replace without popstate)
  useEffect(() => {
    setSearch(window.location.search);
    setHash(window.location.hash);
  }, [pathname]);

  // Also react to browser back/forward
  useEffect(() => {
    const handler = () => {
      setSearch(window.location.search);
      setHash(window.location.hash);
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  return useMemo(
    () => ({
      pathname,
      search,
      hash,
      state: null,
      key: "default",
    }),
    [pathname, search, hash],
  );
}

// ─── useSearchParams ────────────────────────────────────────────────────────

function useSearchParams(): [
  URLSearchParams,
  (
    params: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams),
  ) => void,
] {
  // Avoid useNextSearchParams() — it requires a <Suspense> boundary.
  const router = useNextRouter();
  const pathname = usePathname();

  const [search, setSearch] = useState(
    typeof window !== "undefined" ? window.location.search : "",
  );

  useEffect(() => {
    setSearch(window.location.search);
  }, [pathname]);

  useEffect(() => {
    const handler = () => setSearch(window.location.search);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const setSearchParams = useCallback(
    (
      nextParams:
        | URLSearchParams
        | ((prev: URLSearchParams) => URLSearchParams),
    ) => {
      const current = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : "",
      );
      const newParams =
        typeof nextParams === "function" ? nextParams(current) : nextParams;
      router.push(`${pathname}?${newParams.toString()}`);
    },
    [router, pathname],
  );

  return [new URLSearchParams(search), setSearchParams];
}

// ─── Navigate Component ─────────────────────────────────────────────────────
// <Navigate to="/path" replace /> → client-side redirect using useRouter

function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const router = useNextRouter();
  useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [to, replace, router]);
  return null;
}

// ─── Outlet ─────────────────────────────────────────────────────────────────
// No-op: Next.js uses {children} in layouts instead

function Outlet() {
  return null;
}

// ─── Route & Routes ─────────────────────────────────────────────────────────
// No-ops: File-based routing replaces these

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Route(_props: {
  path?: string;
  element?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return null;
}

function Routes({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

// ─── BrowserRouter ──────────────────────────────────────────────────────────
// No-op wrapper: Next.js handles routing at the framework level

function BrowserRouter({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// ─── matchPath ──────────────────────────────────────────────────────────────
// Simple path matching utility

function matchPath(
  pattern: string | { path: string },
  pathname: string,
): { params: Record<string, string> } | null {
  const path = typeof pattern === "string" ? pattern : pattern.path;
  const regex = new RegExp(
    "^" + path.replace(/:[^/]+/g, "([^/]+)").replace(/\*/g, ".*") + "$",
  );
  const match = pathname.match(regex);
  if (!match) return null;
  return { params: {} };
}

// ─── Types ──────────────────────────────────────────────────────────────────
// Exported to satisfy `import type { NavigateOptions, To } from "react-router-dom"`

export type To = string | { pathname: string; search?: string; hash?: string };
export type NavigateOptions = {
  replace?: boolean;
  state?: unknown;
  relative?: string;
};

// ─── Exports ────────────────────────────────────────────────────────────────

export {
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  BrowserRouter,
  useNavigate,
  useParams,
  useLocation,
  useSearchParams,
  matchPath,
};

export default {
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  BrowserRouter,
  useNavigate,
  useParams,
  useLocation,
  useSearchParams,
  matchPath,
};
