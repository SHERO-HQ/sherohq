"use client";
import { useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useAdmin } from "@/context/AdminContext";
import { PageTransition } from "@/components/common/PageTransition";

interface AdminLayoutProps {
 children: React.ReactNode;
}

export default function AdminLayout({ children }: Readonly<AdminLayoutProps>) {
 const { isSidebarOpen, setIsSidebarOpen } = useAdmin();

 // Global Keyboard Shortcuts
 useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
   // '/' to focus search
   if (
    e.key === "/" &&
    (e.target as HTMLElement).tagName !== "INPUT" &&
    (e.target as HTMLElement).tagName !== "TEXTAREA"
   ) {
    e.preventDefault();
    const searchInput = document.querySelector(
     'input[placeholder*="Search"]',
    ) as HTMLInputElement;
    if (searchInput) searchInput.focus();
   }

   // 'ESC' to close sidebar if mobile
   if (e.key === "Escape" && globalThis.innerWidth < 1024) {
    setIsSidebarOpen(false);
   }
  };

  globalThis.addEventListener("keydown", handleKeyDown);
  return () => globalThis.removeEventListener("keydown", handleKeyDown);
 }, [setIsSidebarOpen]);

 // Responsive adjustment
 useEffect(() => {
  const handleResize = () => {
   if (globalThis.innerWidth < 1024) {
    setIsSidebarOpen(false);
   }
  };

  handleResize(); // Set initial state for smaller screens
  globalThis.addEventListener("resize", handleResize);
  return () => globalThis.removeEventListener("resize", handleResize);
 }, [setIsSidebarOpen]);

 return (
  <div className="dark min-h-screen bg-slate-950 text-slate-200 relative print:bg-white">
   {/* Background Pattern: Tiny dots for "Elite" texture */}
   <div className="fixed inset-0 pattern-dots opacity-10 pointer-events-none z-0 print:hidden" />

   {/* Sidebar Component */}
   <div className="print:hidden">
    <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
   </div>

   {/* Main Content Area */}
   <div
    className={cn(
     "transition duration-300 min-h-screen flex flex-col pt-20 relative z-10",
     isSidebarOpen ? "lg:pl-65" : "lg:pl-20",
     "pl-0 print:pl-0",
    )}
   >
    {/* Header Component */}
    <div className="print:hidden">
     <AdminHeader
      onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
      isSidebarOpen={isSidebarOpen}
     />
    </div>

    {/* Page Content */}
    <main className="flex-1 p-4 md:p-8 print:p-0">
     <PageTransition>
      {children}
     </PageTransition>
    </main>

    {/* Simple Footer */}
    <footer className="py-3 md:px-8 border-t border-white/5 text-center text-slate-500 text-xs print:hidden">
     <p suppressHydrationWarning>
      {" "}
      &copy; {new Date().getFullYear()}{" "}
      <span className="text-primary font-bold uppercase font-logo">
       SHERO Technologies
      </span>{" "}
      Admin Panel. Built with precision.
     </p>
    </footer>
   </div>

   {/* Background Decor */}
   <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none print:hidden">
    <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[140px] rounded-full" />
    <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[140px] rounded-full" />
    <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-emerald-500/5 blur-[120px] rounded-full" />
   </div>

   {/* Forced Password Reset Modal */}
   <ChangePasswordModal />
  </div>
 );
}
