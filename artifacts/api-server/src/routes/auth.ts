import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authMiddleware, signToken } from "../middlewares/auth";

const router = Router();

function toUser(user: any) {
  return {
    id: user.id, username: user.username, email: user.email,
    role: user.role, isActive: user.isActive, avatarUrl: user.avatarUrl,
    createdAt: user.createdAt.toISOString()
  };
}

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }
  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing.length > 0) {
      res.status(400).json({ error: "Email already registered" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({ username, email, passwordHash, role: "user" }).returning();
    const token = signToken({ userId: user.id, role: user.role });
    res.status(201).json({ user: toUser(user), token });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user) { res.status(401).json({ error: "Invalid credentials" }); return; }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) { res.status(401).json({ error: "Invalid credentials" }); return; }
    const token = signToken({ userId: user.id, role: user.role });
    res.json({ user: toUser(user), token });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  const { userId } = (req as any).user;
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) { res.status(401).json({ error: "User not found" }); return; }
    res.json(toUser(user));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/profile", authMiddleware, async (req, res) => {
  const { userId } = (req as any).user;
  const { username, avatarUrl, currentPassword, newPassword } = req.body;
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    const updates: any = {};
    if (username && username.trim()) updates.username = username.trim();
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;

    if (newPassword) {
      if (!currentPassword) { res.status(400).json({ error: "Current password required" }); return; }
      const valid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!valid) { res.status(400).json({ error: "Current password is incorrect" }); return; }
      updates.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updates).length === 0) {
      res.json(toUser(user));
      return;
    }

    const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();
    res.json(toUser(updated));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/logout", authMiddleware, async (_req, res) => {
  res.json({ message: "Logged out successfully" });
});

export default router;
