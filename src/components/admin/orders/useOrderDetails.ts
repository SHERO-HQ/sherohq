"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchOrderById, updateOrderStatus, resendOrderNotification, type Order } from "@/services/api";
import { useNotifications } from "@/hooks/useNotifications";
import { toReadableOrderId } from "@/utils/orderId";
import { formatCurrency } from "@/utils/format";
import { exportToPDF } from "@/utils/exportUtils";

export function useOrderDetails() {
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

  const handlePrint = (
    type: "invoice" | "receipt" | "receiptA5" | "receipt58",
  ) => {
    setPrintMode(type);

    const orderId = order ? toReadableOrderId(order.id) : "ID";
    const typeLabel = type === "invoice" ? "Invoice" : "Receipt";
    const printTitle = `SHERO-${typeLabel}-${orderId}`;

    document.title = printTitle;

    setTimeout(() => {
      globalThis.print();
    }, 200);
  };

  useEffect(() => {
    if (!printMode) return;

    const orderId = order ? toReadableOrderId(order.id) : "ID";
    const typeLabel = printMode === "invoice" ? "Invoice" : "Receipt";
    const printTitle = `SHERO-${typeLabel}-${orderId}`;

    const interval = setInterval(() => {
      document.title = printTitle;
    }, 100);

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
      Total: formatCurrency(item.price * item.quantity),
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

  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleResendConfirmation = async (
    type?: "auto" | "confirmation" | "reminder" | "status"
  ) => {
    if (!order || isSendingEmail) return;

    const recipient = order.shippingInfo.email?.trim();
    if (!recipient) {
      addNotification("Error", "Customer email not available", "error");
      return;
    }

    try {
      setIsSendingEmail(true);
      const result = await resendOrderNotification(order.id, type);
      addNotification(
        "Success",
        result.message || `Email sent successfully to ${recipient}`,
        "success",
      );
    } catch (err) {
      addNotification(
        "Error",
        err instanceof Error ? err.message : "Failed to send email",
        "error",
      );
    } finally {
      setIsSendingEmail(false);
    }
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

  return {
    router,
    order,
    isLoading,
    error,
    isUpdating,
    isSendingEmail,
    printMode,
    receiptQrUrl,
    isStorePickupOrder,
    handleUpdateStatus,
    handlePrint,
    handleExportPDF,
    handleCopyTrackingLink,
    handleCopyPaymentLink,
    handleResendConfirmation,
    handleCopyOrderId,
  };
}
