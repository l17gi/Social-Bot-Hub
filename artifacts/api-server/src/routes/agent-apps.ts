import { Router } from "express";
import { db } from "@workspace/db";
import { agentAppsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth";

const router = Router();
router.use(authMiddleware);

function toApp(a: any) {
  return {
    id: a.id, userId: a.userId, name: a.name, description: a.description ?? null,
    instructions: a.instructions, model: a.model, tools: a.tools || [],
    isPublic: a.isPublic, usageCount: a.usageCount,
    createdAt: a.createdAt.toISOString(), updatedAt: a.updatedAt.toISOString()
  };
}

router.get("/", async (req, res) => {
  const { userId } = (req as any).user;
  const apps = await db.select().from(agentAppsTable).where(eq(agentAppsTable.userId, userId));
  res.json(apps.map(toApp));
});

router.post("/", async (req, res) => {
  const { userId } = (req as any).user;
  const { name, description, instructions, model, tools, isPublic } = req.body;
  if (!name || !instructions || !model) { res.status(400).json({ error: "Missing fields" }); return; }
  const [app] = await db.insert(agentAppsTable).values({
    userId, name, description, instructions, model, tools: tools || [], isPublic: isPublic ?? false, usageCount: 0
  }).returning();
  res.status(201).json(toApp(app));
});

router.get("/:id", async (req, res) => {
  const { userId } = (req as any).user;
  const id = parseInt(req.params.id);
  const [app] = await db.select().from(agentAppsTable)
    .where(and(eq(agentAppsTable.id, id), eq(agentAppsTable.userId, userId)));
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toApp(app));
});

router.patch("/:id", async (req, res) => {
  const { userId } = (req as any).user;
  const id = parseInt(req.params.id);
  const { name, description, instructions, model, tools, isPublic } = req.body;
  const update: any = { updatedAt: new Date() };
  if (name !== undefined) update.name = name;
  if (description !== undefined) update.description = description;
  if (instructions !== undefined) update.instructions = instructions;
  if (model !== undefined) update.model = model;
  if (tools !== undefined) update.tools = tools;
  if (isPublic !== undefined) update.isPublic = isPublic;
  const [updated] = await db.update(agentAppsTable).set(update)
    .where(and(eq(agentAppsTable.id, id), eq(agentAppsTable.userId, userId)))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toApp(updated));
});

router.delete("/:id", async (req, res) => {
  const { userId } = (req as any).user;
  const id = parseInt(req.params.id);
  await db.delete(agentAppsTable).where(
    and(eq(agentAppsTable.id, id), eq(agentAppsTable.userId, userId))
  );
  res.json({ message: "Deleted" });
});

export default router;
