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
import { MessageSquare, Plus, Trash2, Send, Paperclip, Loader2, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AI() {
  const { data: conversations, isLoading: conversationsLoading } = useGetConversations();
  const [activeId, setActiveId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [model, setModel] = useState("gpt-4o");
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
    { query: { enabled: !!activeId } }
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
    if (!input.trim() || !activeId) return;

    sendMutation.mutate({
      data: {
        conversationId: activeId,
        message: input,
        model: activeConv?.model || model
      }
    });
    setInput("");
  };

  const createNew = () => {
    createMutation.mutate({ data: { title: "محادثة جديدة", model } });
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages, sendMutation.isPending]);

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-2xl overflow-hidden border border-border/50 bg-card/30 backdrop-blur-md">
      
      {/* Sidebar / Conversation List */}
      <div className="w-80 border-l border-border/50 flex flex-col bg-card/40">
        <div className="p-4 border-b border-border/50 flex flex-col gap-4">
          <Button onClick={createNew} disabled={createMutation.isPending} className="w-full bg-primary/20 text-primary hover:bg-primary hover:text-white">
            <Plus className="w-4 h-4 ml-2" /> محادثة جديدة
          </Button>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="bg-background/50 border-border/50">
              <SelectValue placeholder="اختر النموذج" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
              <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversationsLoading ? (
            <div className="p-4 text-center text-muted-foreground animate-pulse">جاري التحميل...</div>
          ) : conversations?.map(conv => (
            <div 
              key={conv.id}
              onClick={() => setActiveId(conv.id)}
              className={`p-3 rounded-lg cursor-pointer flex justify-between items-center group transition-colors ${
                activeId === conv.id ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-muted-foreground hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="truncate text-sm font-medium">{conv.title}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteMutation.mutate({ id: conv.id }); }}
                className={`opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/20 hover:text-red-400 transition-all ${deleteMutation.isPending ? 'opacity-50' : ''}`}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative bg-[#0a0e1a]/80">
        {!activeId ? (
          <div className="flex-1 flex items-center justify-center flex-col text-muted-foreground">
            <Bot className="w-16 h-16 mb-4 opacity-50 text-primary" />
            <p>اختر محادثة أو ابدأ واحدة جديدة</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-border/50 bg-card/40 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-white">{activeConv?.title || "جاري التحميل..."}</h3>
                <span className="text-xs text-primary">{activeConv?.model}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {convLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : (
                <AnimatePresence>
                  {activeConv?.messages?.map((msg, i) => (
                    <motion.div
                      key={msg.id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'user' ? 'bg-primary text-white' : 'bg-purple-600 text-white'
                      }`}>
                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`p-4 rounded-2xl ${
                        msg.role === 'user' 
                          ? 'bg-primary/20 border border-primary/30 text-primary-foreground rounded-tr-sm' 
                          : 'bg-card border border-border/50 text-foreground rounded-tl-sm'
                      }`}>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </motion.div>
                  ))}
                  {sendMutation.isPending && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-[80%] ml-auto flex-row-reverse">
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white"><Bot className="w-4 h-4" /></div>
                      <div className="p-4 rounded-2xl bg-card border border-border/50 text-foreground rounded-tl-sm flex items-center gap-2">
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

            <div className="p-4 border-t border-border/50 bg-card/60">
              <form onSubmit={handleSend} className="flex gap-2">
                <Button type="button" variant="outline" size="icon" className="shrink-0 bg-background/50 border-border/50 hover:bg-primary/20 hover:text-primary">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input 
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="اسأل المساعد الذكي..."
                  className="bg-background/50 border-border/50 focus:border-primary focus:ring-1 focus:ring-primary"
                  disabled={sendMutation.isPending}
                />
                <Button type="submit" disabled={!input.trim() || sendMutation.isPending} className="bg-primary text-white hover:bg-primary/90 shrink-0">
                  <Send className="w-4 h-4 rtl:-scale-x-100" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
