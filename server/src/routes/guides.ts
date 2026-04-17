import { Router } from "express";
import { query } from "../db/database";
import { v4 as uuidv4 } from "uuid";
import { adminAuth } from "../middleware/adminAuth";
import { validateBody } from "../middleware/validate";
import { CreateGuideSchema, UpdateGuideSchema } from "../schemas";

const router = Router();

// Helper to create URL-friendly slug
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// GET /api/guides - List all published guides (public)
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    let sql = `
      SELECT g.*, au.username as "authorName"
      FROM support_guides g
      LEFT JOIN admin_users au ON g."authorId" = au.id
      WHERE g.published = true
    `;
    const params: string[] = [];

    if (category && (category === "hardware" || category === "software")) {
      sql += ` AND g.category = $1`;
      params.push(category);
    }

    sql += ` ORDER BY g."createdAt" DESC`;

    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching guides:", error);
    res.status(500).json({ error: "Failed to fetch guides" });
  }
});

// GET /api/guides/admin - List all guides for admin (requires auth)
router.get("/admin", adminAuth, async (req, res) => {
  try {
    const result = await query(`
      SELECT g.*, au.username as "authorName"
      FROM support_guides g
      LEFT JOIN admin_users au ON g."authorId" = au.id
      ORDER BY g."createdAt" DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching admin guides:", error);
    res.status(500).json({ error: "Failed to fetch guides" });
  }
});

// GET /api/guides/:slug - Get single guide by slug (public)
router.get("/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await query(
      `
      SELECT g.*, au.username as "authorName"
      FROM support_guides g
      LEFT JOIN admin_users au ON g."authorId" = au.id
      WHERE g.slug = $1
    `,
      [slug],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Guide not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching guide:", error);
    res.status(500).json({ error: "Failed to fetch guide" });
  }
});

// POST /api/guides - Create new guide (admin only)
router.post("/", adminAuth, validateBody(CreateGuideSchema), async (req, res) => {
  try {
    const {
      title,
      content,
      summary,
      category,
      coverImage,
      published,
      authorId,
    } = req.body;


    const id = uuidv4();
    let slug = createSlug(title);

    // Check if slug exists and make it unique
    const existing = await query(
      "SELECT id FROM support_guides WHERE slug = $1",
      [slug],
    );
    if (existing.rows.length > 0) {
      slug = `${slug}-${Date.now()}`;
    }

    await query(
      `INSERT INTO support_guides (id, title, slug, content, summary, category, "authorId", "coverImage", published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        title,
        slug,
        content,
        summary || "",
        category,
        authorId || null,
        coverImage || null,
        published ?? false,
      ],
    );

    const result = await query("SELECT * FROM support_guides WHERE id = $1", [
      id,
    ]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating guide:", error);
    res.status(500).json({ error: "Failed to create guide" });
  }
});

// PUT /api/guides/:id - Update guide (admin only)
router.put("/:id", adminAuth, validateBody(UpdateGuideSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, summary, category, coverImage, published } =
      req.body;

    // Check if guide exists
    const existing = await query("SELECT * FROM support_guides WHERE id = $1", [
      id,
    ]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Guide not found" });
    }

    // Update slug if title changed
    let slug = existing.rows[0].slug;
    if (title && title !== existing.rows[0].title) {
      slug = createSlug(title);
      const slugCheck = await query(
        "SELECT id FROM support_guides WHERE slug = $1 AND id != $2",
        [slug, id],
      );
      if (slugCheck.rows.length > 0) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    await query(
      `UPDATE support_guides
       SET title = COALESCE($1, title),
           slug = $2,
           content = COALESCE($3, content),
           summary = COALESCE($4, summary),
           category = COALESCE($5, category),
           "coverImage" = COALESCE($6, "coverImage"),
           published = COALESCE($7, published),
           "updatedAt" = CURRENT_TIMESTAMP
       WHERE id = $8`,
      [title, slug, content, summary, category, coverImage, published, id],
    );

    const result = await query("SELECT * FROM support_guides WHERE id = $1", [
      id,
    ]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating guide:", error);
    res.status(500).json({ error: "Failed to update guide" });
  }
});

// DELETE /api/guides/:id - Delete guide (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await query("SELECT * FROM support_guides WHERE id = $1", [
      id,
    ]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Guide not found" });
    }

    await query("DELETE FROM support_guides WHERE id = $1", [id]);
    res.json({ message: "Guide deleted successfully" });
  } catch (error) {
    console.error("Error deleting guide:", error);
    res.status(500).json({ error: "Failed to delete guide" });
  }
});

export default router;
