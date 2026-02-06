import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { query } from "../db/database";
import { adminAuth } from "../middleware/adminAuth";

const router = Router();

// GET all stats (Public)
router.get("/", async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM site_stats ORDER BY "order" ASC, "createdAt" DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching site stats:", err);
    res.status(500).json({ error: "Failed to fetch site stats" });
  }
});

// POST create new stat (Admin only)
router.post("/", adminAuth, async (req, res) => {
  const { label, value, suffix, prefix, icon, color, order } = req.body;

  if (!label || !value) {
    return res.status(400).json({ error: "Label and value are required" });
  }

  try {
    const id = uuidv4();
    const result = await query(
      `INSERT INTO site_stats (id, label, value, suffix, prefix, icon, color, "order")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, label, value, suffix, prefix, icon, color, order || 0],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating site stat:", err);
    res.status(500).json({ error: "Failed to create site stat" });
  }
});

// PUT update stat (Admin only)
router.put("/:id", adminAuth, async (req, res) => {
  const { id } = req.params;
  const { label, value, suffix, prefix, icon, color, order } = req.body;

  try {
    const check = await query("SELECT * FROM site_stats WHERE id = $1", [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Site stat not found" });
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (label !== undefined) {
      fields.push(`label = $${idx++}`);
      values.push(label);
    }
    if (value !== undefined) {
      fields.push(`value = $${idx++}`);
      values.push(value);
    }
    if (suffix !== undefined) {
      fields.push(`suffix = $${idx++}`);
      values.push(suffix);
    }
    if (prefix !== undefined) {
      fields.push(`prefix = $${idx++}`);
      values.push(prefix);
    }
    if (icon !== undefined) {
      fields.push(`icon = $${idx++}`);
      values.push(icon);
    }
    if (color !== undefined) {
      fields.push(`color = $${idx++}`);
      values.push(color);
    }
    if (order !== undefined) {
      fields.push(`"order" = $${idx++}`);
      values.push(order);
    }

    if (fields.length === 0) {
      return res.json(check.rows[0]);
    }

    values.push(id);
    const result = await query(
      `UPDATE site_stats SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values,
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating site stat:", err);
    res.status(500).json({ error: "Failed to update site stat" });
  }
});

// DELETE stat (Admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      "DELETE FROM site_stats WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Site stat not found" });
    }

    res.json({ message: "Site stat deleted successfully" });
  } catch (err) {
    console.error("Error deleting site stat:", err);
    res.status(500).json({ error: "Failed to delete site stat" });
  }
});

export default router;
