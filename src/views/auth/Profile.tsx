"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Hooks
import { useUserOrders } from "@/hooks/queries/useOrders";
import { useMe } from "@/hooks/queries/useProfile";
import { useProfileForm } from "@/hooks/useProfileForm";
import { useVerification } from "@/hooks/useVerification";

// Components
import VerificationBanner from "@/components/profile/VerificationBanner";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import OrderHistory from "@/components/profile/OrderHistory";
import ProfileSettings from "@/components/profile/ProfileSettings";

type Tab = "orders" | "settings";

const Profile = () => {
 const router = useRouter();
 const {
 user,
 logout,
 isAuthenticated,
 isLoading: authLoading,
 updateProfile,
 refreshUser,
 } = useAuth();

 const [activeTab, setActiveTab] = useState<Tab>("orders");
 useMe(isAuthenticated);
 const { data: orders = [], isLoading: ordersLoading } = useUserOrders(
 user?.id || "",
 );
 const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

 const toggleOrderExpansion = (orderId: string) => {
 setExpandedOrder((prev) => (prev === orderId ? null : orderId));
 };
 const { resendingEmail, resendMessage, handleResendVerification } =
 useVerification();
 const { saving, saveMessage, handleSaveProfile } = useProfileForm(
 user,
 updateProfile,
 refreshUser,
 );

 useEffect(() => {
 if (authLoading) return;

 if (!isAuthenticated) {
 router.push("/login");
 }
 }, [authLoading, isAuthenticated, router]);

 const handleLogout = async () => {
 await logout();
 router.push("/");
 };

 if (authLoading) {
 return (
 <div className="min-h-screen pt-32 pb-16 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
 <Loader2 className="w-10 h-10 animate-spin text-brand-secondary-600" />
 </div>
 );
 }

 if (!user) return null;

 return (
 <div className="min-h-screen pt-32 pb-16 bg-slate-50 dark:bg-slate-950">
 <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
 {/* Email Verification Banner */}
 <VerificationBanner
 emailVerified={user.emailVerified}
 resendingEmail={resendingEmail}
 resendMessage={resendMessage}
 onResend={() => handleResendVerification(user.email || "")}
 />

 {/* Mobile Title */}
 <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-6 lg:hidden">
 My Profile
 </h1>

 <div className="grid lg:grid-cols-3 gap-8">
 {/* Sidebar (Responsive) */}
 <ProfileSidebar
 user={user}
 activeTab={activeTab}
 setActiveTab={setActiveTab}
 onLogout={handleLogout}
 />

 {/* Main Content */}
 <div className="lg:col-span-2">
 {activeTab === "orders" && (
 <>
 <div className="mb-8">
 <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
 Order History
 </h1>
 <p className="text-slate-500 dark:text-slate-400">
 Track and manage your recent purchases
 </p>
 </div>

 <OrderHistory
 orders={orders}
 loading={ordersLoading}
 user={user}
 expandedOrder={expandedOrder}
 onToggleExpand={toggleOrderExpansion}
 />
 </>
 )}

 {activeTab === "settings" && (
 <>
 <div className="mb-8">
 <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
 Account Settings
 </h1>
 <p className="text-slate-500 dark:text-slate-400">
 Update your profile and shipping address
 </p>
 </div>

 <ProfileSettings
 user={user}
 saving={saving}
 saveMessage={saveMessage}
 onSubmit={handleSaveProfile}
 />
 </>
 )}
 </div>
 </div>
 </div>
 </div>
 );
};

export default Profile;
