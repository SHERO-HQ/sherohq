"use client";
import { toReadableOrderId } from "@/utils/orderId";
import { useState, useEffect } from "react";
import { } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchOrderById,
  updateOrderStatus,
  type Order,
  getImageUrl} from "@/services/api";
import { useNotifications } from "@/hooks/useNotifications";

import {
  ArrowLeft,
  Copy,
  Clock,
  Mail,
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
  ChevronLeft} from "lucide-react";
import { formatCurrency } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import AppImage from "@/components/common/AppImage";
import { exportToPDF } from "@/utils/exportUtils";
import { displayOrderId } from "@/utils/orderId";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator} from "@/components/ui/dropdown-menu";
import { } from "@/constants/contacts";
import { } from "@/constants/emails";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { } from "@/components/admin/orders/OrderItemsCard";
import { OrderCustomerCard } from "@/components/admin/orders/OrderCustomerCard";
import { } from "@/components/admin/orders/OrderSidebarCard";
import { } from "@/components/admin/orders/OrderInternalActionsCard";
import { OrderDetailsSkeleton } from "@/components/admin/orders/OrderDetailsSkeleton";
import { OrderPrintPortal } from "@/components/admin/orders/OrderPrintPortal";


export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { addNotification } = useNotifications();
  const [printMode, setPrintMode] = useState<
    "invoice" | "receipt" | "receiptA5" | "receipt58" | null
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
        customer: `${order.shippingInfo.firstName} ${order.shippingInfo.lastName}`};

      try {
        const QRCode = (await import("qrcode")).default;
        const dataUrl = await QRCode.toDataURL(JSON.stringify(payload), {
          width: 180,
          margin: 1,
          color: { dark: "#000000", light: "#ffffff" }});

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
  const handlePrint = (type: "invoice" | "receipt" | "receiptA5" | "receipt58") => {
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
      Price: formatCurrency(item.price),
      Quantity: item.quantity,
      Total: formatCurrency(item.price * item.quantity)}));

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
      case "intransit":
        return { color: "text-purple-400 bg-purple-500/10", icon: Truck };
      case "delivered":
        return {
          color: "text-brand-secondary-400 bg-brand-secondary-500/10",
          icon: CheckCircle2};
      case "cancelled":
        return { color: "text-rose-400 bg-rose-500/10", icon: XCircle };
      default:
        return { color: "text-muted-foreground bg-slate-500/10", icon: Clock };
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
      case "intransit":
        return "bg-purple-500/10 border border-purple-500/20 text-purple-400";
      default:
        return "bg-rose-500/10 border border-rose-500/20 text-rose-400";
    }
  };

  

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
        <h1 className="text-2xl font-bold text-foreground">Order Not Found</h1>
        <p className="text-muted-foreground">
          {error ||
            "The order you are looking for does not exist or has been removed."}
        </p>
        <Button
          variant="outline"
          className="text-foreground border-border hover:bg-accent"
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
    <ErrorBoundary>
      <div className="max-w-6xl mx-auto space-y-6 pb-20">
        {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-foreground">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-accent"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2 text-sm font-mono text-muted-foreground mb-1">
              <span>{printOrderId}</span>
              <button
                type="button"
                onClick={() => void handleCopyOrderId()}
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
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
              className="bg-card border-border text-foreground w-48"
            >
              <DropdownMenuItem
                onClick={() => handlePrint("invoice")}
                className="cursor-pointer hover:bg-accent"
              >
                <Printer className="w-4 h-4 mr-2 text-brand-secondary-400" />
                Print Invoice
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlePrint("receipt")}
                className="cursor-pointer hover:bg-accent"
              >
                <Printer className="w-4 h-4 mr-2 text-blue-400" />
                Print Receipt (A4)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlePrint("receiptA5")}
                className="cursor-pointer hover:bg-accent"
              >
                <Printer className="w-4 h-4 mr-2 text-indigo-400" />
                Print Receipt (A5)
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handlePrint("receipt58")}
                className="cursor-pointer hover:bg-accent"
              >
                <Printer className="w-4 h-4 mr-2 text-cyan-400" />
                Print Thermal 58mm
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-accent/50 sm:hidden" />
              <DropdownMenuItem
                onClick={handleExportPDF}
                className="cursor-pointer hover:bg-accent sm:hidden"
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
              className="bg-card border-border text-foreground w-48"
            >
              <DropdownMenuItem
                onClick={() => handleUpdateStatus("processing")}
                className="cursor-pointer hover:bg-accent"
              >
                <Truck className="w-4 h-4 mr-2 text-blue-400" /> Processing
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleUpdateStatus("intransit")}
                className="cursor-pointer hover:bg-accent"
              >
                <Truck className="w-4 h-4 mr-2 text-purple-400" /> Shipped
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleUpdateStatus("delivered")}
                className="cursor-pointer hover:bg-accent"
              >
                <CheckCircle2 className="w-4 h-4 mr-2 text-brand-secondary-400" />{" "}
                Delivered
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-accent/50" />
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
          <Card className="bg-card/40 border-border overflow-hidden relative group duration-300 hover:border-brand-secondary-500/20">
            <div className="absolute inset-0 bg-radial-gradient from-brand-secondary-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="p-6 border-b border-border flex items-center justify-between relative z-10">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
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
                  className="p-6 flex items-center gap-6 group/item hover:bg-card transition-colors duration-200"
                >
                  <div className="relative w-20 h-20 rounded bg-muted border border-border overflow-hidden flex items-center justify-center shrink-0">
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
                    <p className="text-foreground font-bold truncate group-hover/item:text-brand-secondary-400 transition-colors">
                      {item.name}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1 font-mono">
                      {item.sku ? `SKU: ${item.sku}` : "No SKU"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground font-bold font-mono">
                      {formatCurrency(item.price)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-accent/50 border-t border-border relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="text-2xl font-bold text-brand-secondary-400 font-mono">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </Card>

          {/* Customer & Shipping Info */}
          <OrderCustomerCard order={order} />
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="bg-card/40 border-border p-6 space-y-6 hover:border-brand-secondary-500/20 duration-300 relative group overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient from-brand-secondary-500/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
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
                <div className="mt-3 text-xs bg-card p-3 rounded border border-border text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-muted-foreground block mb-1">Payment Status:</span> 
                  {order.paymentMessage}
                </div>
              )}
            </div>

            <div className="relative z-10">
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Payment Information
              </h3>
              <div className="space-y-3 bg-card border border-border rounded p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span className="text-foreground font-semibold flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                    {formatPaymentMethod(order.paymentMethod)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span className="text-foreground font-mono">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border relative z-10">
              <div className="bg-brand-secondary-500/5 p-4 rounded border border-brand-secondary-500/10">
                <div className="flex items-center gap-2 text-brand-secondary-400 mb-1.5">
                  <Package className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Inventory Note
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Stock levels were adjusted automatically when this order was
                  confirmed.
                </p>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="bg-card rounded p-5 border border-border relative group overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient from-white/2 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 relative z-10">
              Internal Actions
            </h4>
            <div className="space-y-2 relative z-10">
              <Button
                variant="ghost"
                onClick={handleResendConfirmation}
                className="w-full justify-start text-xs text-muted-foreground hover:text-foreground hover:bg-accent h-9 rounded transition-all duration-200"
              >
                <Mail className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                Resend Confirmation
              </Button>
              <Button
                variant="ghost"
                onClick={handleCopyTrackingLink}
                disabled={isStorePickupOrder}
                className="w-full justify-start text-xs text-muted-foreground hover:text-foreground hover:bg-accent h-9 rounded transition-all duration-200"
              >
                <Hash className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                {isStorePickupOrder
                  ? "Tracking not available"
                  : "Copy Tracking link"}
              </Button>
              <Button
                variant="ghost"
                onClick={handleCopyPaymentLink}
                className="w-full justify-start text-xs text-muted-foreground hover:text-foreground hover:bg-accent h-9 rounded transition-all duration-200"
              >
                <CreditCard className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                Copy Payment link
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Document (hidden in UI) */}
      <OrderPrintPortal order={order} printMode={printMode} receiptQrUrl={receiptQrUrl} />
      </div>
    </ErrorBoundary>
  );
}
