"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import { } from "@/context/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getErrorMessage } from "@/utils/error";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Download,
  DollarSign,
  Tag,
  FileText,
  Loader2,
  X,
  Calendar as CalendarIcon} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/useNotifications";
import { authFetch, handleResponse, API_BASE } from "@/services/api";
import {
  format,
  startOfDay,
  endOfDay,
  isWithinInterval,
  parse} from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/exportUtils";

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description: string | null;
  adminId: string | null;
  createdAt: string;
}

// Sub-components used in this file
const Label = ({
  children,
  className}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <label className={cn("text-sm font-medium", className)}>{children}</label>
);

const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={cn(
      "flex min-h-20 w-full rounded border border-border bg-muted px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-secondary-500 disabled:cursor-not-allowed disabled:opacity-50",
      props.className,
    )}
  />
);

const Save = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const TrendingUp = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const CATEGORIES = [
  "Salary",
  "Rent",
  "Utilities",
  "Supplies",
  "Marketing",
  "Equipment",
  "Maintenance",
  "Transport",
  "Internet",
  "Other",
];

export default function AdminExpenses() {
  const { addNotification } = useNotifications();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all"); // 7d, 30d, all, range
  const [customRange, setCustomRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date()});

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Other",
    date: format(new Date(), "yyyy-MM-dd"),
    description: ""});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = new URLSearchParams();
      if (categoryFilter !== "all") query.append("category", categoryFilter);
      const queryString = query.toString();

      const response = await authFetch(
        `${API_BASE}/admin/expenses${queryString ? `?${queryString}` : ""}`,
      );
      const data = await handleResponse<Expense[]>(response);
      setExpenses(data);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
      addNotification(
        "Error",
        getErrorMessage(error, "Failed to load expenses"),
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter, addNotification]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch =
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.description?.toLowerCase().includes(search.toLowerCase());

      let matchesDate = true;
      if (dateFilter === "7d") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        matchesDate = new Date(e.date) >= sevenDaysAgo;
      } else if (dateFilter === "30d") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        matchesDate = new Date(e.date) >= thirtyDaysAgo;
      } else if (dateFilter === "range" && customRange?.from) {
        const expenseDate = new Date(e.date);
        const start = startOfDay(customRange.from);
        const end = customRange.to
          ? endOfDay(customRange.to)
          : endOfDay(customRange.from);
        matchesDate = isWithinInterval(expenseDate, { start, end });
      }

      return matchesSearch && matchesDate;
    });
  }, [expenses, search, dateFilter, customRange]);

  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  }, [filteredExpenses]);

  const parseDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    return parse(dateStr, "yyyy-MM-dd", new Date());
  };

  const handleOpenForm = (expense?: Expense) => {
    setErrors({});
    if (expense) {
      setEditingId(expense.id);
      setFormData({
        title: expense.title,
        amount: expense.amount.toString(),
        category: expense.category,
        date: format(new Date(expense.date), "yyyy-MM-dd"),
        description: expense.description || ""});
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        amount: "",
        category: "Other",
        date: format(new Date(), "yyyy-MM-dd"),
        description: ""});
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setErrors({});
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setErrors({});
    const newErrors: Record<string, string> = {};
    if (!formData.title?.trim()) {
      newErrors.title = "Expense title is required";
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    if (!formData.date) {
      newErrors.date = "Please select a date";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addNotification(
        "Validation Error",
        "Please check the highlighted fields on the form",
        "error",
      );
      return;
    }

    setIsSaving(true);
    try {
      const url = editingId
        ? `${API_BASE}/admin/expenses/${editingId}`
        : `${API_BASE}/admin/expenses`;
      const method = editingId ? "PATCH" : "POST";

      const response = await authFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)});

      await handleResponse(response);
      addNotification(
        "Success",
        `Expense ${editingId ? "updated" : "added"} successfully`,
        "success",
      );
      handleCloseForm();
      fetchExpenses();
    } catch (error) {
      console.error("Save failed:", error);
      addNotification(
        "Error",
        getErrorMessage(error, "Failed to save expense"),
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const performDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const response = await authFetch(`${API_BASE}/admin/expenses/${id}`, {
        method: "DELETE"});
      await handleResponse(response);
      addNotification("Success", "Expense deleted", "success");
      setExpenses(expenses.filter((e) => e.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      addNotification(
        "Error",
        getErrorMessage(error, "Failed to delete expense"),
        "error",
      );
    } finally {
      setIsDeleting(null);
    }
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    const data = filteredExpenses.map((e) => ({
      Title: e.title,
      Amount: e.amount,
      Category: e.category,
      Date: e.date,
      Description: e.description || ""}));

    const fileName = `SHERO-Expenses-${new Date().toISOString().split("T")[0]}`;
    const columns = ["Title", "Amount", "Category", "Date", "Description"];

    if (format === "csv")
      exportToCSV(data as Record<string, unknown>[], fileName);
    else if (format === "excel")
      exportToExcel(data as Record<string, unknown>[], fileName);
    else
      exportToPDF(
        data as Record<string, unknown>[],
        columns,
        fileName,
        "Expenses Report",
      );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground text-sm">
            Track your business spending and overheads
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => handleOpenForm()}
            className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground font-bold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/40  border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-brand-secondary-500/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-brand-secondary-500" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Total Expenses
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                GH₵{totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-card/40  border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-blue-500/10 flex items-center justify-center">
              <Tag className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Items Count</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {filteredExpenses.length} Records
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-card/40  border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">Top Category</p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {filteredExpenses.length > 0
                  ? filteredExpenses[0].category
                  : "N/A"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card/40  border-border p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/50 border-border text-foreground"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-muted/50 border border-border rounded text-sm text-foreground p-2"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <div className="flex bg-muted/50 border border-border rounded p-1 w-fit">
            {[
              { value: "all", label: "All" },
              { value: "7d", label: "7d" },
              { value: "30d", label: "30d" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDateFilter(opt.value)}
                className={cn(
                  "px-3 py-1 rounded text-xs font-medium transition",
                  dateFilter === opt.value
                    ? "bg-accent text-foreground shadow"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "bg-muted/50 border-border text-muted-foreground hover:text-foreground h-9 py-0",
                  dateFilter === "range" &&
                  "bg-accent text-foreground border-brand-secondary-500/50",
                )}
                onClick={() => setDateFilter("range")}
              >
                Range
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 dark border-border bg-card"
              align="end"
            >
              <Calendar
                mode="range"
                defaultMonth={customRange?.from}
                selected={customRange}
                onSelect={setCustomRange}
                numberOfMonths={1}
              />
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-2 md:justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="border-border text-muted-foreground hover:text-foreground py-0"
                >
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-card border-border"
              >
                <DropdownMenuItem
                  onClick={() => handleExport("csv")}
                  className="text-foreground hover:bg-accent gap-2"
                >
                  <FileText className="w-4 h-4" /> CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport("excel")}
                  className="text-foreground hover:bg-accent gap-2"
                >
                  <FileText className="w-4 h-4" /> Excel
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport("pdf")}
                  className="text-foreground hover:bg-accent gap-2"
                >
                  <FileText className="w-4 h-4" /> PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>

      {/* Expenses List */}
      <Card className="bg-card/40  border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase">
                  Expense
                </th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase">
                  Category
                </th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase">
                  Date
                </th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase text-right">
                  Amount
                </th>
                <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading &&
                ["sk1", "sk2", "sk3", "sk4", "sk5"].map((id) => (
                  <tr key={id} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8">
                      <div className="h-4 bg-muted rounded w-full" />
                    </td>
                  </tr>
                ))}

              {!isLoading && filteredExpenses.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-muted-foreground"
                  >
                    No expense records found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                filteredExpenses.length > 0 &&
                filteredExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="hover:bg-accent transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-foreground font-medium">
                            {expense.title}
                          </p>
                          {expense.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {expense.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className="bg-blue-500/10 text-blue-400 border-none px-2 py-0"
                      >
                        {expense.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {format(new Date(expense.date), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className="text-foreground font-bold">
                        GH₵{Number(expense.amount).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => handleOpenForm(expense)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-rose-400"
                          onClick={() => setDeleteConfirmId(expense.id)}
                          disabled={isDeleting === expense.id}
                        >
                          {isDeleting === expense.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Form Modal (Simple Overlay) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <Card className={cn(
            "w-full max-w-lg bg-card border shadow-2xl p-6 md:p-8 relative transition-all duration-300",
            Object.keys(errors).length > 0 ? "border-rose-500/30" : "border-border"
          )}>
            <button
              onClick={handleCloseForm}
              className="absolute right-4 top-4 p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-foreground mb-6">
              {editingId ? "Edit Expense" : "Add New Expense"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm font-medium">Title *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Office Rent - Feb"
                  className={cn(
                    "bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500",
                    errors.title && "border-rose-500 bg-rose-500/5 focus-visible:ring-rose-500"
                  )}
                  required
                />
                {errors.title && (
                  <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 opacity-100 mt-1">
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-sm font-medium">Amount (GH₵) *</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    placeholder="0.00"
                    className={cn(
                      "bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500 font-mono",
                      errors.amount && "border-rose-500 bg-rose-500/5 focus-visible:ring-rose-500"
                    )}
                    required
                  />
                  {errors.amount && (
                    <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 opacity-100 mt-1">
                      {errors.amount}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-muted-foreground text-sm font-medium">Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full bg-muted/50 border-border text-muted-foreground justify-start font-normal h-10 overflow-hidden focus-visible:ring-brand-secondary-500",
                          !formData.date && "text-muted-foreground",
                          errors.date && "border-rose-500 bg-rose-500/5"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-brand-secondary-500 shrink-0" />
                        <span className="truncate">
                          {formData.date
                            ? format(parseDate(formData.date), "PPP")
                            : "Pick a date"}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={parseDate(formData.date)}
                        onSelect={(date) =>
                          setFormData({
                            ...formData,
                            date: date ? format(date, "yyyy-MM-dd") : ""})
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.date && (
                    <p className="text-xs text-rose-400 animate-in slide-in-from-top-1 opacity-100 mt-1">
                      {errors.date}
                    </p>
                  )}
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm font-medium">Category *</Label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full bg-muted/50 border border-border rounded text-sm text-foreground h-10 px-3 focus:outline-none focus:ring-2 focus:ring-brand-secondary-500 transition-all duration-200 cursor-pointer"
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-card text-foreground">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="text-muted-foreground text-sm font-medium">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Additional expense notes..."
                  className="bg-muted/50 border-border text-foreground focus-visible:ring-brand-secondary-500"
                  rows={3}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 text-muted-foreground hover:text-foreground"
                  onClick={handleCloseForm}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground font-bold"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingId ? "Update" : "Save"} Record
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Modern Custom Delete Confirmation Overlay Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 select-none">
          <Card className="w-full max-w-sm bg-card border border-rose-500/20 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto text-rose-500">
              <Trash2 className="w-5 h-5 stroke-[2px]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">Delete Expense Record?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to permanently delete this expense record? This action is irreversible.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                className="flex-1 text-muted-foreground hover:text-foreground"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-foreground font-bold"
                onClick={async () => {
                  const id = deleteConfirmId;
                  setDeleteConfirmId(null);
                  await performDelete(id);
                }}
              >
                Delete Record
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
