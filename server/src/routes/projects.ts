import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import db from "../db/database";
import { adminAuth, AdminRequest } from "../middleware/adminAuth";
import { logActivity } from "./activity";

const router = Router();

// Database row type for projects
interface ProjectRow {
  id: string;
  title: string;
  category: string;
  client: string | null;
  description: string | null;
  useCase: string | null;
  technologies: string | null;
  image: string | null;
  link: string | null;
  createdAt: Date;
}

// Helper to parse JSON fields
function parseProject(row: ProjectRow) {
  const safeParse = (val: unknown): unknown => {
    if (!val) return null;
    if (typeof val !== "string") return val;
    try {
      return JSON.parse(val);
    } catch (e) {
      console.error("Failed to parse JSON technologies:", e);
      return val;
    }
  };

  return {
    ...row,
    technologies: safeParse(row.technologies) || [],
  };
}

// GET /api/projects - List all projects
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    let queryText = "SELECT * FROM projects";
    const params: string[] = [];

    if (category && category !== "All") {
      queryText += " WHERE category = $1";
      params.push(category as string);
    }

    queryText += ' ORDER BY "createdAt" DESC';

    const result = await db.query(queryText, params);
    const projects = result.rows as ProjectRow[];
    res.json(projects.map(parseProject));
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// GET /api/projects/:id - Get single project
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await db.query("SELECT * FROM projects WHERE id = $1", [id]);
    const project = result.rows[0] as ProjectRow | undefined;

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(parseProject(project));
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// ============ ADMIN ROUTES (Protected) ============

// POST /api/projects - Create new project
router.post("/", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const {
      title,
      category,
      client,
      description,
      useCase,
      technologies,
      image,
      link,
    } = req.body;

    if (!title || !category) {
      return res.status(400).json({ error: "Title and category are required" });
    }

    const projectId = uuidv4();

    await db.query(
      `
      INSERT INTO projects (id, title, category, client, description, "useCase", technologies, image, link)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
      [
        projectId,
        title,
        category,
        client || null,
        description || null,
        useCase || null,
        technologies ? JSON.stringify(technologies) : JSON.stringify([]),
        image || null,
        link || null,
      ],
    );

    if (req.admin?.id) {
      await logActivity(
        req.admin.id,
        "project_create",
        "success",
        `Created project: ${title}`,
      );
    }

    const result = await db.query("SELECT * FROM projects WHERE id = $1", [
      projectId,
    ]);
    const project = result.rows[0] as ProjectRow;

    res.status(201).json({
      success: true,
      project: parseProject(project),
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// PUT /api/projects/:id - Update project
router.put("/:id", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      client,
      description,
      useCase,
      technologies,
      image,
      link,
    } = req.body;

    const check = await db.query("SELECT id FROM projects WHERE id = $1", [id]);
    if (check.rowCount === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    await db.query(
      `
      UPDATE projects SET 
        title = $1,
        category = $2,
        client = $3,
        description = $4,
        "useCase" = $5,
        technologies = $6,
        image = $7,
        link = $8
      WHERE id = $9
    `,
      [
        title,
        category,
        client,
        description,
        useCase,
        technologies ? JSON.stringify(technologies) : JSON.stringify([]),
        image,
        link,
        id,
      ],
    );

    if (req.admin?.id) {
      await logActivity(
        req.admin.id,
        "project_update",
        "info",
        `Updated project: ${title} (ID: ${id})`,
      );
    }

    const result = await db.query("SELECT * FROM projects WHERE id = $1", [id]);
    const project = result.rows[0] as ProjectRow;

    res.json({
      success: true,
      project: parseProject(project),
    });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// DELETE /api/projects/:id - Delete project
router.delete("/:id", adminAuth, async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;

    const result = await db.query("SELECT title FROM projects WHERE id = $1", [
      id,
    ]);
    const existing = result.rows[0];

    if (!existing) {
      return res.status(404).json({ error: "Project not found" });
    }

    await db.query("DELETE FROM projects WHERE id = $1", [id]);

    if (req.admin?.id) {
      await logActivity(
        req.admin.id,
        "project_delete",
        "warning",
        `Deleted project: ${existing.title} (ID: ${id})`,
      );
    }

    res.json({
      success: true,
      message: `Project "${existing.title}" deleted`,
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
