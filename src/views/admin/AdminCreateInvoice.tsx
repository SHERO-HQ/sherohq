"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";
import { useCreateAdminOrder } from "@/hooks/queries/useOrders";
import { useProducts } from "@/hooks/queries/useProducts";
import { useFormDraft } from "@/hooks/useFormDraft";
import {
  ArrowLeft,
  FileSpreadsheet,
  FileText,
  Loader2,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Import modular components
import InvoiceCustomerCard from "@/components/admin/invoice/InvoiceCustomerCard";
import InvoiceItemsCard from "@/components/admin/invoice/InvoiceItemsCard";
import InvoiceSidebarMeta from "@/components/admin/invoice/InvoiceSidebarMeta";

interface InvoiceItem {
  id: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  type: "product" | "custom";
}

interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  region: string;
}

interface InvoiceFormDraft {
  mode: "invoice" | "quote";
  customer: CustomerInfo;
  items: InvoiceItem[];
}

const INVOICE_DRAFT_KEY = "sherotech:admin:invoice-form:v1";

const defaultCustomer = (): CustomerInfo => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  region: "",
});

const isDraftMeaningful = (draft: InvoiceFormDraft) => {
  const { customer, items } = draft;
  return Boolean(
    customer.firstName?.trim() ||
    customer.lastName?.trim() ||
    customer.email?.trim() ||
    customer.address?.trim() ||
    items.length > 0
  );
};

