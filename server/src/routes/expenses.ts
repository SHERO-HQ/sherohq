import express from "express";
import db from "../db/database";
import { adminAuth, AdminRequest, requireRole } from "../middleware/adminAuth";
import { v4 as uuidv4 } from "uuid";

import { validateBody } from "../middleware/validate";
import { CreateExpenseSchema, UpdateExpenseSchema } from "../schemas";

const router = express.Router();

// GET /api/expenses - Get all expenses (Admin)
router.get(
  "/",
  adminAuth,
  requireRole("manager"),
  async (req: AdminRequest, res: express.Response) => {
  try {
    const { startDate, endDate, category } = req.query;

    let query = "SELECT * FROM expenses";
    const params: string[] = [];
    const conditions: string[] = [];

    if (startDate && endDate) {
      conditions.push(
        `date >= $${params.length + 1} AND date <= $${params.length + 2}`,
      );
      params.push(startDate as string, endDate as string);
    }

    if (category && category !== "all") {
      conditions.push(`category = $${params.length + 1}`);
      params.push(category as string);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY date DESC";

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// POST /api/expenses - Create new expense (Admin)
router.post(
  "/",
  adminAuth,
  requireRole("manager"),
  validateBody(CreateExpenseSchema),
  async (req: AdminRequest, res: express.Response) => {
    try {
      const { title, amount, category, date, description } = req.body;
      const adminId = req.admin?.id;

      const result = await db.query(
        'INSERT INTO expenses (id, title, amount, category, date, description, "adminId") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [
          uuidv4(),
          title,
          amount,
          category,
          new Date(date),
          description || null,
          adminId || null,
        ],
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(500).json({ error: "Failed to create expense" });
    }
  },
);

// PATCH /api/expenses/:id - Update expense (Admin)
router.patch(
  "/:id",
  adminAuth,
  requireRole("manager"),
  validateBody(UpdateExpenseSchema),
  async (req: AdminRequest, res: express.Response) => {
    try {
      const { id } = req.params;
      const { title, amount, category, date, description } = req.body;

      const result = await db.query(
        `UPDATE expenses 
       SET title = COALESCE($1, title), 
           amount = COALESCE($2, amount), 
           category = COALESCE($3, category), 
           date = COALESCE($4, date), 
           description = COALESCE($5, description)
       WHERE id = $6 RETURNING *`,
        [
          title,
          amount,
          category,
          date ? new Date(date) : null,
          description,
          id,
        ],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Expense not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating expense:", error);
      res.status(500).json({ error: "Failed to update expense" });
    }
  },
);

// DELETE /api/expenses/:id - Delete expense (Admin)
router.delete(
  "/:id",
  adminAuth,
  requireRole("admin"),
  async (req: AdminRequest, res: express.Response) => {
    try {
      const { id } = req.params;
      const result = await db.query("DELETE FROM expenses WHERE id = $1", [id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Expense not found" });
      }

      res.json({ success: true, message: "Expense deleted successfully" });
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ error: "Failed to delete expense" });
    }
  },
);

export default router;
