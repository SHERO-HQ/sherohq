"use client";

import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, DollarSign, Tag, TrendingUp } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ExpensesTable } from "@/components/admin/expenses/ExpensesTable";
import { ExpenseFormModal } from "@/components/admin/expenses/ExpenseFormModal";
import { ExpensesFilters } from "@/components/admin/expenses/ExpensesFilters";
import { useAdminExpenses } from "@/components/admin/expenses/useAdminExpenses";

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
  const {
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
  } = useAdminExpenses();

  return (
    <div className="space-y-6">
      {/* Header */}
      <AdminPageHeader
        title="Expenses"
        description="Track your business spending and overheads"
        icon={DollarSign}
      >
        <Button
          onClick={() => handleOpenForm()}
          className="bg-brand-secondary-600 hover:bg-brand-secondary-500 text-foreground font-bold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </AdminPageHeader>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/40 border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-brand-secondary-500/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-brand-secondary-500" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Total Expenses
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                GHS
                {totalAmount.toLocaleString("en-GH", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-card/40 border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-blue-500/10 flex items-center justify-center">
              <Tag className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Items Count
              </p>
              <p className="text-2xl font-bold text-foreground mt-1">
                {filteredExpenses.length} Records
              </p>
            </div>
          </div>
        </Card>
        <Card className="bg-card/40 border-border p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-purple-500/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">
                Top Category
              </p>
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
      <ExpensesFilters
        search={search}
        setSearch={setSearch}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        customRange={customRange}
        setCustomRange={setCustomRange}
        categories={CATEGORIES}
        handleExport={handleExport}
      />

      {/* Expenses List */}
      <ExpensesTable
        isLoading={isLoading}
        filteredExpenses={filteredExpenses}
        handleOpenForm={handleOpenForm}
        setDeleteConfirmId={setDeleteConfirmId}
        isDeleting={isDeleting}
      />

      {/* Form Modal */}
      <ExpenseFormModal
        isFormOpen={isFormOpen}
        mounted={mounted}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        isSaving={isSaving}
        categories={CATEGORIES}
        handleCloseForm={handleCloseForm}
        handleSubmit={handleSubmit}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmId &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 select-none">
            <Card className="w-full max-w-sm bg-card border border-rose-500/20 shadow-2xl p-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto text-rose-500">
                <Trash2 className="w-5 h-5 stroke-[2px]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">
                  Delete Expense Record?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Are you sure you want to permanently delete this expense
                  record? This action is irreversible.
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
          </div>,
          document.body,
        )}
    </div>
  );
}
