import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  fetchOrderById,
  updateOrderStatus,
  type Order,
  getImageUrl,
} from "@/services/api";
import logoFull from "@/assets/logo/shero-full.svg";
import {
  ArrowLeft,
  Clock,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Hash,
  ShoppingBag,
  ExternalLink,
  Printer,
  Loader2,
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [printMode, setPrintMode] = useState<"invoice" | "receipt">("invoice");

  useEffect(() => {
    async function loadOrder() {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await fetchOrderById(id);
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadOrder();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return;
    try {
      setIsUpdating(true);
      await updateOrderStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      alert(
        "Failed to update status: " +
          (err instanceof Error ? err.message : "Unknown error"),
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePrint = (type: "invoice" | "receipt") => {
    setPrintMode(type);
    // Use a small timeout to ensure state is updated before printing
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return { color: "text-amber-400 bg-amber-500/10", icon: Clock };
      case "processing":
        return { color: "text-blue-400 bg-blue-500/10", icon: Truck };
      case "shipped":
        return { color: "text-purple-400 bg-purple-500/10", icon: Truck };
      case "delivered":
        return {
          color: "text-emerald-400 bg-emerald-500/10",
          icon: CheckCircle2,
        };
      case "cancelled":
        return { color: "text-rose-400 bg-rose-500/10", icon: XCircle };
      default:
        return { color: "text-slate-400 bg-slate-500/10", icon: Clock };
    }
  };

  const formatPaymentMethod = (method: string) => {
    switch (method.toLowerCase()) {
      case "mobile_money":
      case "momo":
        return "MoMo";
      case "card":
      case "credit_card":
        return "Card";
      case "cash":
        return "Cash";
      default:
        return method.replace(/_/g, " ");
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <p className="text-slate-500 font-medium">
            Fetching order details...
          </p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !order) {
    return (
      <AdminLayout>
        <div className="max-w-2xl mx-auto py-12 text-center space-y-6">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Order Not Found</h1>
          <p className="text-slate-400">
            {error ||
              "The order you are looking for does not exist or has been removed."}
          </p>
          <Button
            onClick={() => navigate("/admin/orders")}
            variant="outline"
            className="text-white border-white/10 hover:bg-white/5"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const statusConfig = getStatusConfig(order.status);

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-20">
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-white">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-white/5"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
                <Hash className="w-3 h-3" />
                <span>{order.id}</span>
              </div>
              <h1 className="text-2xl font-bold font-sora">Order Details</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-white/10 text-white hover:bg-white/5"
                >
                  <Printer className="w-4 h-4 mr-2" /> Print Order
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-slate-900 border-white/10 text-white w-48"
              >
                <DropdownMenuItem
                  onClick={() => handlePrint("invoice")}
                  className="cursor-pointer hover:bg-white/5"
                >
                  <Printer className="w-4 h-4 mr-2 text-emerald-400" /> Print
                  Invoice
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handlePrint("receipt")}
                  className="cursor-pointer hover:bg-white/5"
                >
                  <Printer className="w-4 h-4 mr-2 text-blue-400" /> Print
                  Receipt
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  Update Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-slate-900 border-white/10 text-white w-48"
              >
                <DropdownMenuItem
                  onClick={() => handleUpdateStatus("processing")}
                  className="cursor-pointer hover:bg-white/5"
                >
                  <Truck className="w-4 h-4 mr-2 text-blue-400" /> Processing
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleUpdateStatus("shipped")}
                  className="cursor-pointer hover:bg-white/5"
                >
                  <Truck className="w-4 h-4 mr-2 text-purple-400" /> Shipped
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleUpdateStatus("delivered")}
                  className="cursor-pointer hover:bg-white/5"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />{" "}
                  Delivered
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem
                  onClick={() => handleUpdateStatus("cancelled")}
                  className="cursor-pointer text-rose-400 focus:text-rose-400 focus:bg-rose-500/10"
                >
                  <XCircle className="w-4 h-4 mr-2" /> Cancelled
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content: Items & Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-slate-900 border-white/5 overflow-hidden">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                  Order Items
                </h2>
                <Badge
                  className={cn(
                    "text-[11px] font-bold uppercase",
                    statusConfig.color,
                  )}
                >
                  {order.status}
                </Badge>
              </div>
              <div className="divide-y divide-white/5">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 flex items-center gap-6 group"
                  >
                    <div className="w-20 h-20 rounded bg-slate-800 border border-white/5 overflow-hidden shrink-0">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold truncate group-hover:text-emerald-400 transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">
                        GH₵{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        GH₵{item.price.toLocaleString()} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 bg-slate-950/50 border-t border-white/5">
                <div className="space-y-3 max-w-xs ml-auto">
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Subtotal</span>
                    <span>GH₵{order.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-400">
                    <span>Shipping</span>
                    <span className="text-emerald-400">Free</span>
                  </div>
                  <div className="py-2 border-t border-white/5 flex justify-between">
                    <span className="text-white font-bold">Total</span>
                    <span className="text-xl font-bold text-emerald-400">
                      GH₵{order.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-slate-900 border-white/5 p-6 space-y-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  Payment Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">Method</p>
                    <Badge
                      variant="outline"
                      className="border-white/10 text-slate-300"
                    >
                      {formatPaymentMethod(order.paymentMethod)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">Status</p>
                    <span className="text-sm font-bold text-emerald-400">
                      Paid
                    </span>
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-900 border-white/5 p-6 space-y-4">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-400" />
                  Timeline
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">Created</p>
                    <p className="text-sm text-slate-300">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">Updated</p>
                    <p className="text-sm text-slate-300">
                      {new Date().toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Sidebar: Customer Info */}
          <div className="space-y-6">
            <Card className="bg-slate-900 border-white/5 p-6 space-y-6">
              <h3 className="text-white font-bold flex items-center gap-2 border-b border-white/5 pb-4">
                <Package className="w-5 h-5 text-amber-400" />
                Customer Details
              </h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center shrink-0 border border-white/5">
                    <Hash className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">
                      {order.shippingInfo.firstName}{" "}
                      {order.shippingInfo.lastName}
                    </h4>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mt-0.5">
                      Customer Name
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-slate-300 group">
                    <Mail className="w-4 h-4 text-slate-500 shrink-0 group-hover:text-emerald-400 transition-colors" />
                    <span className="truncate">{order.shippingInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-300 group">
                    <Phone className="w-4 h-4 text-slate-500 shrink-0 group-hover:text-emerald-400 transition-colors" />
                    <span>{order.shippingInfo.phone}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900 border-white/5 p-6 space-y-6">
              <h3 className="text-white font-bold flex items-center gap-2 border-b border-white/5 pb-4">
                <MapPin className="w-5 h-5 text-rose-400" />
                Shipping Address
              </h3>

              <div className="space-y-4">
                <p className="text-sm text-slate-300 leading-relaxed">
                  {order.shippingInfo.address}
                  <br />
                  {order.shippingInfo.city}, {order.shippingInfo.region}
                  <br />
                  {order.shippingInfo.postalCode &&
                    `Postal Code: ${order.shippingInfo.postalCode}`}
                </p>
                <Link
                  to={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.shippingInfo.address}, ${order.shippingInfo.city}, ${order.shippingInfo.region}`)}`}
                  target="_blank"
                  className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-bold uppercase tracking-wider"
                >
                  View on Maps <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Printable Document (Hidden by default) */}
        <div className="hidden print:block absolute inset-0 bg-white text-black p-0 m-0 z-[9999] print-area">
          <style>
            {`
              @media print {
                @page { 
                  margin: 0; 
                  size: A4; 
                }
                body {
                  margin: 0 !important;
                  padding: 0 !important;
                }
                body * {
                  visibility: hidden !important;
                }
                .print-area,
                .print-area * {
                  visibility: visible !important;
                }
                .print-area {
                  position: fixed !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  height: auto !important;
                  background: white !important;
                  z-index: 99999 !important;
                }
                .print-document {
                  min-height: auto !important;
                  height: auto !important;
                }
              }
            `}
          </style>

          {printMode === "invoice" ? (
            /* PREMIUM INVOICE LAYOUT */
            <div
              className="max-w-4xl mx-auto bg-white text-black print-document"
              style={{ padding: "40px" }}
            >
              {/* Header with gradient accent */}
              <div className="relative mb-8">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
                <div className="flex justify-between items-start pt-6">
                  <div>
                    <img src={logoFull} alt="SHERO" className="h-12 mb-4" />
                    <div className="text-[10px] text-slate-600 space-y-0.5">
                      <p className="font-bold text-slate-900">
                        SHERO Technologies Ltd.
                      </p>
                      <p>Accra Digital Centre, Block A</p>
                      <p>Accra, Greater Accra Region, Ghana</p>
                      <p>TIN: GHA-12345678-9</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent uppercase tracking-tight">
                      Invoice
                    </h1>
                    <div className="mt-4 space-y-1 text-[11px]">
                      <div className="flex justify-end gap-4">
                        <span className="text-slate-400 uppercase tracking-wider">
                          Invoice No.
                        </span>
                        <span className="font-bold font-mono text-slate-900">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-end gap-4">
                        <span className="text-slate-400 uppercase tracking-wider">
                          Date
                        </span>
                        <span className="font-medium text-slate-700">
                          {new Date(order.createdAt).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <div className="flex justify-end gap-4">
                        <span className="text-slate-400 uppercase tracking-wider">
                          Status
                        </span>
                        <span className="font-bold text-emerald-600 uppercase">
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bill To / Ship To */}
              <div className="grid grid-cols-2 gap-8 mb-8 p-6 bg-slate-50 rounded-lg">
                <div>
                  <h3 className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">
                    Bill To
                  </h3>
                  <p className="font-bold text-slate-900">
                    {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {order.shippingInfo.email}
                  </p>
                  <p className="text-xs text-slate-600">
                    {order.shippingInfo.phone}
                  </p>
                </div>
                <div>
                  <h3 className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-3">
                    Ship To
                  </h3>
                  <p className="text-xs text-slate-900 font-medium">
                    {order.shippingInfo.address}
                  </p>
                  <p className="text-xs text-slate-600">
                    {order.shippingInfo.city}, {order.shippingInfo.region}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Standard Delivery
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-900">
                      <th className="py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-600 w-12">
                        #
                      </th>
                      <th className="py-3 text-left text-[10px] font-black uppercase tracking-wider text-slate-600">
                        Description
                      </th>
                      <th className="py-3 text-center text-[10px] font-black uppercase tracking-wider text-slate-600 w-20">
                        Qty
                      </th>
                      <th className="py-3 text-right text-[10px] font-black uppercase tracking-wider text-slate-600 w-28">
                        Price
                      </th>
                      <th className="py-3 text-right text-[10px] font-black uppercase tracking-wider text-slate-600 w-28">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={item.id} className="border-b border-slate-100">
                        <td className="py-4 text-xs text-slate-400 font-mono">
                          {String(index + 1).padStart(2, "0")}
                        </td>
                        <td className="py-4">
                          <p className="text-sm font-semibold text-slate-900">
                            {item.name}
                          </p>
                          {item.sku && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              SKU: {item.sku}
                            </p>
                          )}
                        </td>
                        <td className="py-4 text-xs text-center font-medium text-slate-700">
                          {item.quantity}
                        </td>
                        <td className="py-4 text-xs text-right text-slate-600">
                          GH₵{item.price.toLocaleString()}
                        </td>
                        <td className="py-4 text-sm text-right font-bold text-slate-900">
                          GH₵{(item.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer with Totals */}
              <div className="flex justify-between items-end">
                <div className="space-y-4 max-w-xs">
                  <div>
                    <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">
                      Payment Method
                    </h4>
                    <p className="text-sm font-bold text-slate-900">
                      {formatPaymentMethod(order.paymentMethod)}
                    </p>
                  </div>
                  <div className="pt-6">
                    <p className="text-[9px] text-slate-400 uppercase tracking-wider mb-6">
                      Authorized Signature
                    </p>
                    <div className="w-40 border-b border-slate-300" />
                  </div>
                </div>

                <div className="w-72">
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-lg">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-400">Subtotal</span>
                      <span>GH₵{order.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-400">Tax (VAT 0%)</span>
                      <span>GH₵0.00</span>
                    </div>
                    <div className="flex justify-between text-xs mb-3">
                      <span className="text-slate-400">Shipping</span>
                      <span className="text-emerald-400">FREE</span>
                    </div>
                    <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
                      <span className="text-sm font-medium">Total Due</span>
                      <span className="text-2xl font-black">
                        GH₵{order.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="mt-10 pt-6 border-t border-slate-100 text-center">
                <p className="text-[10px] text-slate-400">
                  Thank you for choosing SHERO Technologies
                </p>
                <p className="text-[9px] text-slate-300 mt-1">
                  support@sherotech.com • www.sherotech.com
                </p>
              </div>
            </div>
          ) : (
            /* PREMIUM RECEIPT LAYOUT */
            <div
              className="max-w-sm mx-auto bg-white text-black print-document"
              style={{ padding: "40px" }}
            >
              {/* Top Gradient Bar */}
              <div
                className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 -mx-10 -mt-10 mb-8"
                style={{
                  marginLeft: "-40px",
                  marginRight: "-40px",
                  marginTop: "-40px",
                }}
              />

              {/* Header */}
              <div className="text-center mb-8">
                <img src={logoFull} alt="SHERO" className="h-10 mx-auto mb-4" />
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4" />
                  Payment Receipt
                </div>
              </div>

              {/* Reference & Date */}
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                    Reference
                  </span>
                  <span className="font-mono text-sm font-black text-slate-900">
                    #{order.id.slice(0, 10).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                    Date
                  </span>
                  <span className="text-xs font-medium text-slate-700">
                    {new Date(order.createdAt).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {/* Customer */}
              <div className="mb-6">
                <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold mb-2">
                  Customer
                </p>
                <p className="font-bold text-slate-900">
                  {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                </p>
                <p className="text-xs text-slate-500">
                  {order.shippingInfo.email}
                </p>
              </div>

              {/* Amount Box */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-center text-white mb-6">
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-2">
                  Amount Paid
                </p>
                <p className="text-4xl font-black">
                  GH₵{order.total.toLocaleString()}
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold uppercase">
                    {formatPaymentMethod(order.paymentMethod)}
                  </span>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold uppercase">
                    Verified
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-center gap-3 py-4 border-y border-slate-100 mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-900">
                    Transaction Complete
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Secure payment processed successfully
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  SHERO Technologies
                </p>
                <p className="text-[9px] text-slate-400 mt-1">
                  www.sherotech.com • support@sherotech.com
                </p>
                <p className="text-[8px] text-slate-300 mt-3 italic">
                  Please retain this receipt for your records
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function Card({
  children,
  className,
  ...props
}: { children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded border", className)} {...props}>
      {children}
    </div>
  );
}
