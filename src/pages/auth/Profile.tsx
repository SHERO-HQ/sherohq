import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getUserOrders,
  resendVerificationEmail,
  type Order,
  type ShippingAddress,
} from "@/services/api";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Clock,
  LogOut,
  ShoppingBag,
  MapPin,
  Loader2,
  User,
  Settings,
  AlertCircle,
  Mail,
  CheckCircle,
  Send,
} from "lucide-react";

type Tab = "orders" | "settings";

const Profile = () => {
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
  const navigate = useNavigate();

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
    } catch (err: any) {
      setResendMessage(err.message || "Failed to send email");
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage("");

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
    } catch (err: any) {
      setSaveMessage(err.message || "Failed to update profile");
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
              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded transition-colors disabled:opacity-50"
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 lg:hidden font-sora">
          My Profile
        </h1>

        {/* Mobile Header & Tabs (Visible < lg) */}
        <div className="lg:hidden mb-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-2xl font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-lg text-slate-900 dark:text-white truncate">
                {user.name}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
                {user.email}
                {user.emailVerified && (
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl font-medium text-xs sm:text-sm transition-all border ${
                activeTab === "orders"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50"
              }`}
            >
              <Package className="w-5 h-5" />
              <span>Orders</span>
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl font-medium text-xs sm:text-sm transition-all border ${
                activeTab === "settings"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl font-medium text-xs sm:text-sm transition-all border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar (Visible >= lg) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 rounded shadow border border-slate-200 dark:border-slate-800 p-6 sticky top-24">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                    {user.name}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 flex items-center gap-1">
                    {user.email}
                    {user.emailVerified && (
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded font-medium transition-colors ${
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
                  className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 rounded font-medium transition-colors ${
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
                    className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded font-medium transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
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

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p>Loading your orders...</p>
                  </div>
                ) : orders.length === 0 ? (
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
                      className="cursor-pointer px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded transition-colors"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 overflow-hidden"
                      >
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800">
                          <div className="flex flex-wrap gap-8">
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Order ID
                              </p>
                              <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                                #{order.id.slice(0, 8)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Date Placed
                              </p>
                              <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1">
                                <Clock className="w-4 h-4 text-emerald-500" />
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                Total Amount
                              </p>
                              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                GH₵{order.total.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div
                            className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize ${
                              order.status === "delivered"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : order.status === "pending"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}
                          >
                            {order.status}
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="space-y-4 mb-6">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-4"
                              >
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-xl shrink-0">
                                  {item.image}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                                    {item.name}
                                  </h4>
                                  <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Qty: {item.quantity}
                                  </p>
                                </div>
                                <p className="font-bold text-slate-900 dark:text-white">
                                  GH₵{item.price * item.quantity}
                                </p>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                              <MapPin className="w-4 h-4" />
                              <span className="line-clamp-1">
                                {order.shippingInfo.address},{" "}
                                {order.shippingInfo.city}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                          className="w-full px-4 py-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                            className="w-full px-4 py-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
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
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="+233 XX XXX XXXX"
                          className="w-full px-4 py-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
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
                          className="w-full px-4 py-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                          className="w-full px-4 py-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                          className="w-full px-4 py-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                          className="w-full px-4 py-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                          className="w-full px-4 py-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                          className="w-full px-4 py-3 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                      className="cursor-pointer ml-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded transition-colors disabled:opacity-50 flex items-center gap-2"
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
