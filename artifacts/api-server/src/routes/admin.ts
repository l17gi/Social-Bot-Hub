import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, socialAccountsTable, automationsTable, conversationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, adminMiddleware } from "../middlewares/auth";

const router = Router();
router.use(authMiddleware, adminMiddleware);

function toUser(u: any) {
  return { id: u.id, username: u.username, email: u.email, role: u.role, isActive: u.isActive, avatarUrl: u.avatarUrl ?? null, createdAt: u.createdAt.toISOString() };
}

router.get("/users", async (_req, res) => {
  const users = await db.select().from(usersTable);
  res.json(users.map(toUser));
});

router.patch("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { username, email, role, isActive } = req.body;
  const update: any = { updatedAt: new Date() };
  if (username !== undefined) update.username = username;
  if (email !== undefined) update.email = email;
  if (role !== undefined) update.role = role;
  if (isActive !== undefined) update.isActive = isActive;
  const [updated] = await db.update(usersTable).set(update).where(eq(usersTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toUser(updated));
});

router.delete("/users/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.json({ message: "Deleted" });
});

router.get("/stats", async (_req, res) => {
  const [users, accounts, autos, convos] = await Promise.all([
    db.select().from(usersTable),
    db.select().from(socialAccountsTable),
    db.select().from(automationsTable),
    db.select().from(conversationsTable),
  ]);
  const activeUsers = users.filter(u => u.isActive);
  const totalMsgs = autos.reduce((s, a) => s + a.messagesSent, 0);
  const platforms = accounts.reduce((acc, a) => {
    acc[a.platform] = (acc[a.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  res.json({
    totalUsers: users.length,
    activeUsers: activeUsers.length,
    totalSocialAccounts: accounts.length,
    totalAutomations: autos.length,
    totalMessages: totalMsgs,
    totalAiConversations: convos.length,
    platformBreakdown: platforms
  });
});

router.get("/social-accounts", async (_req, res) => {
  const accounts = await db.select().from(socialAccountsTable);
  res.json(accounts.map(a => ({
    id: a.id, userId: a.userId, platform: a.platform, accountName: a.accountName,
    phoneNumber: a.phoneNumber, isActive: a.isActive, status: a.status,
    avatarUrl: a.avatarUrl, followersCount: a.followersCount,
    createdAt: a.createdAt.toISOString()
  })));
});

export default router;
