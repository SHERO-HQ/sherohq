"use client";

import { toReadableOrderId } from "@/utils/orderId";
import Link from "next/link";
import { ArrowLeft, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { OrderItemsCard } from "@/components/admin/orders/OrderItemsCard";
import { OrderCustomerCard } from "@/components/admin/orders/OrderCustomerCard";
import { OrderSidebarCard } from "@/components/admin/orders/OrderSidebarCard";
import { OrderInternalActionsCard } from "@/components/admin/orders/OrderInternalActionsCard";
import { OrderDetailsSkeleton } from "@/components/admin/orders/OrderDetailsSkeleton";
import { OrderPrintPortal } from "@/components/admin/orders/OrderPrintPortal";
import { OrderHeaderActions } from "@/components/admin/orders/OrderHeaderActions";
import { useOrderDetails } from "@/components/admin/orders/useOrderDetails";

export default function OrderDetails() {
  const {
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
  } = useOrderDetails();

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

  const printOrderId = toReadableOrderId(order.id);

  return (
    <ErrorBoundary>
      <div className="max-w-6xl mx-auto space-y-6 pb-20">
        {/* Header Actions */}
        <OrderHeaderActions
          printOrderId={printOrderId}
          onCopyOrderId={handleCopyOrderId}
          onBack={() => router.back()}
          onExportPDF={handleExportPDF}
          onPrint={handlePrint}
          onUpdateStatus={handleUpdateStatus}
          isUpdating={isUpdating}
        />

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items List */}
            <OrderItemsCard
              items={order.items}
              status={order.status}
              total={order.total}
            />

            {/* Customer & Shipping Info */}
            <OrderCustomerCard order={order} />
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <OrderSidebarCard
              status={order.status}
              paymentMessage={order.paymentMessage}
              paymentMethod={order.paymentMethod}
              createdAt={order.createdAt}
            />

            {/* Quick Actions */}
            <OrderInternalActionsCard
              onResendConfirmation={handleResendConfirmation}
              onCopyTrackingLink={handleCopyTrackingLink}
              onCopyPaymentLink={handleCopyPaymentLink}
              isStorePickupOrder={isStorePickupOrder}
              isSendingEmail={isSendingEmail}
              orderStatus={order.status}
            />
          </div>
        </div>

        {/* Printable Document (hidden in UI) */}
        <OrderPrintPortal
          order={order}
          printMode={printMode}
          receiptQrUrl={receiptQrUrl}
        />
      </div>
    </ErrorBoundary>
  );
}
