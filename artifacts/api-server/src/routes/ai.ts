import { Router } from "express";
import { db } from "@workspace/db";
import { conversationsTable, aiMessagesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authMiddleware } from "../middlewares/auth";

const router = Router();
router.use(authMiddleware);

const OPENROUTER_MODELS = [
  "moonshotai/kimi-k2",
  "moonshotai/kimi-k2.5",
  "moonshotai/kimi-k2.6",
  "moonshotai/kimi-latest",
  "moonshotai/kimi-k2-thinking",
];

const ANTHROPIC_MODELS = [
  "claude-opus-4-5",
  "claude-3-5-sonnet-20241022",
  "claude-3-haiku-20240307",
];

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

  let userContent = message;
  if (fileData && fileName) {
    userContent = `${message}\n\n[الملف المرفق: ${fileName}]\n${fileData.substring(0, 50000)}`;
  }

  await db.insert(aiMessagesTable).values({
    conversationId, role: "user", content: message, fileData: fileData || null
  });

  const allMessages = await db.select().from(aiMessagesTable)
    .where(eq(aiMessagesTable.conversationId, conversationId));

  const msgs = allMessages.map(m => ({
    role: m.role as "user" | "assistant",
    content: m.role === "user" && m.id === allMessages[allMessages.length - 1]?.id ? userContent : m.content
  }));

  const systemPrompt = `أنت مساعد ذكاء اصطناعي متقدم لمنصة المطور للأتمتة. أجب دائماً باللغة العربية. كن دقيقاً ومفيداً.
عند شرح الأكواد الطويلة (حتى 10000 سطر أو أكثر)، اشرح كل قسم بالتفصيل في رد واحد متكامل.
استخدم تنسيق Markdown: \`\`\`language للأكواد، **للنص الغامق**، - للقوائم.`;

  let aiContent = "";

  try {
    if (OPENROUTER_MODELS.includes(model)) {
      const { openrouter } = await import("@workspace/integrations-openrouter-ai");
      const response = await openrouter.chat.completions.create({
        model,
        max_tokens: 8192,
        messages: [
          { role: "system", content: systemPrompt },
          ...msgs
        ],
      });
      aiContent = response.choices[0]?.message?.content || "لم يتم الحصول على رد من النموذج.";
    } else {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic();
      const claudeModel = ANTHROPIC_MODELS.includes(model) ? model : "claude-opus-4-5";
      const response = await client.messages.create({
        model: claudeModel,
        max_tokens: 8192,
        system: systemPrompt,
        messages: msgs
      });
      aiContent = (response.content[0] as any).text;
    }
  } catch (err: any) {
    req.log.error({ err }, "AI chat error");
    aiContent = `عذراً، حدث خطأ في الاتصال بنموذج الذكاء الاصطناعي (${model}). يرجى المحاولة مرة أخرى أو اختيار نموذج آخر.`;
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
