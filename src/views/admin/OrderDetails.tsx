"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchOrderById,
  updateOrderStatus,
  type Order,
  getImageUrl,
} from "@/services/api";
import { useNotifications } from "@/hooks/useNotifications";

import {
  ArrowLeft,
  Copy,
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
  Printer,
  Loader2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import AppImage from "@/components/common/AppImage";
import { exportToPDF } from "@/utils/exportUtils";
import { toReadableOrderId } from "@/utils/orderId";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { COMPANY_CONTACTS } from "@/constants/contacts";
import { COMPANY_EMAILS } from "@/constants/emails";

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { addNotification } = useNotifications();
  const [printMode, setPrintMode] = useState<
    "invoice" | "receipt80" | "receipt58" | null
  >(null);
  const [receiptQrUrl, setReceiptQrUrl] = useState<string>("");

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

  useEffect(() => {
    let cancelled = false;

    async function buildReceiptQr() {
      if (!order) {
        setReceiptQrUrl("");
        return;
      }

      const payload = {
        orderId: order.id,
        amount: order.total,
        date: order.createdAt,
        customer: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
      };

      try {
        const QRCode = (await import("qrcode")).default;
        const dataUrl = await QRCode.toDataURL(JSON.stringify(payload), {
          width: 180,
          margin: 1,
          color: { dark: "#000000", light: "#ffffff" },
        });

        if (!cancelled) setReceiptQrUrl(dataUrl);
      } catch {
        if (!cancelled) setReceiptQrUrl("");
      }
    }

    void buildReceiptQr();
    return () => {
      cancelled = true;
    };
  }, [order]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return;
    try {
      setIsUpdating(true);
      await updateOrderStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus });
      addNotification(
        "Success",
        `Order status updated to ${newStatus}`,
        "success",
      );
    } catch (err) {
      addNotification(
        "Error",
        "Failed to update status: " +
        (err instanceof Error ? err.message : "Unknown error"),
        "error",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Print actions
  const handlePrint = (type: "invoice" | "receipt80" | "receipt58") => {
    setPrintMode(type);

    // Set specific title for print dialog
    const orderId = order ? toReadableOrderId(order.id) : "ID";
    const typeLabel = type === "invoice" ? "Invoice" : "Receipt";
    const printTitle = `SHERO-${typeLabel}-${orderId}`;

    // Lock the title immediately before opening the dialog
    document.title = printTitle;

    setTimeout(() => {
      globalThis.print();
    }, 200);
  };

  // Effect to force-lock title during printing periods
  useEffect(() => {
    if (!printMode) return;

    const orderId = order ? toReadableOrderId(order.id) : "ID";
    const typeLabel = printMode === "invoice" ? "Invoice" : "Receipt";
    const printTitle = `SHERO-${typeLabel}-${orderId}`;

    // Aggressively force title every 100ms to fight framework overrides during print session
    const interval = setInterval(() => {
      document.title = printTitle;
    }, 100);

    // Restore title on focus (indicating user is back from print dialog)
    const handleFocus = () => {
      clearInterval(interval);
      setPrintMode(null);
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [printMode, order]);

  const handleExportPDF = async () => {
    if (!order) return;
    const orderId = toReadableOrderId(order.id);
    const fileName = `SHERO-Order-${orderId}`;

    const dataToExport = order.items.map((item) => ({
      Item: item.name,
      SKU: item.sku || "-",
      Price: `GH₵ ${item.price.toLocaleString()}`,
      Quantity: item.quantity,
      Total: `GH₵ ${(item.price * item.quantity).toLocaleString()}`,
    }));

    const columns = ["Item", "SKU", "Price", "Quantity", "Total"];
    await exportToPDF(
      dataToExport,
      columns,
      fileName,
      `Order #${orderId} - ${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`,
    );

    addNotification("Success", "PDF Document downloaded", "success");
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
          color: "text-brand-secondary-400 bg-brand-secondary-500/10",
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
        return method.replaceAll("_", " ")[0].toUpperCase() + method.slice(1);
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-brand-secondary-500/10 border border-brand-secondary-500/20 text-brand-secondary-400";
      case "pending":
        return "bg-amber-500/10 border border-amber-500/20 text-amber-400";
      case "processing":
        return "bg-blue-500/10 border border-blue-500/20 text-blue-400";
      case "shipped":
        return "bg-purple-500/10 border border-purple-500/20 text-purple-400";
      default:
        return "bg-rose-500/10 border border-rose-500/20 text-rose-400";
    }
  };

  const OrderDetailsSkeleton = () => (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-pulse select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded bg-white/5 animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 w-20 bg-white/5 rounded" />
            <div className="h-6 w-36 bg-white/10 rounded" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-white/5 rounded" />
          <div className="h-10 w-24 bg-white/5 rounded" />
          <div className="h-10 w-32 bg-white/10 rounded" />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900 border-white/5 p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <div className="h-5 w-32 bg-white/5 rounded" />
              <div className="h-5 w-20 bg-white/5 rounded-full" />
            </div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-6 py-2">
                  <div className="w-20 h-20 bg-white/5 rounded shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 bg-white/10 rounded" />
                    <div className="h-3 w-24 bg-white/5 rounded" />
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-4 w-16 bg-white/10 rounded ml-auto" />
                    <div className="h-3 w-10 bg-white/5 rounded ml-auto" />
                  </div>
                </div>
              ))}
            </div>
            <div className="h-14 bg-white/5 rounded w-full" />
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-900 border-white/5 p-6 space-y-4">
              <div className="h-4 w-32 bg-white/5 rounded" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-28 bg-white/10 rounded" />
                  <div className="h-3 w-36 bg-white/5 rounded" />
                </div>
              </div>
            </Card>
            <Card className="bg-slate-900 border-white/5 p-6 space-y-4">
              <div className="h-4 w-32 bg-white/5 rounded" />
              <div className="space-y-2">
                <div className="h-4 w-48 bg-white/10 rounded" />
                <div className="h-3 w-32 bg-white/5 rounded" />
              </div>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-slate-900 border-white/5 p-6 space-y-6">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-white/5 rounded" />
              <div className="h-10 bg-white/5 rounded" />
            </div>
            <div className="space-y-3 pt-4 border-t border-white/5">
              <div className="h-3 w-24 bg-white/5 rounded" />
              <div className="flex justify-between">
                <div className="h-4 w-12 bg-white/5 rounded" />
                <div className="h-4 w-20 bg-white/10 rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-12 bg-white/5 rounded" />
                <div className="h-4 w-20 bg-white/10 rounded" />
              </div>
            </div>
          </Card>
          <div className="h-24 bg-slate-900/50 rounded border border-white/5 animate-pulse" />
        </div>
      </div>
    </div>
  );

  const isStorePickupOrder =
    (order?.paymentMethod || "").toLowerCase() === "store_pickup";

  const getTrackingUrl = (orderId: string) => {
    const readableOrderId = toReadableOrderId(orderId);
    const fallbackPath = `/track/${encodeURIComponent(readableOrderId)}`;

    const configuredPublicSiteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");

    if (configuredPublicSiteUrl) {
      return `${configuredPublicSiteUrl}${fallbackPath}`;
    }

    if (typeof window === "undefined") {
      return fallbackPath;
    }

    const currentUrl = new URL(window.location.origin);
    if (currentUrl.hostname.startsWith("admin.")) {
      const publicHostname = currentUrl.hostname.replace(/^admin\./, "");
      return `${currentUrl.protocol}//${publicHostname}${fallbackPath}`;
    }

    return `${window.location.origin}${fallbackPath}`;
  };

  const handleCopyTrackingLink = async () => {
    if (!order) return;

    if (isStorePickupOrder) {
      addNotification(
        "Info",
        "Store pickup orders do not have delivery tracking links",
        "info",
      );
      return;
    }

    const trackingUrl = getTrackingUrl(order.id);

    try {
      await navigator.clipboard.writeText(trackingUrl);
      addNotification("Success", "Tracking link copied", "success");
    } catch {
      addNotification("Error", "Unable to copy tracking link", "error");
    }
  };

  const getPaymentUrl = (orderId: string) => {
    const fallbackPath = `/checkout/pay?id=${encodeURIComponent(orderId)}`;

    const configuredPublicSiteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");

    if (configuredPublicSiteUrl) {
      return `${configuredPublicSiteUrl}${fallbackPath}`;
    }

    if (typeof window === "undefined") {
      return fallbackPath;
    }

    const currentUrl = new URL(window.location.origin);
    if (currentUrl.hostname.startsWith("admin.")) {
      const publicHostname = currentUrl.hostname.replace(/^admin\./, "");
      return `${currentUrl.protocol}//${publicHostname}${fallbackPath}`;
    }

    return `${window.location.origin}${fallbackPath}`;
  };

  const handleCopyPaymentLink = async () => {
    if (!order) return;

    const paymentUrl = getPaymentUrl(order.id);

    try {
      await navigator.clipboard.writeText(paymentUrl);
      addNotification("Success", "Payment link copied", "success");
    } catch {
      addNotification("Error", "Unable to copy payment link", "error");
    }
  };

  const handleResendConfirmation = () => {
    if (!order) return;

    const recipient = order.shippingInfo.email?.trim();
    if (!recipient) {
      addNotification("Error", "Customer email not available", "error");
      return;
    }

    const shortOrderId = toReadableOrderId(order.id);
    const subject = `Order Confirmation ${shortOrderId}`;
    const trackingLine = isStorePickupOrder
      ? "Pickup note: This order is marked for in-store pickup."
      : `Track your order: ${getTrackingUrl(order.id)}`;
    const body = [
      `Hello ${order.shippingInfo.firstName},`,
      "",
      `Your order ${shortOrderId} has been confirmed.`,
      `Current status: ${order.status.toUpperCase()}`,
      "",
      trackingLine,
      "",
      "Thank you for choosing SHERO.",
    ].join("\n");

    const mailtoUrl = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, "_blank", "noopener,noreferrer");
    addNotification(
      "Success",
      "Email draft opened for confirmation resend",
      "success",
    );
  };

  const handleCopyOrderId = async () => {
    if (!order) return;

    try {
      await navigator.clipboard.writeText(toReadableOrderId(order.id));
      addNotification("Success", "Order ID copied", "success");
    } catch {
      addNotification("Error", "Unable to copy order ID", "error");
    }
  };

  if (isLoading) return <OrderDetailsSkeleton />;

  if (error || !order)
    return (
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
          variant="outline"
          className="text-white border-white/10 hover:bg-white/5"
          asChild
        >
          <Link href="/admin/orders">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
          </Link>
        </Button>
      </div>
    );

  const statusConfig = getStatusConfig(order.status);
  const printOrderId = toReadableOrderId(order.id);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-white">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white hover:bg-white/5"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-1">
              <Hash className="w-3 h-3" />
              <span>{printOrderId}</span>
              <button
                type="button"
                onClick={() => void handleCopyOrderId()}
                className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                title="Copy order ID"
                aria-label="Copy order ID"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <h1 className="text-2xl font-bold">Order Details</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExportPDF}
            className="border-amber-500/20 text-amber-500 hover:bg-amber-500/10 h-10 font-bold px-3 hidden sm:flex"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-brand-secondary-500/20 text-brand-secondary-500 hover:bg-brand-secondary-500/10 h-10 font-bold"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
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
                <Printer className="w-4 h-4 mr-2 text-brand-secondary-400" />
                Print Invoice
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlePrint("receipt80")}
                className="cursor-pointer hover:bg-white/5"
              >
                <Printer className="w-4 h-4 mr-2 text-blue-400" />
                Print Thermal 80mm
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlePrint("receipt58")}
                className="cursor-pointer hover:bg-white/5"
              >
                <Printer className="w-4 h-4 mr-2 text-cyan-400" />
                Print Thermal 58mm
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/5 sm:hidden" />
              <DropdownMenuItem
                onClick={handleExportPDF}
                className="cursor-pointer hover:bg-white/5 sm:hidden"
              >
                <FileText className="w-4 h-4 mr-2 text-amber-400" />
                Export PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-white font-bold h-10"
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
                <CheckCircle2 className="w-4 h-4 mr-2 text-brand-secondary-400" />{" "}
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
          <Card className="bg-slate-900/40 border-white/10 overflow-hidden relative group duration-300 hover:border-brand-secondary-500/20">
            <div className="absolute inset-0 bg-radial-gradient from-brand-secondary-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-secondary-400" />
                Order Items
              </h2>
              <span
                className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                  getStatusStyles(order.status),
                )}
              >
                {order.status}
              </span>
            </div>
            <div className="divide-y divide-white/5 relative z-10">
              {order.items.map((item) => (
                <div
                  key={item.id || item.name}
                  className="p-6 flex items-center gap-6 group/item hover:bg-slate-950/20 transition-colors duration-200"
                >
                  <div className="relative w-20 h-20 rounded bg-slate-800 border border-white/5 overflow-hidden flex items-center justify-center shrink-0">
                    {item.image &&
                      (item.image.startsWith("/uploads") ||
                        item.image.startsWith("http")) ? (
                      <AppImage
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover group-hover/item:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-3xl select-none">
                        {item.image || "📦"}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold truncate group-hover/item:text-brand-secondary-400 transition-colors">
                      {item.name}
                    </p>
                    <p className="text-sm text-slate-500 mt-1 font-mono">
                      {item.sku ? `SKU: ${item.sku}` : "No SKU"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold font-mono">
                      GH₵{item.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-white/5 border-t border-white/5 relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Amount</span>
                <span className="text-2xl font-bold text-brand-secondary-400 font-mono">
                  GH₵{order.total.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Customer & Shipping Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-slate-900/40 border-white/10 p-6 hover:border-blue-500/20 duration-300 relative group overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient from-blue-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <h3 className="text-white font-bold mb-4 flex items-center gap-2 relative z-10">
                <Mail className="w-4 h-4 text-blue-400" />
                Customer Contact
              </h3>
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-slate-400 font-bold font-mono uppercase">
                    {order.shippingInfo.firstName[0]}
                    {order.shippingInfo.lastName[0]}
                  </div>
                  <div>
                    <p className="text-white font-semibold">
                      {order.shippingInfo.firstName}{" "}
                      {order.shippingInfo.lastName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {order.shippingInfo.email}
                    </p>
                  </div>
                </div>
                <div className="pt-2 space-y-2 border-t border-white/5">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{order.shippingInfo.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {order.shippingInfo.phone || "No phone provided"}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900/40 border-white/10 p-6 hover:border-amber-500/20 duration-300 relative group overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient from-amber-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <h3 className="text-white font-bold mb-4 flex items-center gap-2 relative z-10">
                <MapPin className="w-4 h-4 text-amber-400" />
                Shipping Address
              </h3>
              <div className="text-sm text-slate-400 space-y-2 relative z-10">
                <p className="text-white font-medium">
                  {order.shippingInfo.address}
                </p>
                <p className="text-xs">
                  {order.shippingInfo.city}, {order.shippingInfo.region}
                </p>
                <div className="pt-2.5 flex items-center gap-2 border-t border-white/5 mt-2">
                  <Truck className="w-4 h-4 text-brand-secondary-400" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-brand-secondary-400">
                    Standard Delivery
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="bg-slate-900/40 border-white/10 p-6 space-y-6 hover:border-brand-secondary-500/20 duration-300 relative group overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient from-brand-secondary-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                Order Status
              </h3>
              <div
                className={cn(
                  "flex items-center justify-between p-3.5 rounded border",
                  getStatusStyles(order.status),
                )}
              >
                <div className="flex items-center gap-3">
                  <statusConfig.icon className="w-4.5 h-4.5" />
                  <span className="font-bold capitalize text-sm">
                    {order.status}
                  </span>
                </div>
              </div>
              {order.paymentMessage && (
                <div className="mt-3 text-xs bg-slate-950/40 p-3 rounded border border-white/5 text-slate-400 leading-relaxed">
                  <span className="font-semibold text-slate-300 block mb-1">Payment Status:</span> 
                  {order.paymentMessage}
                </div>
              )}
            </div>

            <div className="relative z-10">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                Payment Information
              </h3>
              <div className="space-y-3 bg-slate-950/20 border border-white/5 rounded p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Method</span>
                  <span className="text-white font-semibold flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    {formatPaymentMethod(order.paymentMethod)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Date</span>
                  <span className="text-white font-mono">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 relative z-10">
              <div className="bg-brand-secondary-500/5 p-4 rounded border border-brand-secondary-500/10">
                <div className="flex items-center gap-2 text-brand-secondary-400 mb-1.5">
                  <Package className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Inventory Note
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Stock levels were adjusted automatically when this order was
                  confirmed.
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="bg-slate-950/30 rounded p-5 border border-white/5 relative group overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient from-white/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 relative z-10">
              Internal Actions
            </h4>
            <div className="space-y-2 relative z-10">
              <Button
                variant="ghost"
                onClick={handleResendConfirmation}
                className="w-full justify-start text-xs text-slate-400 hover:text-white hover:bg-white/5 h-9 rounded transition-all duration-200"
              >
                <Mail className="w-3.5 h-3.5 mr-2 text-slate-500" />
                Resend Confirmation
              </Button>
              <Button
                variant="ghost"
                onClick={handleCopyTrackingLink}
                disabled={isStorePickupOrder}
                className="w-full justify-start text-xs text-slate-400 hover:text-white hover:bg-white/5 h-9 rounded transition-all duration-200"
              >
                <Hash className="w-3.5 h-3.5 mr-2 text-slate-500" />
                {isStorePickupOrder
                  ? "Tracking not available"
                  : "Copy Tracking link"}
              </Button>
              <Button
                variant="ghost"
                onClick={handleCopyPaymentLink}
                className="w-full justify-start text-xs text-slate-400 hover:text-white hover:bg-white/5 h-9 rounded transition-all duration-200"
              >
                <CreditCard className="w-3.5 h-3.5 mr-2 text-slate-500" />
                Copy Payment link
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Document (hidden in UI) */}
      {printMode &&
        order &&
        createPortal(
          <div className="hidden print:block bg-white text-black p-0 m-0 print-area relative z-10">
            <style>
              {`
          @media print {
            @page { 
              margin: 0.5cm; 
              size: portrait; 
            }
            @page thermal {
              size: 80mm auto;
              margin: 0;
            }
            @page thermal58 {
              size: 58mm auto;
              margin: 0;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            /* Hide everything EXCEPT the print-area portal */
            body > *:not(.print-area) {
              display: none !important;
            }
            .print-area {
              display: block !important;
              position: relative !important;
              width: 100% !important;
              background: white !important;
            }
            .print-document {
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              padding: 20px !important;
              background: white !important;
              font-family: sans-serif;
            }
            .thermal-document {
              page: thermal;
              width: 72mm !important;
              max-width: 72mm !important;
              margin: 0 auto !important;
              padding: 5mm 4mm 6mm !important;
              font-family: "JetBrains Mono", "Courier New", monospace !important;
              font-size: 10.5px !important;
              line-height: 1.3 !important;
            }
            .thermal-document-58 {
              page: thermal58;
              width: 50mm !important;
              max-width: 50mm !important;
              margin: 0 auto !important;
              padding: 4mm 3mm 5mm !important;
              font-family: "JetBrains Mono", "Courier New", monospace !important;
              font-size: 9px !important;
              line-height: 1.25 !important;
            }
            .thermal-divider {
              border-top: 1px dashed #111;
              margin: 8px 0;
            }
            .thermal-cut {
              margin-top: 10px;
              border-top: 2px dotted #666;
              padding-top: 6px;
              text-align: center;
              font-size: 9px;
              color: #666;
              letter-spacing: 0.08em;
            }
            .text-brand-secondary-600 { color: #059669 !important; }
            .bg-slate-100 { background-color: #f1f5f9 !important; }
          }
          `}
            </style>
            {printMode === "receipt80" || printMode === "receipt58" ? (
              <div
                className={cn(
                  "print-document",
                  printMode === "receipt58"
                    ? "thermal-document-58"
                    : "thermal-document",
                )}
              >
                <div className="text-center">
                  <h1 className="text-lg font-bold tracking-wide">SHERO</h1>
                  <p className="tracking-widest">TECHNOLOGIES</p>
                  <p className="text-[9px]">OFFICIAL SALES RECEIPT</p>
                </div>

                <div className="thermal-divider" />

                <div className="text-[9px] space-y-1">
                  <div className="flex justify-between">
                    <span>Receipt</span>
                    <span>{printOrderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span className="uppercase">{order.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date</span>
                    <span>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time</span>
                    <span>
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment</span>
                    <span>{formatPaymentMethod(order.paymentMethod)}</span>
                  </div>
                </div>

                <div className="thermal-divider" />

                <div className="text-[9px] space-y-0.5 mb-1">
                  <p className="font-bold">
                    {order.shippingInfo.firstName} {order.shippingInfo.lastName}
                  </p>
                  <p>{order.shippingInfo.phone || order.shippingInfo.email}</p>
                </div>

                <table className="w-full text-[9px]">
                  <thead>
                    <tr className="border-b border-black/20">
                      <th className="text-left py-1 font-bold">ITEM</th>
                      <th className="text-center py-1 w-8 font-bold">QTY</th>
                      <th className="text-right py-1 w-12 font-bold">AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id || item.name} className="align-top">
                        <td className="py-1 pr-1">
                          <p>{item.name}</p>
                          <p className="opacity-70">
                            GH₵{item.price.toLocaleString()} ea
                          </p>
                        </td>
                        <td className="py-1 text-center">{item.quantity}</td>
                        <td className="py-1 text-right">
                          GH₵{(item.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="thermal-divider" />

                <div className="text-[9px] space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>GH₵{order.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>GH₵0.00</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-1 border-t border-black/20">
                    <span>TOTAL</span>
                    <span>GH₵{order.total.toLocaleString()}</span>
                  </div>
                </div>

                {receiptQrUrl && (
                  <div className="mt-3 text-center">
                    <img
                      src={receiptQrUrl}
                      alt="Receipt verification QR"
                      className={cn(
                        "mx-auto",
                        printMode === "receipt58" ? "w-20 h-20" : "w-28 h-28",
                      )}
                    />
                    <p className="text-[8px] mt-1">
                      Scan to verify receipt details
                    </p>
                  </div>
                )}

                <div className="thermal-divider" />

                <div className="text-center text-[8px] leading-4">
                  <p>THANK YOU FOR SHOPPING WITH SHERO</p>
                  <p>{COMPANY_EMAILS.SUPPORT}</p>
                  <p>{COMPANY_CONTACTS.PHONE_DISPLAY}</p>
                  <p>{COMPANY_CONTACTS.WEBSITE_DISPLAY}</p>
                </div>

                <div className="thermal-cut">--- CUSTOMER COPY ---</div>
              </div>
            ) : (
              <div className="print-document">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-brand-secondary-600">
                      SHERO
                    </h1>
                    <p className="text-slate-500 text-sm">
                      Technologies
                    </p>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-bold uppercase">{printMode}</h2>
                    <p className="font-mono text-sm">#{printOrderId}</p>
                    <p className="text-slate-500 text-xs">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-100">
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Billed To
                    </h3>
                    <p className="font-bold">
                      {order.shippingInfo.firstName}{" "}
                      {order.shippingInfo.lastName}
                    </p>
                    <p className="text-sm text-slate-600">
                      {order.shippingInfo.email}
                    </p>
                    <p className="text-sm text-slate-600">
                      {order.shippingInfo.phone}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                      Shipping Address
                    </h3>
                    <p className="text-sm text-slate-600">
                      {order.shippingInfo.address}
                    </p>
                    <p className="text-sm text-slate-600">
                      {order.shippingInfo.city}, {order.shippingInfo.region}
                    </p>
                  </div>
                </div>

                <table className="w-full mb-8">
                  <thead>
                    <tr className="border-b-2 border-slate-100">
                      <th className="text-left py-3 text-[10px] uppercase text-slate-400">
                        Description
                      </th>
                      <th className="text-center py-3 text-[10px] uppercase text-slate-400">
                        Qty
                      </th>
                      <th className="text-right py-3 text-[10px] uppercase text-slate-400">
                        Price
                      </th>
                      <th className="text-right py-3 text-[10px] uppercase text-slate-400">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {order.items.map((item) => (
                      <tr key={item.id || item.name}>
                        <td className="py-4">
                          <p className="font-bold">{item.name}</p>
                          {item.sku && (
                            <p className="text-[10px] text-slate-500 font-mono">
                              SKU: {item.sku}
                            </p>
                          )}
                        </td>
                        <td className="text-center py-4">{item.quantity}</td>
                        <td className="text-right py-4">
                          GH₵{item.price.toLocaleString()}
                        </td>
                        <td className="text-right py-4 font-bold">
                          GH₵{(item.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end pt-8">
                  <div className="w-64 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span>GH₵{order.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Tax (0%)</span>
                      <span>GH₵0.00</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-slate-100 pt-3 text-brand-secondary-600">
                      <span>Total</span>
                      <span>GH₵{order.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {receiptQrUrl && (
                  <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <img
                      src={receiptQrUrl}
                      alt="Invoice verification QR"
                      className="w-28 h-28 mx-auto"
                    />
                    <p className="text-[10px] text-slate-500 mt-2">
                      Scan to verify invoice details
                    </p>
                  </div>
                )}

                <div className="mt-20 pt-8 border-t border-slate-100 text-center">
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest">
                    Thank you for your business!
                  </p>
                  <p className="text-slate-500 text-[9px] mt-1">
                    SHERO Technologies • {COMPANY_CONTACTS.HQ_LOCATION} • {COMPANY_CONTACTS.WEBSITE_DISPLAY}
                  </p>
                </div>
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
