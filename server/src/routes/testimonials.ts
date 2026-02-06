import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { query } from "../db/database";
import { adminAuth } from "../middleware/adminAuth";

const router = Router();

// GET all testimonials (Public)
router.get("/", async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM testimonials WHERE active = true ORDER BY "order" ASC, "createdAt" DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching testimonials:", err);
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
});

// GET all testimonials for admin (Admin only)
router.get("/admin", adminAuth, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM testimonials ORDER BY "order" ASC, "createdAt" DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching admin testimonials:", err);
    res.status(500).json({ error: "Failed to fetch admin testimonials" });
  }
});

// POST create new testimonial (Admin only)
router.post("/", adminAuth, async (req, res) => {
  const { quote, author, role, company, image, order, active } = req.body;

  if (!quote || !author) {
    return res.status(400).json({ error: "Quote and author are required" });
  }

  try {
    const id = uuidv4();
    const result = await query(
      `INSERT INTO testimonials (id, quote, author, role, company, image, "order", active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [id, quote, author, role, company, image, order || 0, active !== false],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating testimonial:", err);
    res.status(500).json({ error: "Failed to create testimonial" });
  }
});

// PUT update testimonial (Admin only)
router.put("/:id", adminAuth, async (req, res) => {
  const { id } = req.params;
  const { quote, author, role, company, image, order, active } = req.body;

  try {
    const check = await query("SELECT * FROM testimonials WHERE id = $1", [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: "Testimonial not found" });
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (quote !== undefined) {
      fields.push(`quote = $${idx++}`);
      values.push(quote);
    }
    if (author !== undefined) {
      fields.push(`author = $${idx++}`);
      values.push(author);
    }
    if (role !== undefined) {
      fields.push(`role = $${idx++}`);
      values.push(role);
    }
    if (company !== undefined) {
      fields.push(`company = $${idx++}`);
      values.push(company);
    }
    if (image !== undefined) {
      fields.push(`image = $${idx++}`);
      values.push(image);
    }
    if (order !== undefined) {
      fields.push(`"order" = $${idx++}`);
      values.push(order);
    }
    if (active !== undefined) {
      fields.push(`active = $${idx++}`);
      values.push(active);
    }

    if (fields.length === 0) {
      return res.json(check.rows[0]);
    }

    values.push(id);
    const result = await query(
      `UPDATE testimonials SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
      values,
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating testimonial:", err);
    res.status(500).json({ error: "Failed to update testimonial" });
  }
});

// DELETE testimonial (Admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      "DELETE FROM testimonials WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Testimonial not found" });
    }

    res.json({ message: "Testimonial deleted successfully" });
  } catch (err) {
    console.error("Error deleting testimonial:", err);
    res.status(500).json({ error: "Failed to delete testimonial" });
  }
});

export default router;
