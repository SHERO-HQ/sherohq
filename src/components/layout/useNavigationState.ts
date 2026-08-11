"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useCart } from "@/hooks/queries/useCartQuery";
import { useUser, useLogout } from "@/hooks/queries/useAuthQuery";
import { useWishlist } from "@/hooks/queries/useWishlistQuery";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { usePathname } from "next/navigation";
import { ShoppingBag, Cpu, MessageSquare, Info } from "lucide-react";
import { getAbsoluteUrl } from "@/utils/subdomain";

export function useNavigationState() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeNavIndex, setActiveNavIndex] = useState<number | null>(null);
  const [indicatorDims, setIndicatorDims] = useState({ width: 0, x: 0 });
  const { totalQuantity, setIsCartOpen } = useCart();
  const { wishlist, setIsWishlistOpen } = useWishlist();
  const { data: userData } = useUser();
  const { mutateAsync: logout } = useLogout();
  const user = userData?.user;
  const isAuthenticated = !!user;
  const pathname = usePathname();
  const mounted = useIsMounted();
  const prefersReducedMotion = useReducedMotion();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);
  const previousIsOpenRef = useRef(false);
  const navMenuRef = useRef<HTMLUListElement>(null);
  const homeHref = getAbsoluteUrl("/");

  const menuVars = useMemo(
    () => ({
      initial: { x: prefersReducedMotion ? 0 : "-100%" },
      animate: {
        x: 0,
        transition: {
          duration: prefersReducedMotion ? 0.01 : 0.28,
          ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        },
      },
      exit: {
        x: prefersReducedMotion ? 0 : "-100%",
        transition: {
          duration: prefersReducedMotion ? 0.01 : 0.22,
          ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        },
      },
    }),
    [prefersReducedMotion],
  );

  const navLinks = useMemo(
    () => [
      {
        name: "Shop",
        icon: ShoppingBag,
        desc: "Explore catalog",
        href: "/shop",
      },
      {
        name: "Solutions",
        icon: Cpu,
        desc: "Business innovations",
        href: "/solutions",
      },
      {
        name: "Consultation",
        icon: MessageSquare,
        desc: "Expert tech advice",
        href: "/consultation",
      },
      {
        name: "About Us",
        icon: Info,
        desc: "Our mission",
        href: "/about-us",
      },
    ],
    [],
  );

  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (isOpen && !isMobile) {
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight =
        scrollBarWidth > 0 ? `${scrollBarWidth}px` : "";
    } else if (isOpen && isMobile) {
      document.body.style.overscrollBehavior = "contain";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "";
      document.body.style.overscrollBehavior = "";
    }

    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "";
      document.body.style.overscrollBehavior = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const focusDelay = prefersReducedMotion ? 0 : 300;
      const timer = setTimeout(() => {
        const focusables = mobileMenuRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );

        const firstLink =
          mobileMenuRef.current?.querySelector<HTMLElement>("a[href]");
        if (firstLink) {
          firstLink.focus();
        } else {
          focusables?.[0]?.focus();
        }
      }, focusDelay);

      return () => clearTimeout(timer);
    }

    if (previousIsOpenRef.current) {
      mobileMenuButtonRef.current?.focus();
    }

    previousIsOpenRef.current = isOpen;
  }, [isOpen, prefersReducedMotion]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsUserMenuOpen(false);
      }

      if (isOpen && event.key === "Tab" && mobileMenuRef.current) {
        const focusables = Array.from(
          mobileMenuRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !el.hasAttribute("disabled"));

        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }

        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!isUserMenuOpen) return;
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [isUserMenuOpen]);

  useEffect(() => {
    if (!isUserMenuOpen || !userMenuRef.current) return;
    const focusables = userMenuRef.current.querySelectorAll<HTMLElement>(
      '[role="menuitem"], a[href], button:not([disabled])',
    );
    focusables[0]?.focus();
  }, [isUserMenuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (mounted) {
      let found = -1;

      navLinks.forEach((item, index) => {
        const linkPath = item.href;
        const absoluteUrl = getAbsoluteUrl(linkPath);
        try {
          const url = new URL(absoluteUrl);
          const targetPath = url.pathname;

          const isActive =
            targetPath === "/"
              ? pathname === "/"
              : pathname === targetPath ||
                pathname.startsWith(targetPath + "/");

          if (isActive) {
            found = index;
          }
        } catch {
          const isActive =
            linkPath === "/"
              ? pathname === "/"
              : pathname === linkPath || pathname.startsWith(linkPath + "/");

          if (isActive) {
            found = index;
          }
        }
      });

      if (activeNavIndex !== found) {
        queueMicrotask(() => setActiveNavIndex(found));
      }
    }
  }, [pathname, mounted, activeNavIndex, navLinks]);

  const measureIndicator = useCallback(() => {
    if (activeNavIndex !== null && activeNavIndex >= 0 && navMenuRef.current) {
      const children = Array.from(navMenuRef.current.children) as HTMLElement[];
      const activeElement = children[activeNavIndex];

      if (activeElement) {
        const width = activeElement.clientWidth;
        const x = activeElement.offsetLeft;
        setIndicatorDims({ width, x });
      }
    } else {
      setIndicatorDims({ width: 0, x: 0 });
    }
  }, [activeNavIndex]);

  useEffect(() => {
    measureIndicator();

    window.addEventListener("resize", measureIndicator);

    if (typeof window !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(measureIndicator);
    }

    return () => {
      window.removeEventListener("resize", measureIndicator);
    };
  }, [activeNavIndex, scrolled, measureIndicator]);

  return {
    isOpen,
    setIsOpen,
    scrolled,
    isUserMenuOpen,
    setIsUserMenuOpen,
    activeNavIndex,
    indicatorDims,
    totalQuantity,
    setIsCartOpen,
    wishlist,
    setIsWishlistOpen,
    user,
    isAuthenticated,
    mounted,
    prefersReducedMotion,
    userMenuRef,
    userMenuButtonRef,
    mobileMenuRef,
    mobileMenuButtonRef,
    navMenuRef,
    homeHref,
    menuVars,
    navLinks,
    logout,
  };
}
