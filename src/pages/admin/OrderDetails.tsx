import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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

        {/* Printable Document (using Portal to ensure it's a direct child of body) */}
        {order &&
          createPortal(
            <div className="hidden print:block fixed inset-0 bg-white text-black p-0 m-0 z-[9999999] print-area">
              <style>
                {`
              @media print {
                @page { 
                  margin: 0; 
                  size: auto; 
                }
                html, body {
                  margin: 0 !important;
                  padding: 0 !important;
                  height: auto !important;
                  overflow: visible !important;
                }
                /* Hide everything */
                body > * {
                  display: none !important;
                }
                /* Except THE print area */
                body > .print-area {
                  display: block !important;
                  position: absolute !important;
                  top: 0 !important;
                  left: 0 !important;
                  width: 100% !important;
                  height: auto !important;
                  min-height: 100% !important;
                  background: white !important;
                }
                .print-document {
                  width: 100% !important;
                  max-width: none !important;
                  margin: 0 !important;
                  padding: 40px !important;
                  background: white !important;
                  page-break-after: avoid !important;
                  page-break-before: avoid !important;
                  break-inside: avoid !important;
                }
              }
            `}
              </style>

              {printMode === "invoice" ? (
                /* MODERN MINIMALIST INVOICE */
                <div
                  className="max-w-4xl mx-auto bg-white text-black font-sans print-document"
                  style={{ padding: "48px" }}
                >
                  <div className="flex justify-between items-start mb-12">
                    <div>
                      <img src={logoFull} alt="SHERO" className="h-10 mb-6" />
                      <div className="space-y-1">
                        <h2 className="text-lg font-bold font-sora text-slate-900">
                          SHERO Technologies
                        </h2>
                        <div className="text-[11px] text-slate-500 leading-relaxed uppercase tracking-wider">
                          <p>Accra Digital Centre, Block A</p>
                          <p>Accra, Ghana</p>
                          <p>TIN: GHA-12345678-9</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <h1 className="text-4xl font-bold font-sora text-emerald-600 uppercase tracking-tight mb-4">
                        Invoice
                      </h1>
                      <div className="space-y-1.5 text-xs">
                        <p className="text-slate-500 uppercase tracking-widest font-bold text-[9px]">
                          Invoice Number
                        </p>
                        <p className="font-mono font-bold text-sm">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <div className="pt-2">
                          <p className="text-slate-500 uppercase tracking-widest font-bold text-[9px]">
                            Date Issued
                          </p>
                          <p className="font-medium">
                            {new Date(order.createdAt).toLocaleDateString(
                              "en-GB",
                              {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-16 mb-12 py-8 border-y border-slate-100">
                    <div>
                      <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-4">
                        Client Information
                      </h3>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900 font-sora">
                          {order.shippingInfo.firstName}{" "}
                          {order.shippingInfo.lastName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {order.shippingInfo.email}
                        </p>
                        <p className="text-xs text-slate-500">
                          {order.shippingInfo.phone}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-4">
                        Shipping Address
                      </h3>
                      <div className="space-y-1">
                        <p className="text-xs text-slate-900 font-medium">
                          {order.shippingInfo.address}
                        </p>
                        <p className="text-xs text-slate-500">
                          {order.shippingInfo.city}, {order.shippingInfo.region}
                        </p>
                        <div className="pt-2">
                          <span className="text-[9px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600 uppercase">
                            Standard Delivery
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-12">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-slate-900">
                          <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Item Details
                          </th>
                          <th className="pb-4 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 w-24">
                            Quantity
                          </th>
                          <th className="pb-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400 w-32">
                            Rate
                          </th>
                          <th className="pb-4 text-right text-[10px] font-bold uppercase tracking-widest text-slate-400 w-32">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {order.items.map((item) => (
                          <tr key={item.id}>
                            <td className="py-5">
                              <p className="font-bold text-slate-900 font-sora text-sm">
                                {item.name}
                              </p>
                              {item.sku && (
                                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">
                                  SKU: {item.sku}
                                </p>
                              )}
                            </td>
                            <td className="py-5 text-center text-sm font-medium text-slate-600">
                              {item.quantity}
                            </td>
                            <td className="py-5 text-right text-sm text-slate-600">
                              GH₵{item.price.toLocaleString()}
                            </td>
                            <td className="py-5 text-right text-sm font-bold text-slate-900 font-sora">
                              GH₵{(item.price * item.quantity).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-start pt-8 border-t border-slate-900">
                    <div className="max-w-xs space-y-6">
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                          Payment Info
                        </h4>
                        <p className="text-sm font-bold text-emerald-600 font-sora">
                          {formatPaymentMethod(
                            order.paymentMethod,
                          ).toUpperCase()}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 italic uppercase">
                          {order.status === "completed"
                            ? "Paid in full"
                            : "Payment Pending"}
                        </p>
                      </div>
                      <div className="pt-8">
                        <div className="w-48 h-px bg-slate-200 mb-2" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Authorized Signatory
                        </p>
                      </div>
                    </div>

                    <div className="w-64 space-y-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 uppercase tracking-wider">
                          Subtotal
                        </span>
                        <span className="font-medium">
                          GH₵{order.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 uppercase tracking-wider">
                          Discount
                        </span>
                        <span className="text-emerald-500 font-medium">
                          - GH₵0.00
                        </span>
                      </div>
                      <div className="flex justify-between text-xs pb-3">
                        <span className="text-slate-400 uppercase tracking-wider">
                          Tax (VAT 0%)
                        </span>
                        <span className="font-medium">GH₵0.00</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t-2 border-slate-900">
                        <span className="text-xs font-bold font-sora uppercase tracking-widest">
                          Total Amount
                        </span>
                        <span className="text-2xl font-bold font-sora text-emerald-600">
                          GH₵{order.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-20 text-center">
                    <div className="inline-block px-10 py-3 border border-slate-100 rounded text-[10px] text-slate-400 uppercase tracking-[0.4em]">
                      Thank you for your business
                    </div>
                  </div>
                </div>
              ) : (
                /* MODERN MINIMALIST RECEIPT */
                <div
                  className="max-w-sm mx-auto bg-white text-black font-sans print-document"
                  style={{ padding: "40px" }}
                >
                  {/* Receipt Header */}
                  <div className="text-center mb-10 border-b-2 border-slate-900 pb-8">
                    <img
                      src={logoFull}
                      alt="SHERO"
                      className="h-8 mx-auto mb-4"
                    />
                    <h1 className="text-xl font-bold font-sora uppercase tracking-widest text-slate-900">
                      Transaction Receipt
                    </h1>
                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] mt-1 italic">
                      Verified Official Copy
                    </p>
                  </div>

                  {/* Transaction Highlight */}
                  <div className="mb-10 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Total Amount Paid
                    </p>
                    <p className="text-5xl font-bold font-sora text-emerald-600">
                      GH₵{order.total.toLocaleString()}
                    </p>
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded text-[9px] font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Payment Successful
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="space-y-4 mb-10 border-y border-dashed border-slate-200 py-6">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                        Reference No.
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        #{order.id.slice(0, 10).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                        Date & Time
                      </span>
                      <span className="font-medium text-slate-700">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                        Customer
                      </span>
                      <span className="font-bold text-slate-900 uppercase">
                        {order.shippingInfo.firstName}{" "}
                        {order.shippingInfo.lastName}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                        Payment Method
                      </span>
                      <span className="font-bold text-emerald-600 uppercase italic">
                        {formatPaymentMethod(order.paymentMethod)}
                      </span>
                    </div>
                  </div>

                  {/* Quality Guarantee */}
                  <div className="bg-slate-50 rounded p-4 mb-10 text-center">
                    <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-1">
                      Authentic Product Guarantee
                    </p>
                    <p className="text-[9px] text-slate-500 leading-tight">
                      All products sold by SHERO Technologies are verified for
                      quality and authenticity.
                    </p>
                  </div>

                  {/* Receipt Footer */}
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-slate-900 uppercase tracking-widest mb-1">
                      SHERO Technologies
                    </p>
                    <p className="text-[9px] text-slate-500">
                      www.sherotech.com • support@sherotech.com
                    </p>
                    <div className="mt-6 pt-4 border-t border-slate-50">
                      <p className="text-[8px] text-slate-300 italic">
                        This receipt is proof of purchase for your warranty.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>,
            document.body,
          )}
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
