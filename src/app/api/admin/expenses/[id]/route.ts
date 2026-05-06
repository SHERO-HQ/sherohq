import { NextRequest } from "next/server";
import { query } from "@/lib/db";
import { getAdminFromSession } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import { apiResponse } from "@/lib/api-utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { id } = await params;
    const { title, amount, category, date, description } = await request.json();

    const result = await query(
      `UPDATE expenses
       SET title = $1,
           amount = $2,
           category = $3,
           date = $4,
           description = $5
       WHERE id = $6
       RETURNING *`,
      [title, amount, category, date, description || null, id],
    );

    if (result.rows.length === 0) {
      return apiResponse.error("Expense not found", 404);
    }

    await logActivity(admin.id, "expense_update", "warning", `Updated expense: ${title}`);

    return apiResponse.success(result.rows[0]);
  } catch (error) {
    console.error("Update expense error:", error);
    return apiResponse.error("Failed to update expense");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAdminFromSession();
    if (!admin) return apiResponse.unauthorized();

    const { id } = await params;

    const result = await query(
      `DELETE FROM expenses
       WHERE id = $1
       RETURNING title, amount`,
      [id],
    );

    if (result.rows.length === 0) {
      return apiResponse.error("Expense not found", 404);
    }

    const expense = result.rows[0];
    await logActivity(admin.id, "expense_delete", "warning", `Deleted expense: ${expense.title} (${expense.amount})`);

    return apiResponse.success({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete expense error:", error);
    return apiResponse.error("Failed to delete expense");
  }
}