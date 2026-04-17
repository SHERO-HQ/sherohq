import { Router } from "express";
import { v4 as uuidv4 } from "uuid";
import { query } from "../db/database";
import { adminAuth, requireAnyRole } from "../middleware/adminAuth";
import { validateBody } from "../middleware/validate";
import { CreateTeamMemberSchema, UpdateTeamMemberSchema } from "../schemas";

const router = Router();

// GET all team members
router.get("/", async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM team_members ORDER BY "order" ASC, "createdAt" DESC`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching team members:", err);
    res.status(500).json({ error: "Failed to fetch team members" });
  }
});

// POST create new team member (Admin only - SuperAdmin or Admin)
router.post(
  "/",
  adminAuth,
  requireAnyRole(["superadmin", "admin"]),
  validateBody(CreateTeamMemberSchema),
  async (req, res) => {
    const { name, role, bio, image, social, order } = req.body;

    try {
      const id = uuidv4();
      const result = await query(
        `INSERT INTO team_members (id, name, role, bio, image, social, "order")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
        [id, name, role, bio, image, JSON.stringify(social || {}), order || 0],
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Error creating team member:", err);
      res.status(500).json({ error: "Failed to create team member" });
    }
  },
);

// PUT update team member (Admin only - SuperAdmin or Admin)
router.put(
  "/:id",
  adminAuth,
  requireAnyRole(["superadmin", "admin"]),
  validateBody(UpdateTeamMemberSchema),
  async (req, res) => {
    const { id } = req.params;
    const { name, role, bio, image, social, order } = req.body;

    try {
      // Check if exists
      const check = await query("SELECT * FROM team_members WHERE id = $1", [
        id,
      ]);
      if (check.rows.length === 0) {
        return res.status(404).json({ error: "Team member not found" });
      }

      // Dynamic update query
      const fields: string[] = [];
      const values: unknown[] = [];
      let idx = 1;

      if (name !== undefined) {
        fields.push(`name = $${idx++}`);
        values.push(name);
      }
      if (role !== undefined) {
        fields.push(`role = $${idx++}`);
        values.push(role);
      }
      if (bio !== undefined) {
        fields.push(`bio = $${idx++}`);
        values.push(bio);
      }
      if (image !== undefined) {
        fields.push(`image = $${idx++}`);
        values.push(image);
      }
      if (social !== undefined) {
        fields.push(`social = $${idx++}`);
        values.push(JSON.stringify(social));
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
        `UPDATE team_members SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
        values,
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error updating team member:", err);
      res.status(500).json({ error: "Failed to update team member" });
    }
  },
);

// DELETE team member (Admin only - SuperAdmin or Admin)
router.delete(
  "/:id",
  adminAuth,
  requireAnyRole(["superadmin", "admin"]),
  async (req, res) => {
    const { id } = req.params;

    try {
      const result = await query(
        "DELETE FROM team_members WHERE id = $1 RETURNING id",
        [id],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Team member not found" });
      }

      res.json({ message: "Team member deleted successfully" });
    } catch (err) {
      console.error("Error deleting team member:", err);
      res.status(500).json({ error: "Failed to delete team member" });
    }
  },
);

export default router;
