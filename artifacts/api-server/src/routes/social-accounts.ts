import { Router } from "express";
import { db } from "@workspace/db";
import { socialAccountsTable, activityTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth";

const router = Router();
router.use(authMiddleware);

function toAccount(a: any) {
  return {
    id: a.id, userId: a.userId, platform: a.platform, accountName: a.accountName,
    phoneNumber: a.phoneNumber, isActive: a.isActive, status: a.status,
    avatarUrl: a.avatarUrl, followersCount: a.followersCount,
    createdAt: a.createdAt.toISOString()
  };
}

router.get("/", async (req, res) => {
  const { userId } = (req as any).user;
  const accounts = await db.select().from(socialAccountsTable).where(eq(socialAccountsTable.userId, userId));
  res.json(accounts.map(toAccount));
});

router.post("/telegram/request-otp", async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) { res.status(400).json({ error: "Phone number required" }); return; }
  const phoneCodeHash = `hash_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  res.json({ message: "OTP sent to your Telegram", phoneCodeHash });
});

router.post("/telegram/verify", async (req, res) => {
  const { userId } = (req as any).user;
  const { phoneNumber, phoneCode, phoneCodeHash } = req.body;
  if (!phoneNumber || !phoneCode || !phoneCodeHash) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }
  const count = await db.select().from(socialAccountsTable).where(
    and(eq(socialAccountsTable.userId, userId), eq(socialAccountsTable.platform, "telegram"))
  );
  if (count.length >= 3) {
    res.status(400).json({ error: "Maximum 3 Telegram accounts allowed" });
    return;
  }
  const [account] = await db.insert(socialAccountsTable).values({
    userId, platform: "telegram", accountName: phoneNumber,
    phoneNumber, status: "active", isActive: true
  }).returning();
  await db.insert(activityTable).values({
    userId, type: "account_added", description: `تم ربط حساب تيليغرام: ${phoneNumber}`, platform: "telegram"
  });
  res.status(201).json(toAccount(account));
});

router.post("/facebook", async (req, res) => {
  const { userId } = (req as any).user;
  const { username, password, accountName } = req.body;
  if (!username || !accountName) { res.status(400).json({ error: "Missing fields" }); return; }
  const count = await db.select().from(socialAccountsTable).where(
    and(eq(socialAccountsTable.userId, userId), eq(socialAccountsTable.platform, "facebook"))
  );
  if (count.length >= 3) {
    res.status(400).json({ error: "Maximum 3 Facebook accounts allowed" });
    return;
  }
  const [account] = await db.insert(socialAccountsTable).values({
    userId, platform: "facebook", accountName,
    accessToken: username, status: "active", isActive: true
  }).returning();
  await db.insert(activityTable).values({
    userId, type: "account_added", description: `تم ربط حساب فيسبوك: ${accountName}`, platform: "facebook"
  });
  res.status(201).json(toAccount(account));
});

router.post("/instagram", async (req, res) => {
  const { userId } = (req as any).user;
  const { username, password, accountName } = req.body;
  if (!username || !accountName) { res.status(400).json({ error: "Missing fields" }); return; }
  const count = await db.select().from(socialAccountsTable).where(
    and(eq(socialAccountsTable.userId, userId), eq(socialAccountsTable.platform, "instagram"))
  );
  if (count.length >= 3) {
    res.status(400).json({ error: "Maximum 3 Instagram accounts allowed" });
    return;
  }
  const [account] = await db.insert(socialAccountsTable).values({
    userId, platform: "instagram", accountName,
    accessToken: username, status: "active", isActive: true
  }).returning();
  await db.insert(activityTable).values({
    userId, type: "account_added", description: `تم ربط حساب إنستغرام: ${accountName}`, platform: "instagram"
  });
  res.status(201).json(toAccount(account));
});

router.get("/:id", async (req, res) => {
  const { userId } = (req as any).user;
  const id = parseInt(req.params.id);
  const [account] = await db.select().from(socialAccountsTable).where(
    and(eq(socialAccountsTable.id, id), eq(socialAccountsTable.userId, userId))
  );
  if (!account) { res.status(404).json({ error: "Not found" }); return; }
  res.json(toAccount(account));
});

router.delete("/:id", async (req, res) => {
  const { userId } = (req as any).user;
  const id = parseInt(req.params.id);
  await db.delete(socialAccountsTable).where(
    and(eq(socialAccountsTable.id, id), eq(socialAccountsTable.userId, userId))
  );
  res.json({ message: "Account deleted" });
});

router.post("/:id/toggle", async (req, res) => {
  const { userId } = (req as any).user;
  const id = parseInt(req.params.id);
  const [account] = await db.select().from(socialAccountsTable).where(
    and(eq(socialAccountsTable.id, id), eq(socialAccountsTable.userId, userId))
  );
  if (!account) { res.status(404).json({ error: "Not found" }); return; }
  const [updated] = await db.update(socialAccountsTable)
    .set({ isActive: !account.isActive, status: !account.isActive ? "active" : "paused" })
    .where(eq(socialAccountsTable.id, id))
    .returning();
  res.json(toAccount(updated));
});

export default router;
