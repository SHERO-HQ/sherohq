"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { authFetch, handleResponse, API_BASE } from "@/services/api";
import { getErrorMessage } from "@/utils/error";
import { format, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import type { DateRange } from "react-day-picker";
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/exportUtils";
import type { Expense } from "./ExpensesTable";

export function useAdminExpenses() {
  const { addNotification } = useNotifications();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [customRange, setCustomRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 7)),
    to: new Date(),
  });

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Other",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
  });
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

  const handleOpenForm = (expense?: Expense) => {
    setErrors({});
    if (expense) {
      setEditingId(expense.id);
      setFormData({
        title: expense.title,
        amount: expense.amount.toString(),
        category: expense.category,
        date: format(new Date(expense.date), "yyyy-MM-dd"),
        description: expense.description || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        amount: "",
        category: "Other",
        date: format(new Date(), "yyyy-MM-dd"),
        description: "",
      });
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
        body: JSON.stringify(formData),
      });

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
        method: "DELETE",
      });
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

  const handleExport = (fmt: "csv" | "excel" | "pdf") => {
    const data = filteredExpenses.map((e) => ({
      Title: e.title,
      Amount: e.amount,
      Category: e.category,
      Date: e.date,
      Description: e.description || "",
    }));

    const fileName = `SHERO-Expenses-${new Date().toISOString().split("T")[0]}`;
    const columns = ["Title", "Amount", "Category", "Date", "Description"];

    if (fmt === "csv")
      exportToCSV(data as Record<string, unknown>[], fileName);
    else if (fmt === "excel")
      exportToExcel(data as Record<string, unknown>[], fileName);
    else
      exportToPDF(
        data as Record<string, unknown>[],
        columns,
        fileName,
        "Expenses Report",
      );
  };

  return {
    expenses,
    isLoading,
    isDeleting,
    mounted,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    dateFilter,
    setDateFilter,
    customRange,
    setCustomRange,
    isFormOpen,
    isSaving,
    editingId,
    formData,
    setFormData,
    errors,
    deleteConfirmId,
    setDeleteConfirmId,
    filteredExpenses,
    totalAmount,
    handleOpenForm,
    handleCloseForm,
    handleSubmit,
    performDelete,
    handleExport,
  };
}
