"use client";
import React from "react";
import { Package, Settings, LogOut, BadgeCheck } from "lucide-react";
import type { User } from "@/services/api";

type Tab = "orders" | "settings";

interface ProfileSidebarProps {
 user: User;
 activeTab: Tab;
 setActiveTab: (tab: Tab) => void;
 onLogout: () => void;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
 user,
 activeTab,
 setActiveTab,
 onLogout,
}) => {
 return (
 <>
 {/* Mobile Header & Tabs (Visible < lg) */}
 <div className="lg:hidden mb-8 space-y-6">
 <div className="bg-white dark:bg-slate-900 rounded shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-4">
 <div className="w-10 h-10 rounded font-bold bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-xl text-white shrink-0 shadow">
 {user.name.charAt(0)}
 </div>
 <div className="min-w-0">
 <h2 className="font-bold text-base text-slate-900 dark:text-white truncate">
 {user.name}
 </h2>
 <p className="text-sm text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
 {user.email}
 {user.emailVerified && (
 <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300 fill-emerald-500/50" />
 )}
 </p>
 </div>
 </div>

 <div className="space-y-4">
 <div className="bg-white dark:bg-slate-900 p-1 rounded border border-slate-200 dark:border-slate-800 flex shadow-sm">
 <button
 onClick={() => setActiveTab("orders")}
 className={`flex-1 flex items-center justify-center gap-2 py-2 rounded font-bold text-sm transition ${
 activeTab === "orders"
 ? "bg-emerald-600 text-white shadow shadow-emerald-500/20"
 : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
 }`}
 >
 <Package className="w-4 h-4" />
 Orders
 </button>
 <button
 onClick={() => setActiveTab("settings")}
 className={`flex-1 flex items-center justify-center gap-2 py-2 rounded font-bold text-sm transition ${
 activeTab === "settings"
 ? "bg-emerald-600 text-white shadow shadow-emerald-500/20"
 : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
 }`}
 >
 <Settings className="w-4 h-4" />
 Settings
 </button>
 </div>

 <div className="flex justify-end">
 <button
 onClick={onLogout}
 className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
 >
 <LogOut className="w-3.5 h-3.5" />
 Sign Out
 </button>
 </div>
 </div>
 </div>

 {/* Desktop Sidebar (Visible >= lg) */}
 <div className="hidden lg:block lg:col-span-1">
 <div className="bg-white dark:bg-slate-900 rounded shadow border border-slate-200 dark:border-slate-800 p-6 sticky top-24">
 <div className="flex items-center gap-4 mb-6">
 <div className="w-16 h-16 rounded font-bold bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-3xl text-white shrink-0 shadow">
 {user.name.charAt(0)}
 </div>
 <div>
 <h2 className="font-bold text-slate-900 dark:text-white line-clamp-1">
 {user.name}
 </h2>
 <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 flex items-center gap-1">
 {user.email}
 {user.emailVerified && (
 <BadgeCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-300 fill-emerald-500/40" />
 )}
 </p>
 </div>
 </div>

 <div className="space-y-1">
 <button
 onClick={() => setActiveTab("orders")}
 className={`cursor-pointer w-full flex items-center gap-3 px-4 py-2 rounded font-medium transition-colors ${
 activeTab === "orders"
 ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
 : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
 }`}
 >
 <Package className="w-5 h-5" />
 My Orders
 </button>
 <button
 onClick={() => setActiveTab("settings")}
 className={`cursor-pointer w-full flex items-center gap-3 px-4 py-2 rounded font-medium transition-colors ${
 activeTab === "settings"
 ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
 : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
 }`}
 >
 <Settings className="w-5 h-5" />
 Account Settings
 </button>
 <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
 <button
 onClick={onLogout}
 className="cursor-pointer w-full flex items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded font-medium transition-colors"
 >
 <LogOut className="w-5 h-5" />
 Sign Out
 </button>
 </div>
 </div>
 </div>
 </div>
 </>
 );
};

export default ProfileSidebar;
