import { useState, useRef, useEffect } from "react";
import {
  useGetConversations,
  useCreateConversation,
  useGetConversation,
  useSendAiMessage,
  useDeleteConversation,
  getGetConversationsQueryKey,
  getGetConversationQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Plus, Trash2, Send, Paperclip, Loader2, Bot, User, X, FileIcon, Copy, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// @ts-ignore
import ReactMarkdown from "react-markdown";

const models = [
  { value: "moonshotai/kimi-k2", label: "Kimi K2", badge: "جديد", badgeColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { value: "google/gemini-2.0-flash-001", label: "Gemini 2.0 Flash", badge: "سريع", badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "claude-opus-4-5", label: "Claude Opus 4.5", badge: "", badgeColor: "" },
  { value: "claude-3-5-sonnet-20241022", label: "Claude Sonnet 3.5", badge: "", badgeColor: "" },
];

function getModelDisplay(modelValue: string) {
  const m = models.find(m => m.value === modelValue || modelValue?.includes(m.value.split("/").pop() || ""));
  if (m) return m;
  if (modelValue?.includes("kimi")) return { label: "Kimi K2", badge: "جديد", badgeColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" };
  if (modelValue?.includes("gemini")) return { label: "Gemini", badge: "مجاني", badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
  if (modelValue?.includes("claude")) return { label: "Claude", badge: "", badgeColor: "" };
  return { label: modelValue || "AI", badge: "", badgeColor: "" };
}

function CodeBlock({ children, ...props }: any) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, "");
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">كود</span>
        <button onClick={handleCopy} className="p-1 hover:bg-white/10 rounded-md transition-colors">
          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-white/40" />}
        </button>
      </div>
      <pre className="p-4 bg-[#050810] overflow-x-auto text-xs font-mono text-blue-100" {...props}>
        <code>{children}</code>
      </pre>
    </div>
  );
}

export default function AI() {
  const { data: conversations, isLoading: conversationsLoading } = useGetConversations();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("moonshotai/kimi-k2");
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!activeId && conversations && conversations.length > 0) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  const { data: activeConv, isLoading: convLoading } = useGetConversation(
    activeId!,
    { query: { enabled: !!activeId, queryKey: getGetConversationQueryKey(activeId!) } }
  );

  const createMutation = useCreateConversation({
    mutation: {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: getGetConversationsQueryKey() });
        setActiveId(data.id);
        setSidebarOpen(false);
      }
    }
  });

  const sendMutation = useSendAiMessage({
    mutation: {
      onSuccess: () => {
        if (activeId) queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(activeId) });
        setFileData(null); setFileName(null);
      },
      onError: (error) => {
        toast({ variant: "destructive", title: "حدث خطأ", description: error.message });
      }
    }
  });

  const deleteMutation = useDeleteConversation({
    mutation: {
      onSuccess: () => {
        toast({ title: "تم الحذف" });
        queryClient.invalidateQueries({ queryKey: getGetConversationsQueryKey() });
        setActiveId(null);
      }
    }
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !fileData) || !activeId) return;
    sendMutation.mutate({
      data: {
        conversationId: activeId,
        message: input || " ",
        model: activeConv?.model || model,
        fileData: fileData || undefined,
        fileName: fileName || undefined
      }
    });
    setInput("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ variant: "destructive", title: "الملف كبير جداً", description: "يجب أن يكون أقل من 5 ميجابايت" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => { setFileData(ev.target?.result as string); setFileName(file.name); };
    reader.readAsDataURL(file);
  };

  const createNew = () => {
    createMutation.mutate({ data: { title: `محادثة ${(conversations?.length || 0) + 1}`, model } });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages, sendMutation.isPending]);

  const currentModelInfo = getModelDisplay(activeConv?.model || model);

  return (
    <div className="flex h-[calc(100dvh-8rem)] rounded-2xl overflow-hidden border border-white/5 bg-card/20 backdrop-blur-3xl shadow-2xl relative">

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <div className={`
        absolute md:relative z-30 md:z-auto
        w-72 h-full md:flex flex-col bg-[#0a0e1a]/90 md:bg-white/5 border-l border-white/5
        transition-transform duration-300
        ${sidebarOpen ? "flex translate-x-0" : "hidden md:flex"}
      `}>
        <div className="p-4 border-b border-white/5 space-y-3">
          <div className="flex items-center justify-between md:block">
            <h3 className="font-black text-white text-sm">المحادثات</h3>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 text-muted-foreground hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <Button onClick={createNew} disabled={createMutation.isPending} className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg h-10 rounded-xl text-sm">
            <Plus className="w-4 h-4 ml-2" /> محادثة جديدة
          </Button>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="bg-white/5 border-white/10 h-10 rounded-xl text-white text-xs">
              <SelectValue placeholder="اختر النموذج" />
            </SelectTrigger>
            <SelectContent className="bg-[#0d1226] border-white/10">
              {models.map(m => (
                <SelectItem key={m.value} value={m.value} className="text-white focus:bg-white/10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span className="text-xs">{m.label}</span>
                    {m.badge && <span className={`text-[9px] px-1.5 py-0.5 rounded border font-black ${m.badgeColor}`}>{m.badge}</span>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {conversationsLoading ? (
            <div className="p-4 text-center text-muted-foreground animate-pulse text-sm">جاري التحميل...</div>
          ) : conversations?.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground/60 text-xs">لا توجد محادثات. ابدأ محادثة جديدة!</div>
          ) : conversations?.map(conv => {
            const info = getModelDisplay(conv.model);
            return (
              <div
                key={conv.id}
                onClick={() => { setActiveId(conv.id); setSidebarOpen(false); }}
                className={`p-3 rounded-xl cursor-pointer flex justify-between items-center group transition-all ${
                  activeId === conv.id ? "bg-primary text-white shadow-lg" : "hover:bg-white/5 text-muted-foreground hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="truncate text-xs font-bold block">{conv.title}</span>
                    <span className={`text-[10px] opacity-60 ${activeId === conv.id ? "text-white" : "text-muted-foreground"}`}>{info.label}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate({ id: conv.id }); }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-all flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-transparent to-[#0a0e1a]/40">
        {!activeId ? (
          <div className="flex-1 flex items-center justify-center flex-col text-muted-foreground p-8 text-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 border-2 border-primary/20 border-dashed rounded-full flex items-center justify-center mb-6">
              <Bot className="w-10 h-10 text-primary" />
            </motion.div>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-2">مرحباً في المساعد الذكي</h2>
            <p className="max-w-sm text-sm mb-6">اختر محادثة أو ابدأ واحدة جديدة</p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Button onClick={createNew} className="bg-primary text-white rounded-2xl h-11 px-6">
                <Plus className="w-4 h-4 ml-2" /> محادثة جديدة
              </Button>
              <Button variant="ghost" onClick={() => setSidebarOpen(true)} className="md:hidden border border-white/10 rounded-2xl h-11 px-6 text-white">
                عرض المحادثات
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-4 sm:px-6 py-4 border-b border-white/5 bg-white/5 flex justify-between items-center backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 rounded-xl hover:bg-white/10 text-muted-foreground hover:text-white transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </button>
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-white text-sm truncate">{activeConv?.title || "جاري التحميل..."}</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-primary font-bold">{currentModelInfo.label}</span>
                    {currentModelInfo.badge && (
                      <span className={`text-[9px] px-1.5 rounded border font-black ${currentModelInfo.badgeColor}`}>{currentModelInfo.badge}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth">
              {convLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-sm font-bold text-muted-foreground">جاري التحميل...</span>
                </div>
              ) : (
                <AnimatePresence>
                  {activeConv?.messages?.map((msg, i) => (
                    <motion.div
                      key={msg.id || i}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""} max-w-[90%] sm:max-w-[80%] ${msg.role === "user" ? "mr-auto" : "ml-auto"}`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === "user" ? "bg-primary" : "bg-purple-600"}`}>
                        {msg.role === "user" ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                      </div>
                      <div className={`p-4 rounded-2xl shadow-xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary/10 border border-primary/20 text-white rounded-tr-sm"
                          : "bg-white/5 border border-white/10 text-white/90 rounded-tl-sm"
                      }`}>
                        {msg.role === "assistant" ? (
                          <div className="prose prose-invert prose-sm prose-p:leading-relaxed max-w-none">
                            <ReactMarkdown components={{ code: CodeBlock }}>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {sendMutation.isPending && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 max-w-[80%] ml-auto">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white flex-shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-sm flex items-center gap-1.5">
                        {[0, 0.2, 0.4].map((delay, i) => (
                          <span key={i} className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${delay}s`}} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 sm:p-5 bg-white/5 backdrop-blur-xl border-t border-white/5">
              <form onSubmit={handleSend} className="max-w-4xl mx-auto space-y-2">
                <AnimatePresence>
                  {fileName && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/20 text-primary border border-primary/30 text-xs font-bold">
                      <FileIcon className="w-3 h-3" />{fileName}
                      <button type="button" onClick={() => { setFileData(null); setFileName(null); }}><X className="w-3 h-3" /></button>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="flex gap-2">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,.pdf,.txt,.js,.ts,.py,.md,.json" />
                  <Button type="button" variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 w-11 h-11 rounded-xl bg-white/5 border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/50">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="اسأل أي شيء..."
                    className="flex-1 h-11 bg-white/5 border-white/10 rounded-xl focus:border-primary/50 text-white"
                    disabled={sendMutation.isPending}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(e as any); } }}
                  />
                  <Button type="submit" disabled={(!input.trim() && !fileData) || sendMutation.isPending}
                    className="w-11 h-11 rounded-xl bg-primary text-white hover:bg-primary/90 shrink-0 shadow-lg shadow-primary/20">
                    {sendMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 rtl:-scale-x-100" />}
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
