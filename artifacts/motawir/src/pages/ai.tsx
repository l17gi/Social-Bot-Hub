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
import { MessageSquare, Plus, Trash2, Send, Paperclip, Loader2, Bot, User, X, FileIcon, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// @ts-ignore
import ReactMarkdown from "react-markdown";

const models = [
  { value: "moonshotai/kimi-k2", label: "Kimi K2 ✦", badge: "جديد", color: "text-yellow-500" },
  { value: "claude-opus-4-5", label: "Claude Opus 4.5", badge: "", color: "" },
  { value: "claude-3-5-sonnet-20241022", label: "Claude Sonnet 3.5", badge: "", color: "" },
  { value: "gpt-4o", label: "GPT-4o", badge: "", color: "" },
];

function CodeBlock({ children, ...props }: any) {
  const [copied, setCopied] = useState(false);
  const code = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Code Block</span>
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // If no active conversation but we have conversations, select the first one
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
      }
    }
  });

  const sendMutation = useSendAiMessage({
    mutation: {
      onSuccess: () => {
        if (activeId) {
          queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(activeId) });
        }
        setFileData(null);
        setFileName(null);
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
        message: input,
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

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFileData(base64);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const createNew = () => {
    createMutation.mutate({ data: { title: "محادثة جديدة", model } });
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages, sendMutation.isPending]);

  return (
    <div className="h-[calc(100vh-10rem)] flex rounded-[2rem] overflow-hidden border border-white/5 bg-card/20 backdrop-blur-3xl shadow-2xl relative">
      {/* Sidebar / Conversation List */}
      <div className="w-80 border-l border-white/5 flex flex-col bg-white/5">
        <div className="p-6 border-b border-white/5 flex flex-col gap-4">
          <Button onClick={createNew} disabled={createMutation.isPending} className="w-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 h-12 rounded-2xl">
            <Plus className="w-5 h-5 ml-2" /> محادثة جديدة
          </Button>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="bg-white/5 border-white/10 h-11 rounded-xl text-white">
              <SelectValue placeholder="اختر النموذج" />
            </SelectTrigger>
            <SelectContent className="bg-card border-white/10">
              {models.map(m => (
                <SelectItem key={m.value} value={m.value}>
                  <div className="flex items-center gap-2">
                    <span className={m.color}>{m.label}</span>
                    {m.badge && <span className="text-[8px] bg-yellow-500/20 text-yellow-500 px-1 rounded font-black">{m.badge}</span>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversationsLoading ? (
            <div className="p-4 text-center text-muted-foreground animate-pulse">جاري التحميل...</div>
          ) : conversations?.map(conv => (
            <div 
              key={conv.id}
              onClick={() => setActiveId(conv.id)}
              className={`p-4 rounded-2xl cursor-pointer flex justify-between items-center group transition-all ${
                activeId === conv.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-white/5 text-muted-foreground hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-sm font-bold">{conv.title}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteMutation.mutate({ id: conv.id }); }}
                className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all ${deleteMutation.isPending ? 'opacity-50' : ''}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative bg-gradient-to-b from-transparent to-[#0a0e1a]/40">
        {!activeId ? (
          <div className="flex-1 flex items-center justify-center flex-col text-muted-foreground p-8 text-center">
            <div className="relative mb-8">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-2 border-primary/20 border-dashed rounded-full scale-150" />
              <Bot className="w-24 h-24 text-primary relative z-10" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">مرحباً بك في المساعد الذكي</h2>
            <p className="max-w-sm">اختر محادثة من القائمة أو ابدأ واحدة جديدة لاستكشاف قدرات الذكاء الاصطناعي الخارقة</p>
          </div>
        ) : (
          <>
            <div className="px-8 py-5 border-b border-white/5 bg-white/5 flex justify-between items-center backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-white">{activeConv?.title || "جاري التحميل..."}</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-primary font-bold uppercase tracking-tighter">{activeConv?.model}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
              {convLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <span className="text-sm font-bold text-muted-foreground">جاري استرجاع الرسائل...</span>
                </div>
              ) : (
                <AnimatePresence>
                  {activeConv?.messages?.map((msg, i) => (
                    <motion.div
                      key={msg.id || i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                    >
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                        msg.role === 'user' ? 'bg-primary text-white' : 'bg-purple-600 text-white'
                      }`}>
                        {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                      </div>
                      <div className={`p-5 rounded-[2rem] shadow-xl ${
                        msg.role === 'user' 
                          ? 'bg-primary/10 border border-primary/20 text-white rounded-tr-sm' 
                          : 'bg-white/5 border border-white/10 text-white/90 rounded-tl-sm'
                      }`}>
                        <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#050810] max-w-none">
                          <ReactMarkdown components={{ code: CodeBlock }}>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {sendMutation.isPending && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[85%] ml-auto flex-row-reverse">
                      <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center text-white"><Bot className="w-5 h-5" /></div>
                      <div className="p-5 rounded-[2rem] bg-white/5 border border-white/10 text-foreground rounded-tl-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 bg-white/5 backdrop-blur-xl border-t border-white/5">
              <form onSubmit={handleSend} className="max-w-4xl mx-auto space-y-4">
                <AnimatePresence>
                  {fileName && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/20 text-primary border border-primary/30 text-xs font-bold"
                    >
                      <FileIcon className="w-3.5 h-3.5" />
                      {fileName}
                      <button type="button" onClick={() => { setFileData(null); setFileName(null); }} className="hover:text-white transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="flex gap-3">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    className="hidden" 
                    accept="image/*,.pdf,.txt,.js,.ts,.py,.md" 
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon" 
                    onClick={() => fileInputRef.current?.click()}
                    className="shrink-0 w-14 h-14 rounded-2xl bg-white/5 border-white/10 hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-all"
                  >
                    <Paperclip className="w-6 h-6" />
                  </Button>
                  <div className="relative flex-1">
                    <Input 
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="اسأل المساعد الذكي أو ارفع ملفاً..."
                      className="h-14 bg-white/5 border-white/10 rounded-2xl focus:border-primary/50 focus:ring-primary/20 transition-all text-white pr-6"
                      disabled={sendMutation.isPending}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={(!input.trim() && !fileData) || sendMutation.isPending} 
                    className="w-14 h-14 rounded-2xl bg-primary text-white hover:bg-primary/90 shrink-0 shadow-lg shadow-primary/20 transition-all"
                  >
                    {sendMutation.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 rtl:-scale-x-100" />}
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
