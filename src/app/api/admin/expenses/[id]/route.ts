import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
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

    const result = await db.execute(sql`
      UPDATE expenses
      SET title = ${title},
          amount = ${amount},
          category = ${category},
          date = ${date},
          description = ${description || null}
      WHERE id = ${id}
      RETURNING *
    `);
    
    const rows = (result.rows || result) as Record<string, unknown>[];
    if (rows.length === 0) {
      return apiResponse.error("Expense not found", 404);
    }

    await logActivity(
      admin.id,
      "expense_update",
      "warning",
      `Updated expense: ${title}`,
    );

    return apiResponse.success(rows[0]);
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

    const result = await db.execute(sql`
      DELETE FROM expenses
      WHERE id = ${id}
      RETURNING title, amount
    `);

    const rows = (result.rows || result) as Record<string, unknown>[];
    if (rows.length === 0) {
      return apiResponse.error("Expense not found", 404);
    }

    const expense = rows[0];
    await logActivity(
      admin.id,
      "expense_delete",
      "warning",
      `Deleted expense: ${expense.title} (${expense.amount})`,
    );

    return apiResponse.success({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete expense error:", error);
    return apiResponse.error("Failed to delete expense");
  }
}
