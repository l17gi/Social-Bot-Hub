import { Router } from "express";
import { db } from "@workspace/db";
import { automationsTable, activityTable } from "@workspace/db";
import { eq, and, count, sum } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth";

const router = Router();
router.use(authMiddleware);

function toAutomation(a: any) {
  return {
    id: a.id, userId: a.userId, socialAccountId: a.socialAccountId,
    name: a.name, type: a.type, status: a.status, config: a.config,
    messagesSent: a.messagesSent, targetGroups: a.targetGroups,
    aiModel: a.aiModel, createdAt: a.createdAt.toISOString(),
    lastRunAt: a.lastRunAt ? a.lastRunAt.toISOString() : null
  };
}

router.get("/stats/summary", async (req, res) => {
  const { userId } = (req as any).user;
  const all = await db.select().from(automationsTable).where(eq(automationsTable.userId, userId));
  const active = all.filter(a => a.status === "running");
  const totalMsgs = all.reduce((s, a) => s + a.messagesSent, 0);
  const successRate = all.length > 0 ? (active.length / all.length) * 100 : 0;
  res.json({ totalAutomations: all.length, activeAutomations: active.length, totalMessagesSent: totalMsgs, successRate });
});

router.get("/", async (req, res) => {
  const { userId } = (req as any).user;
  const automations = await db.select().from(automationsTable).where(eq(automationsTable.userId, userId));
  res.json(automations.map(toAutomation));
});

router.post("/", async (req, res) => {
  const { userId } = (req as any).user;
  const { socialAccountId, name, type, config, targetGroups, aiModel } = req.body;
  if (!socialAccountId || !name || !type) { res.status(400).json({ error: "Missing fields" }); return; }
  const [automation] = await db.insert(automationsTable).values({
    userId, socialAccountId, name, type, config: config || {}, targetGroups, aiModel, status: "stopped", messagesSent: 0
  }).returning();
  await db.insert(activityTable).values({
    userId, type: "automation_created", description: `تم إنشاء أتمتة جديدة: ${name}`, platform: null
  });
  res.status(201).json(toAutomation(automation));
});

router.get("/:id", async (req, res) => {
  const { userId } = (req as any).user;
  const id = parseInt(req.params.id);
  const [automation] = await db.select().from(automationsTable).where(
    and(eq(automationsTable.id, id), eq(automationsTable.userId, userId))
  );
  if (!automation) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toAutomation(automation));
});

router.patch("/:id", async (req, res) => {
  const { userId } = (req as any).user;
  const id = parseInt(req.params.id);
  const { name, type, config, targetGroups, aiModel, status } = req.body;
  const update: any = { updatedAt: new Date() };
  if (name !== undefined) update.name = name;
  if (type !== undefined) update.type = type;
  if (config !== undefined) update.config = config;
  if (targetGroups !== undefined) update.targetGroups = targetGroups;
  if (aiModel !== undefined) update.aiModel = aiModel;
  if (status !== undefined) update.status = status;
  const [updated] = await db.update(automationsTable).set(update)
    .where(and(eq(automationsTable.id, id), eq(automationsTable.userId, userId)))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toAutomation(updated));
});

router.delete("/:id", async (req, res) => {
  const { userId } = (req as any).user;
  const id = parseInt(req.params.id);
  await db.delete(automationsTable).where(
    and(eq(automationsTable.id, id), eq(automationsTable.userId, userId))
  );
  res.json({ message: "Deleted" });
});

router.post("/:id/start", async (req, res) => {
  const { userId } = (req as any).user;
  const id = parseInt(req.params.id);
  const [updated] = await db.update(automationsTable)
    .set({ status: "running", lastRunAt: new Date(), updatedAt: new Date() })
    .where(and(eq(automationsTable.id, id), eq(automationsTable.userId, userId)))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  await db.insert(activityTable).values({
    userId, type: "automation_started", description: `تم تشغيل أتمتة: ${updated.name}`, platform: null
  });
  res.json(toAutomation(updated));
});

router.post("/:id/stop", async (req, res) => {
  const { userId } = (req as any).user;
  const id = parseInt(req.params.id);
  const [updated] = await db.update(automationsTable)
    .set({ status: "stopped", updatedAt: new Date() })
    .where(and(eq(automationsTable.id, id), eq(automationsTable.userId, userId)))
    .returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toAutomation(updated));
});

export default router;
