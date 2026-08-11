"use client";

import { useState, useMemo } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { useDialog } from "@/hooks/useDialog";
import { getErrorMessage } from "@/utils/error";
import { ADMIN_POLLING_INTERVAL } from "@/constants/admin";
import type { Product } from "@/types/product";
import { formatCurrency } from "@/utils/format";
import { useAdminUser } from "@/hooks/queries/useAdminQuery";
import { exportToCSV, exportToExcel, exportToPDF } from "@/utils/exportUtils";
import {
  useProducts,
  useDeleteProduct,
  useUpdateProductStock,
} from "@/hooks/queries/useProducts";
import { useCategories } from "@/hooks/queries/useCategories";

export function useAdminProducts() {
  const { addNotification } = useNotifications();
  const dialog = useDialog();
  const { data: adminData } = useAdminUser();
  const currentAdmin = adminData?.admin;
  const canDelete = !["clerk", "attendant"].includes(currentAdmin?.role || "");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    data: allProducts = [],
    isLoading: productsLoading,
    isPlaceholderData,
    refetch: refetchProducts,
    isFetching,
  } = useProducts(
    selectedCategory === "all" ? undefined : selectedCategory,
    search,
    ADMIN_POLLING_INTERVAL,
  );

  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  const deleteMutation = useDeleteProduct();
  const stockMutation = useUpdateProductStock();

  const isLoading = productsLoading || categoriesLoading;

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const stock = product.stockQuantity ?? product.quantity ?? 0;
      if (stockFilter === "low") return stock > 0 && stock <= 5;
      if (stockFilter === "out") return stock === 0;
      return true;
    });
  }, [allProducts, stockFilter]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleDelete = async (id: string) => {
    const confirmed = await dialog.confirm({
      title: "Delete Product",
      message: "Are you sure you want to delete this product?",
      type: "error",
      confirmText: "Delete",
    });
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(id);
      addNotification("Success", "Product deleted successfully", "success");
    } catch (err) {
      addNotification(
        "Error",
        getErrorMessage(err, "Failed to delete product"),
        "error",
      );
    }
  };

  const handleToggleStock = async (product: Product) => {
    try {
      let newQuantity = 0;

      if (!product.inStock) {
        const input = await dialog.prompt({
          title: "Update Stock Quantity",
          message: "Enter the stock quantity for this product:",
          defaultValue: "1",
        });
        if (input === null || input.trim() === "") return;

        newQuantity = parseInt(input, 10);
        if (isNaN(newQuantity) || newQuantity <= 0) {
          addNotification(
            "Error",
            "Please enter a valid number greater than 0",
            "error",
          );
          return;
        }
      }

      await stockMutation.mutateAsync({
        id: product.id,
        quantity: newQuantity,
      });
      addNotification(
        "Success",
        `Product marked as ${newQuantity > 0 ? "in stock" : "out of stock"}`,
        "success",
      );
    } catch (err) {
      addNotification(
        "Error",
        getErrorMessage(err, "Failed to update stock"),
        "error",
      );
    }
  };

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    const dataToExport = filteredProducts.map((p) => ({
      ID: p.id,
      Name: p.name,
      Category: p.category,
      Price: formatCurrency(p.price),
      Stock: p.quantity ?? 0,
      Status: (p.quantity ?? 0) > 0 ? "In Stock" : "Out of Stock",
    }));

    const fileName = `SHERO-Products-${new Date().toISOString().split("T")[0]}`;
    const columns = ["ID", "Name", "Category", "Price", "Stock", "Status"];

    if (format === "csv") await exportToCSV(dataToExport, fileName);
    else if (format === "excel") await exportToExcel(dataToExport, fileName);
    else await exportToPDF(dataToExport, columns, fileName, "Products Report");

    addNotification(
      "Export",
      `Products exported as ${format.toUpperCase()}`,
      "success",
    );
  };

  return {
    canDelete,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    stockFilter,
    setStockFilter,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    allProducts,
    categories,
    isLoading,
    isPlaceholderData,
    refetchProducts,
    isFetching,
    filteredProducts,
    totalPages,
    paginatedProducts,
    handleDelete,
    handleToggleStock,
    handleExport,
  };
}
