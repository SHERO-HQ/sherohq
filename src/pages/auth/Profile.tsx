import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTitle } from "@/hooks/useTitle";
import {
  getUserOrders,
  resendVerificationEmail,
  type Order,
  type ShippingAddress,
} from "@/services/api";
import { useNavigate } from "react-router-dom";
import {
  Package,
  LogOut,
  ShoppingBag,
  MapPin,
  Loader2,
  User,
  Settings,
  AlertCircle,
  Mail,
  Send,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  Phone,
  CreditCard,
} from "lucide-react";

type Tab = "orders" | "settings";

const Profile = () => {
  useTitle("My Account");
  const {
    user,
    logout,
    isAuthenticated,
    isLoading: authLoading,
    updateProfile,
    refreshUser,
  } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const navigate = useNavigate();

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Profile form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    region: "",
    postalCode: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.id) {
      loadOrders(user.id);
      // Initialize form with user data
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        firstName: user.shippingAddress?.firstName || "",
        lastName: user.shippingAddress?.lastName || "",
        address: user.shippingAddress?.address || "",
        city: user.shippingAddress?.city || "",
        region: user.shippingAddress?.region || "",
        postalCode: user.shippingAddress?.postalCode || "",
      });
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  const loadOrders = async (userId: string) => {
    try {
      const data = await getUserOrders(userId);
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;
    setResendingEmail(true);
    setResendMessage("");
    try {
      await resendVerificationEmail(user.email);
      setResendMessage("Verification email sent! Check your inbox.");
    } catch (err: unknown) {
      setResendMessage(
        err instanceof Error ? err.message : "Failed to send email",
      );
    } finally {
      setResendingEmail(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "pending":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  const renderOrdersContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mb-4" />
          <p>Loading your orders...</p>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            No orders yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Looks like you haven't made any purchases yet.
          </p>
          <button
            onClick={() => navigate("/products")}
            className="cursor-pointer px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded transition-colors"
          >
            Start Shopping
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => {
          const isExpanded = expandedOrder === order.id;

          return (
            <div
              key={order.id}
              className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              {/* Order Header (Clickable) */}
              <button
                onClick={() => toggleOrderExpansion(order.id)}
                className="w-full text-left p-6 flex flex-wrap items-center justify-between gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
              >
                <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                  <div>
                    <p className="text-[10px] font-bold font-sora text-slate-500 uppercase tracking-wider">
                      Order ID
                    </p>
                    <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                      #{order.id.slice(0, 8)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold font-sora text-slate-500 uppercase tracking-wider">
                      Date
                    </p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold font-sora text-slate-500 uppercase tracking-wider">
                      Total
                    </p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      GH₵{order.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div
                    className={`px-3 py-1 rounded text-xs font-bold capitalize ${getStatusBadgeColor(
                      order.status,
                    )}`}
                  >
                    {order.status}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expandable Content */}
              {isExpanded && (
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Items List */}
                  <div className="space-y-4 mb-8">
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                      Items in Order
                    </h5>
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col md:flex-row md:items-center gap-4 bg-slate-50 dark:bg-slate-800/30 p-3 rounded"
                      >
                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xl shrink-0">
                          {item.image}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                            {item.name}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            GH₵{item.price.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">
                          GH₵{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Details Grid */}
                  <div className="grid md:grid-cols-2 gap-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" />
                        Shipping Address
                      </h5>
                      <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                        <p className="font-bold text-slate-900 dark:text-white">
                          {order.shippingInfo.firstName}{" "}
                          {order.shippingInfo.lastName}
                        </p>
                        <p>{order.shippingInfo.address}</p>
                        <p>
                          {order.shippingInfo.city}, {order.shippingInfo.region}
                        </p>
                        <p>{order.shippingInfo.postalCode}</p>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5" />
                        Contact & Payment
                      </h5>
                      <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{order.shippingInfo.phone || "No phone"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{user?.email}</span>
                        </div>
                        <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-900/10 rounded text-emerald-700 dark:text-emerald-400 text-xs font-medium inline-block">
                          Paid via Mobile Money / Card
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage("");

    // Validate phone number if provided
    if (formData.phone) {
      const ghanaPhoneRegex = /^0[25]\d{8}$/;
      // Remove spaces for validation check
      const cleanPhone = formData.phone.replaceAll(/\s+/g, "");
      if (!ghanaPhoneRegex.test(cleanPhone)) {
        setPhoneError(
          "Please enter a valid Ghana phone number (e.g., 0244123456 or 0501234567)",
        );
        setSaving(false);
        return;
      }
    }

    try {
      const shippingAddress: ShippingAddress | undefined = formData.address
        ? {
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            city: formData.city,
            region: formData.region,
            postalCode: formData.postalCode,
          }
        : undefined;

      await updateProfile({
        name: formData.name,
        phone: formData.phone || undefined,
        shippingAddress,
      });

      setSaveMessage("Profile updated successfully!");
      await refreshUser();
    } catch (err: unknown) {
      setSaveMessage(
        err instanceof Error ? err.message : "Failed to update profile",
      );
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen pt-32 pb-16 bg-slate-50 dark:bg-slate-950">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Email Verification Banner */}
        {user.emailVerified === false && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <div>
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Please verify your email address
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Check your inbox for a verification link.
                </p>
              </div>
            </div>
            <button
              onClick={handleResendVerification}
              disabled={resendingEmail}
              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded transition-colors disabled:opacity-50"
            >
              {resendingEmail ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Resend Email
            </button>
            {resendMessage && (
              <p className="w-full text-sm text-amber-700 dark:text-amber-300 mt-2">
                {resendMessage}
              </p>
            )}
          </div>
        )}

        {/* Mobile Title */}
        <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-6 lg:hidden font-sora">
          My Profile
        </h1>

        {/* Mobile Header & Tabs (Visible < lg) */}
        <div className="lg:hidden mb-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-xl font-bold text-white shrink-0 shadow-lg border border-white/10">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-base text-slate-900 dark:text-white truncate">
                {user.name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
                {user.email}
                {user.emailVerified && (
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-300  fill-emerald-500/50" />
                )}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-1 rounded border border-slate-200 dark:border-slate-800 flex shadow-sm">
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded font-bold text-sm transition-all ${
                  activeTab === "orders"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <Package className="w-4 h-4" />
                Orders
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded font-bold text-sm transition-all ${
                  activeTab === "settings"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Desktop Sidebar (Visible >= lg) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded shadow border border-slate-200 dark:border-slate-800 p-6 sticky top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl border border-white/10">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                    {user.name}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 flex items-center gap-1">
                    {user.email}
                    {user.emailVerified && (
                      <BadgeCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-300  fill-emerald-500/40" />
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
                    onClick={handleLogout}
                    className="cursor-pointer w-full flex items-center gap-3 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded font-medium transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === "orders" && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold font-sora text-slate-900 dark:text-white">
                    Order History
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400">
                    Track and manage your recent purchases
                  </p>
                </div>

                {renderOrdersContent()}
              </>
            )}

            {activeTab === "settings" && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold font-sora text-slate-900 dark:text-white">
                    Account Settings
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400">
                    Update your profile and shipping address
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-8">
                  {/* Personal Information */}
                  <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-500" />
                      Personal Information
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="fullName"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >
                          Full Name
                        </label>
                        <input
                          id="fullName"
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            value={user.email}
                            disabled
                            className="w-full px-4 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                          />
                          <Mail className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >
                          Phone Number
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => {
                            setFormData({ ...formData, phone: e.target.value });
                            if (phoneError) setPhoneError("");
                          }}
                          placeholder="024 123 4567"
                          className={`w-full px-4 py-2 rounded border ${
                            phoneError
                              ? "border-red-500 focus:ring-red-500"
                              : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-emerald-500"
                          } text-slate-900 dark:text-white focus:outline-none focus:ring-2`}
                        />
                        {phoneError && (
                          <p className="text-red-500 text-sm mt-1">
                            {phoneError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-emerald-500" />
                      Default Shipping Address
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="firstName"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >
                          First Name
                        </label>
                        <input
                          id="firstName"
                          type="text"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              firstName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="lastName"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >
                          Last Name
                        </label>
                        <input
                          id="lastName"
                          type="text"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lastName: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="streetAddress"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >
                          Street Address
                        </label>
                        <input
                          id="streetAddress"
                          type="text"
                          value={formData.address}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                          placeholder="e.g., 123 Main Street"
                          className="w-full px-4 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >
                          City
                        </label>
                        <input
                          id="city"
                          type="text"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          placeholder="e.g., Accra"
                          className="w-full px-4 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="region"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >
                          Region
                        </label>
                        <select
                          id="region"
                          value={formData.region}
                          onChange={(e) =>
                            setFormData({ ...formData, region: e.target.value })
                          }
                          className="w-full px-4 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                        >
                          <option value="">Select Region</option>
                          <option value="Greater Accra">Greater Accra</option>
                          <option value="Ashanti">Ashanti</option>
                          <option value="Western">Western</option>
                          <option value="Eastern">Eastern</option>
                          <option value="Central">Central</option>
                          <option value="Volta">Volta</option>
                          <option value="Northern">Northern</option>
                          <option value="Upper East">Upper East</option>
                          <option value="Upper West">Upper West</option>
                          <option value="Bono">Bono</option>
                          <option value="Bono East">Bono East</option>
                          <option value="Ahafo">Ahafo</option>
                          <option value="Oti">Oti</option>
                          <option value="Savannah">Savannah</option>
                          <option value="North East">North East</option>
                          <option value="Western North">Western North</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="postalCode"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >
                          GPS/Postal Code (Optional)
                        </label>
                        <input
                          id="postalCode"
                          type="text"
                          value={formData.postalCode}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              postalCode: e.target.value,
                            })
                          }
                          placeholder="e.g., GA-123-4567"
                          className="w-full px-4 py-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex items-center justify-between">
                    {saveMessage && (
                      <p
                        className={`text-sm ${saveMessage.includes("success") ? "text-emerald-600" : "text-red-600"}`}
                      >
                        {saveMessage}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={saving}
                      className="cursor-pointer ml-auto px-8 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                      Save Changes
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
