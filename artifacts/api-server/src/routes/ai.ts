import { Router } from "express";
import { db } from "@workspace/db";
import { conversationsTable, aiMessagesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth";

const router = Router();
router.use(authMiddleware);

function toConversation(c: any) {
  return {
    id: c.id, userId: c.userId, title: c.title, model: c.model,
    createdAt: c.createdAt.toISOString(), updatedAt: c.updatedAt.toISOString()
  };
}

function toMessage(m: any) {
  return {
    id: m.id, conversationId: m.conversationId, role: m.role,
    content: m.content, fileData: m.fileData ?? null,
    createdAt: m.createdAt.toISOString()
  };
}

router.get("/conversations", async (req, res) => {
  const { userId } = (req as any).user;
  const conversations = await db.select().from(conversationsTable)
    .where(eq(conversationsTable.userId, userId));
  res.json(conversations.map(toConversation));
});

router.post("/conversations", async (req, res) => {
  const { userId } = (req as any).user;
  const { title, model } = req.body;
  if (!title || !model) { res.status(400).json({ error: "Missing fields" }); return; }
  const [conv] = await db.insert(conversationsTable)
    .values({ userId, title, model }).returning();
  res.status(201).json(toConversation(conv));
});

router.get("/conversations/:id", async (req, res) => {
  const { userId } = (req as any).user;
  const id = parseInt(req.params.id);
  const [conv] = await db.select().from(conversationsTable)
    .where(and(eq(conversationsTable.id, id), eq(conversationsTable.userId, userId)));
  if (!conv) { res.status(404).json({ error: "Not found" }); return; }
  const messages = await db.select().from(aiMessagesTable)
    .where(eq(aiMessagesTable.conversationId, id));
  res.json({ ...toConversation(conv), messages: messages.map(toMessage) });
});

router.delete("/conversations/:id", async (req, res) => {
  const { userId } = (req as any).user;
  const id = parseInt(req.params.id);
  await db.delete(conversationsTable)
    .where(and(eq(conversationsTable.id, id), eq(conversationsTable.userId, userId)));
  res.json({ message: "Deleted" });
});

router.post("/chat", async (req, res) => {
  const { userId } = (req as any).user;
  const { conversationId, message, model, fileData, fileName } = req.body;
  if (!conversationId || !message || !model) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }
  const [conv] = await db.select().from(conversationsTable)
    .where(and(eq(conversationsTable.id, conversationId), eq(conversationsTable.userId, userId)));
  if (!conv) { res.status(404).json({ error: "Conversation not found" }); return; }

  await db.insert(aiMessagesTable).values({
    conversationId, role: "user", content: message, fileData: fileData || null
  });

  let aiContent = "";
  try {
    const { default: Anthropic } = await import("@anthropic-ai/sdk");
    const client = new Anthropic();
    const allMessages = await db.select().from(aiMessagesTable)
      .where(eq(aiMessagesTable.conversationId, conversationId));

    const msgs: any[] = allMessages.map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

    let systemPrompt = "أنت مساعد ذكاء اصطناعي متقدم لمنصة المطور. أجب باللغة العربية دائماً وكن دقيقاً ومفيداً. عند شرح الأكواد الطويلة، اشرح كل قسم بالتفصيل.";
    if (fileData && fileName) {
      systemPrompt += ` تم رفع الملف: ${fileName}. محتوى الملف مرفق في الرسالة.`;
    }

    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 8192,
      system: systemPrompt,
      messages: msgs
    });
    aiContent = (response.content[0] as any).text;
  } catch (err) {
    req.log.error(err);
    aiContent = "عذراً، حدث خطأ في الاتصال بنموذج الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.";
  }

  const [aiMsg] = await db.insert(aiMessagesTable).values({
    conversationId, role: "assistant", content: aiContent
  }).returning();

  await db.update(conversationsTable)
    .set({ updatedAt: new Date() })
    .where(eq(conversationsTable.id, conversationId));

  res.json({ message: toMessage(aiMsg), conversationId });
});

export default router;