export default function AdminCreateInvoice() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const createOrderMutation = useCreateAdminOrder();

  const [mode, setMode] = useState<"invoice" | "quote">("invoice");
  const [customer, setCustomer] = useState<CustomerInfo>(() => defaultCustomer());
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products = [], isLoading: isLoadingProducts } = useProducts(
    undefined,
    searchQuery
  );

  const currentDraft = useMemo<InvoiceFormDraft>(
    () => ({
      mode,
      customer,
      items,
    }),
    [mode, customer, items]
  );

  const { hasDraft, draftSavedAt, persistDraft, clearDraft } = useFormDraft<InvoiceFormDraft>({
    storageKey: INVOICE_DRAFT_KEY,
    currentData: currentDraft,
    isMeaningful: isDraftMeaningful,
    serialize: (data) => JSON.stringify(data),
    deserialize: (text) => JSON.parse(text),
    isLoading: false,
    onRestore: (parsed) => {
      setMode(parsed.mode || "invoice");
      setCustomer(parsed.customer || defaultCustomer());
      setItems(parsed.items || []);
    },
  });

  const handleSaveDraft = () => {
    persistDraft(currentDraft);
    addNotification("Draft saved", "Your changes were saved locally.", "success");
  };

  const handleAddProduct = (product: any) => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        type: "product",
      },
    ]);
    setSearchQuery("");
  };

  const handleAddCustomItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: "New Service / Item",
        price: 0,
        quantity: 1,
        type: "custom",
      },
    ]);
  };

  const updateItem = (
    id: string,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateCustomer = (updates: Partial<CustomerInfo>) => {
    setCustomer((prev) => ({ ...prev, ...updates }));
  };

  const totalAmount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const handleSubmit = async () => {
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!customer.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!customer.email?.trim()) {
      newErrors.email = "Email address is required";
    }
    if (!customer.address?.trim()) {
      newErrors.address = "Street address is required";
    }
    if (items.length === 0) {
      newErrors.items = "You must add at least one item to issue an invoice";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addNotification(
        "Validation Error",
        "Please check the highlighted fields on the form",
        "error"
      );

      // Smooth scroll to the first element with an error
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.getElementById(firstErrorField);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => element.focus(), 400);
      }
      return;
    }

    try {
      const payload = {
        shippingInfo: customer,
        items: items.map((item) => ({
          id: item.productId,
          name: item.name,
          price: Number(item.price),
          quantity: Number(item.quantity),
          image: item.image,
        })),
        total: totalAmount,
        status: mode === "invoice" ? "pending" : "quote",
      };

      const result = await createOrderMutation.mutateAsync(payload as any);
      addNotification(
        "Success",
        `${mode === "invoice" ? "Invoice" : "Quote"} created successfully!`,
        "success"
      );
      clearDraft();
      router.push(`/admin/orders/${result.order.id}`);
    } catch (error) {
      addNotification(
        "Error",
        error instanceof Error ? error.message : "Failed to create order",
        "error"
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Sticky Header Action Bar */}
      <div className="sticky top-20 bg-card backdrop-blur-md z-20 py-4 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/admin/orders")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Create New {mode === "invoice" ? "Invoice" : "Quote"}
            </h1>
            <p className="text-muted-foreground text-sm">
              Manually create orders or quotes for customers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-card p-1 rounded border border-border shrink-0">
            <button
              onClick={() => setMode("invoice")}
              className={cn(
                "px-3.5 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 select-none",
                mode === "invoice"
                  ? "bg-brand-secondary-600 text-white shadow shadow-brand-secondary-500/25"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Invoice
            </button>
            <button
              onClick={() => setMode("quote")}
              className={cn(
                "px-3.5 py-1.5 rounded text-xs font-bold transition flex items-center gap-1.5 select-none",
                mode === "quote"
                  ? "bg-blue-600 text-foreground shadow shadow-blue-500/25"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="w-3.5 h-3.5" /> Quote
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => router.push("/admin/orders")}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={createOrderMutation.isPending || items.length === 0}
              className={cn(
                "font-bold text-slate-100 min-w-36 select-none",
                mode === "invoice"
                  ? "bg-brand-secondary-600 hover:bg-brand-secondary-500"
                  : "bg-blue-600 hover:bg-blue-500"
              )}
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create {mode === "invoice" ? "Invoice" : "Quote"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {(hasDraft || draftSavedAt) && (
        <div className="flex flex-col gap-3 rounded border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border-emerald-500/20">
                Local draft
              </Badge>
              <span className="text-sm text-muted-foreground">
                Draft autosave is enabled for this form.
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {draftSavedAt
                ? `Last saved ${new Date(draftSavedAt).toLocaleString()}.`
                : "Your changes will be saved locally as you type."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              className="border-emerald-500/30 text-emerald-600 dark:text-emerald-200 hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-100"
            >
              Save draft now
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={clearDraft}
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              Clear draft
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-8">
          <InvoiceCustomerCard
            customer={customer}
            onUpdateCustomer={updateCustomer}
            errors={errors}
          />

          <InvoiceItemsCard
            items={items}
            onAddItem={(item) => setItems((prev) => [...prev, item])}
            onUpdateItem={updateItem}
            onRemoveItem={removeItem}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            products={products}
            isLoadingProducts={isLoadingProducts}
            onAddProduct={handleAddProduct}
            onAddCustomItem={handleAddCustomItem}
            errors={errors}
          />

          {/* Desktop Secondary Action Bar */}
          <div className="hidden md:flex items-center gap-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => router.push("/admin/orders")}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={createOrderMutation.isPending || items.length === 0}
              className={cn(
                "font-bold text-slate-100 min-w-36 select-none",
                mode === "invoice"
                  ? "bg-brand-secondary-600 hover:bg-brand-secondary-500"
                  : "bg-blue-600 hover:bg-blue-500"
              )}
            >
              {createOrderMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create {mode === "invoice" ? "Invoice" : "Quote"}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar Summary Area */}
        <InvoiceSidebarMeta
          totalAmount={totalAmount}
          isSaving={createOrderMutation.isPending}
          mode={mode}
          onSubmit={handleSubmit}
          hasItems={items.length > 0}
        />
      </div>

      {/* Mobile Sticky Bottom Action Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-card backdrop-blur-md border-t border-border p-4 flex items-center justify-between gap-4 md:hidden shadow-[0_-8px_24px_rgba(0,0,0,0.5)]">
        <Button
          type="button"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground w-1/3"
          onClick={() => router.push("/admin/orders")}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={createOrderMutation.isPending || items.length === 0}
          className={cn(
            "w-2/3 font-bold text-slate-100 select-none",
            mode === "invoice"
              ? "bg-brand-secondary-600 hover:bg-brand-secondary-500"
              : "bg-blue-600 hover:bg-blue-500"
          )}
        >
          {createOrderMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Creating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Create {mode === "invoice" ? "Invoice" : "Quote"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
