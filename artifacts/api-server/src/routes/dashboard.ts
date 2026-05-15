import { Router } from "express";
import { db } from "@workspace/db";
import { socialAccountsTable, automationsTable, conversationsTable, agentAppsTable, activityTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth";

const router = Router();
router.use(authMiddleware);

router.get("/summary", async (req, res) => {
  const { userId } = (req as any).user;
  const [accounts, autos, convos, apps] = await Promise.all([
    db.select().from(socialAccountsTable).where(eq(socialAccountsTable.userId, userId)),
    db.select().from(automationsTable).where(eq(automationsTable.userId, userId)),
    db.select().from(conversationsTable).where(eq(conversationsTable.userId, userId)),
    db.select().from(agentAppsTable).where(eq(agentAppsTable.userId, userId)),
  ]);
  const telegram = accounts.filter(a => a.platform === "telegram");
  const facebook = accounts.filter(a => a.platform === "facebook");
  const instagram = accounts.filter(a => a.platform === "instagram");
  const active = accounts.filter(a => a.isActive);
  const activeAutos = autos.filter(a => a.status === "running");
  const totalMsgs = autos.reduce((s, a) => s + a.messagesSent, 0);
  res.json({
    totalSocialAccounts: accounts.length,
    activeSocialAccounts: active.length,
    activeAutomations: activeAutos.length,
    totalMessagesSent: totalMsgs,
    aiConversations: convos.length,
    agentApps: apps.length,
    telegramAccounts: telegram.length,
    facebookAccounts: facebook.length,
    instagramAccounts: instagram.length
  });
});

router.get("/activity", async (req, res) => {
  const { userId } = (req as any).user;
  const items = await db.select().from(activityTable)
    .where(eq(activityTable.userId, userId))
    .orderBy(desc(activityTable.createdAt))
    .limit(20);
  res.json(items.map(a => ({
    id: a.id, type: a.type, description: a.description,
    platform: a.platform ?? null, createdAt: a.createdAt.toISOString()
  })));
});

export default router;
