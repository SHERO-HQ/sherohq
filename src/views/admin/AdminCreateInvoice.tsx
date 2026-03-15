"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useNotifications } from "@/hooks/useNotifications";
import { useCreateAdminOrder } from "@/hooks/queries/useOrders";
import { useProducts } from "@/hooks/queries/useProducts";
import {
 ArrowLeft,
 Search,
 Plus,
 Trash2,
 FileSpreadsheet,
 FileText,
 Loader2,
 CheckCircle2,
 User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";

interface InvoiceItem {
 id: string; // temp id
 productId?: string;
 name: string;
 price: number;
 quantity: number;
 image?: string;
 type: "product" | "custom";
}

export default function AdminCreateInvoice() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const { addNotification } = useNotifications();
 const createOrderMutation = useCreateAdminOrder();

 // Mode: Invoice or Quote
 const [mode, setMode] = useState<"invoice" | "quote">("invoice");

 // Customer Info
 const [customer, setCustomer] = useState(() => {
 if (searchParams.get("walkin") === "true") {
 return {
 firstName: "Walk-in",
 lastName: "Guest",
 email: "walkin@sherotech.com",
 phone: "+233 00 000 0000",
 address: "In-Store",
 city: "Accra",
 region: "Greater Accra",
 };
 }
 return {
 firstName: "",
 lastName: "",
 email: "",
 phone: "",
 address: "",
 city: "",
 region: "",
 };
 });

 // Items
 const [items, setItems] = useState<InvoiceItem[]>([]);

 // Product Search
 const [searchQuery, setSearchQuery] = useState("");
 const { data: products = [], isLoading: isLoadingProducts } = useProducts(
 undefined,
 searchQuery,
 );

 // Add Item Logic
 const handleAddProduct = (product: Product) => {
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
 setSearchQuery(""); // clear search
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
 value: string | number,
 ) => {
 setItems((prev) =>
 prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
 );
 };

 const removeItem = (id: string) => {
 setItems((prev) => prev.filter((item) => item.id !== id));
 };

 // Totals
 const totalAmount = items.reduce(
 (sum, item) => sum + item.price * item.quantity,
 0,
 );

 const handleQuickWalkIn = useCallback(() => {
 setCustomer({
 firstName: "Walk-in",
 lastName: "Guest",
 email: "walkin@sherotech.com",
 phone: "+233 00 000 0000",
 address: "In-Store",
 city: "Accra",
 region: "Greater Accra",
 });
 addNotification("Success", "Walk-in details pre-filled!", "success");
 }, [addNotification]);

 useEffect(() => {
 if (searchParams.get("walkin") === "true") {
 addNotification("Success", "Walk-in details pre-filled!", "success");
 }
 }, [addNotification, searchParams]);

 const handleSubmit = async () => {
 if (
 !customer.firstName ||
 !customer.email ||
 !customer.address ||
 items.length === 0
 ) {
 addNotification(
 "Error",
 "Please fill required fields and add items.",
 "error",
 );
 return;
 }

 try {
 const payload = {
 shippingInfo: customer,
 items: items.map((item) => ({
 id: item.productId, // Optional for custom items
 name: item.name,
 price: Number(item.price),
 quantity: Number(item.quantity),
 image: item.image,
 })),
 total: totalAmount,
 status: mode === "invoice" ? "pending" : "quote",
 };

 // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const result = await createOrderMutation.mutateAsync(payload as any); // payload type needs update in api.ts but bypassing for now with comment

 addNotification(
 "Success",
 `${mode === "invoice" ? "Invoice" : "Quote"} created successfully!`,
 "success",
 );
 router.push(`/admin/orders/${result.order.id}`);
 } catch (error) {
 addNotification(
 "Error",
 error instanceof Error ? error.message : "Failed to create order",
 "error",
 );
 }
 };

 return (
 <AdminLayout>
 <div className="max-w-5xl mx-auto pb-20 space-y-8">
 {/* Header */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-4">
 <Button
 variant="ghost"
 size="icon"
 onClick={() => router.push("/admin/orders")}
 className="text-slate-400 hover:text-white hover:bg-white/5"
 >
 <ArrowLeft className="w-5 h-5" />
 </Button>
 <div>
 <h1 className="text-2xl font-bold text-white">
 Create New {mode === "invoice" ? "Invoice" : "Quote"}
 </h1>
 <p className="text-slate-400 text-sm">
 Manually create orders or quotes for customers.
 </p>
 </div>
 </div>

 <div className="flex bg-slate-900 p-1 rounded border border-white/10">
 <button
 onClick={() => setMode("invoice")}
 className={cn(
 "px-4 py-2 rounded text-sm font-bold transition flex items-center gap-2",
 mode === "invoice"
 ? "bg-emerald-600 text-white shadow-lg"
 : "text-slate-400 hover:text-white",
 )}
 >
 <FileSpreadsheet className="w-4 h-4" /> Invoice
 </button>
 <button
 onClick={() => setMode("quote")}
 className={cn(
 "px-4 py-2 rounded text-sm font-bold transition flex items-center gap-2",
 mode === "quote"
 ? "bg-blue-600 text-white shadow-lg"
 : "text-slate-400 hover:text-white",
 )}
 >
 <FileText className="w-4 h-4" /> Quote
 </button>
 </div>
 </div>

 <div className="grid lg:grid-cols-3 gap-8">
 {/* Main Form */}
 <div className="lg:col-span-2 space-y-8">
 {/* Customer Details */}
 <Card className="bg-slate-900 border-white/5 p-6 space-y-6">
 <div className="flex items-center justify-between pb-4 border-b border-white/5">
 <h2 className="text-lg font-bold text-white flex items-center gap-2">
 Customer Information
 </h2>
 <Button
 variant="outline"
 size="sm"
 onClick={handleQuickWalkIn}
 className="border-white/10 text-emerald-400 hover:bg-emerald-500/10"
 >
 <User className="w-4 h-4 mr-2" /> Quick Walk-in
 </Button>
 </div>
 <div className="grid sm:grid-cols-2 gap-4">
 <Input
 label="First Name"
 placeholder="John"
 value={customer.firstName}
 onChange={(e) =>
 setCustomer({ ...customer, firstName: e.target.value })
 }
 />
 <Input
 label="Last Name"
 placeholder="Doe"
 value={customer.lastName}
 onChange={(e) =>
 setCustomer({ ...customer, lastName: e.target.value })
 }
 />
 <Input
 label="Email Address"
 type="email"
 placeholder="john@example.com"
 value={customer.email}
 onChange={(e) =>
 setCustomer({ ...customer, email: e.target.value })
 }
 />
 <Input
 label="Phone Number"
 placeholder="+233 54 123 4567"
 value={customer.phone}
 onChange={(e) =>
 setCustomer({ ...customer, phone: e.target.value })
 }
 />
 </div>
 <div className="space-y-4">
 <Input
 label="Street Address"
 placeholder="123 Main St"
 value={customer.address}
 onChange={(e) =>
 setCustomer({ ...customer, address: e.target.value })
 }
 />
 <div className="grid sm:grid-cols-2 gap-4">
 <Input
 label="City"
 placeholder="Accra"
 value={customer.city}
 onChange={(e) =>
 setCustomer({ ...customer, city: e.target.value })
 }
 />
 <Input
 label="Region"
 placeholder="Greater Accra"
 value={customer.region}
 onChange={(e) =>
 setCustomer({ ...customer, region: e.target.value })
 }
 />
 </div>
 </div>
 </Card>

 {/* Items */}
 <Card className="bg-slate-900 border-white/5 p-6 space-y-6">
 <div className="flex items-center justify-between pb-4 border-b border-white/5">
 <h2 className="text-lg font-bold text-white">Items</h2>
 <Button
 variant="outline"
 size="sm"
 onClick={handleAddCustomItem}
 className="border-white/10 text-emerald-400 hover:bg-emerald-500/10"
 >
 <Plus className="w-4 h-4 mr-2" /> Add Custom Item
 </Button>
 </div>

 {/* Product Search */}
 <div className="relative">
 <Input
 placeholder="Search products to add..."
 leftIcon={<Search className="w-4 h-4" />}
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="bg-slate-950 border-white/10"
 />
 {searchQuery && products.length > 0 && (
 <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-white/10 rounded shadow-md z-50 max-h-60 overflow-y-auto">
 {isLoadingProducts ? (
 <div className="p-4 text-center text-slate-400">
 <Loader2 className="w-5 h-5 animate-spin mx-auto" />
 </div>
 ) : (
 products.map((product) => (
 <button
 key={product.id}
 onClick={() => handleAddProduct(product)}
 className="w-full text-left p-3 hover:bg-white/5 flex items-center gap-3 border-b border-white/5 last:border-0"
 >
 <div className="w-10 h-10 bg-slate-700 rounded overflow-hidden shrink-0">
 {product.image && (
 <img
 src={product.image}
 alt={product.name}
 className="w-full h-full object-cover"
 />
 )}
 </div>
 <div>
 <p className="text-sm font-bold text-white truncate">
 {product.name}
 </p>
 <p className="text-xs text-emerald-400">
 GH₵{product.price.toLocaleString()}
 </p>
 </div>
 <Plus className="w-4 h-4 ml-auto text-slate-500" />
 </button>
 ))
 )}
 </div>
 )}
 </div>

 {/* Items List */}
 <div className="space-y-4">
 {items.length === 0 ? (
 <div className="text-center py-8 text-slate-500 border border-dashed border-white/10 rounded">
 No items added yet.
 </div>
 ) : (
 items.map((item) => (
 <div
 key={item.id}
 className="bg-slate-950/50 p-4 rounded border border-white/5 flex gap-4 items-start"
 >
 <div className="flex-1 space-y-2">
 <Input
 value={item.name}
 onChange={(e) =>
 updateItem(item.id, "name", e.target.value)
 }
 className="bg-transparent border-transparent text-white font-bold px-0 h-auto focus:ring-0 focus:border-white/10 placeholder:text-slate-600"
 placeholder="Item Name"
 disabled={item.type === "product"}
 />
 <div className="flex gap-4">
 <div className="w-24">
 <Label className="text-[10px] text-slate-500 uppercase">
 Price
 </Label>
 <Input
 type="number"
 value={item.price}
 onChange={(e) =>
 updateItem(
 item.id,
 "price",
 Number(e.target.value),
 )
 }
 className="h-8 bg-slate-900 border-white/10"
 />
 </div>
 <div className="w-24">
 <Label className="text-[10px] text-slate-500 uppercase">
 Qty
 </Label>
 <Input
 type="number"
 min={1}
 value={item.quantity}
 onChange={(e) =>
 updateItem(
 item.id,
 "quantity",
 Number(e.target.value),
 )
 }
 className="h-8 bg-slate-900 border-white/10"
 />
 </div>
 </div>
 </div>
 <div className="text-right">
 <p className="text-sm font-bold text-white mb-2">
 GH₵{(item.price * item.quantity).toLocaleString()}
 </p>
 <Button
 variant="ghost"
 size="icon"
 onClick={() => removeItem(item.id)}
 className="h-8 w-8 text-rose-400 hover:bg-rose-500/10"
 >
 <Trash2 className="w-4 h-4" />
 </Button>
 </div>
 </div>
 ))
 )}
 </div>
 </Card>
 </div>

 {/* Sidebar Summary */}
 <div className="space-y-6">
 <Card className="bg-slate-900 border-white/5 p-6 sticky top-24">
 <h3 className="text-lg font-bold text-white mb-6">Summary</h3>
 <div className="space-y-3 mb-6">
 <div className="flex justify-between text-sm text-slate-400">
 <span>Subtotal</span>
 <span>GH₵{totalAmount.toLocaleString()}</span>
 </div>
 <div className="flex justify-between text-sm text-slate-400">
 <span>Tax (0%)</span>
 <span>GH₵0.00</span>
 </div>
 <div className="border-t border-white/10 pt-3 flex justify-between items-center">
 <span className="font-bold text-white">Total</span>
 <span className="text-2xl font-bold text-emerald-400">
 GH₵{totalAmount.toLocaleString()}
 </span>
 </div>
 </div>

 <Button
 onClick={handleSubmit}
 disabled={createOrderMutation.isPending || items.length === 0}
 className={cn(
 "w-full font-bold h-10 text-slate-100",
 mode === "invoice"
 ? "bg-emerald-600 hover:bg-emerald-500"
 : "bg-blue-600 hover:bg-blue-500",
 )}
 >
 {createOrderMutation.isPending ? (
 <Loader2 className="w-5 h-5 animate-spin mx-auto" />
 ) : (
 <>
 <CheckCircle2 className="w-5 h-5 mr-2" />
 Create {mode === "invoice" ? "Invoice" : "Quote"}
 </>
 )}
 </Button>
 </Card>
 </div>
 </div>
 </div>
 </AdminLayout>
 );
}
