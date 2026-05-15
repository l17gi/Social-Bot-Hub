import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Zap, ShieldCheck, Globe, Cpu, Lock } from "lucide-react";
import { SiTelegram, SiFacebook, SiInstagram } from "react-icons/si";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("admin@motawir.com");
  const [password, setPassword] = useState("Admin@Motawir2025!");
  const [typewriterText, setTypewriterText] = useState("");
  const fullText = "مستقبل الأتمتة بين يديك...";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypewriterText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        login(data.token, data.user);
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في نظام المطور",
        });
        setLocation("/");
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "فشل تسجيل الدخول",
          description: error.message || "تأكد من البريد الإلكتروني وكلمة المرور",
        });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { email, password } });
  };

  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Particle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/40 rounded-full"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: Math.random()
            }}
            animate={{ 
              y: [null, Math.random() * 100 + "%"],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Floating Platform Logos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
        <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 5, repeat: Infinity }} className="absolute top-[10%] left-[10%]"><SiTelegram size={80} /></motion.div>
        <motion.div animate={{ y: [0, 20, 0] }} transition={{ duration: 6, repeat: Infinity }} className="absolute top-[20%] right-[15%]"><SiFacebook size={60} /></motion.div>
        <motion.div animate={{ y: [0, -30, 0] }} transition={{ duration: 7, repeat: Infinity }} className="absolute bottom-[20%] left-[15%]"><SiInstagram size={70} /></motion.div>
        <motion.div animate={{ y: [0, 25, 0] }} transition={{ duration: 8, repeat: Infinity }} className="absolute bottom-[10%] right-[10%]"><Cpu size={90} /></motion.div>
      </div>

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
      
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="bg-card/30 backdrop-blur-2xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary via-purple-500 to-primary animate-gradient-x" />
          
          <div className="text-center mb-10 relative">
            <div className="relative inline-block mb-6">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-3xl border-2 border-primary/30 border-dashed scale-125"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-3xl border-2 border-purple-500/20 scale-150"
              />
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-3xl flex items-center justify-center shadow-primary/40 shadow-2xl relative z-10">
                <Zap className="w-10 h-10 text-white fill-white" />
              </div>
            </div>
            
            <h1 className="text-5xl font-black text-white mb-4 tracking-tight">المطور🌍🥇</h1>
            <div className="h-6">
              <p className="text-primary font-medium text-lg">{typewriterText}<span className="animate-pulse">|</span></p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 text-right">
              <Label htmlFor="email" className="text-white/70 text-sm font-bold mr-1">البريد الإلكتروني</Label>
              <div className="relative group">
                <Input
                  id="email"
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 h-14 rounded-2xl text-right focus:border-primary/50 focus:bg-white/10 transition-all text-white pr-4"
                  placeholder="admin@motawir.com"
                  required
                />
                <Globe className="absolute left-4 top-4 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
              </div>
            </div>
            <div className="space-y-2 text-right">
              <Label htmlFor="password" className="text-white/70 text-sm font-bold mr-1">كلمة المرور</Label>
              <div className="relative group">
                <Input
                  id="password"
                  type="password"
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 h-14 rounded-2xl text-right focus:border-primary/50 focus:bg-white/10 transition-all text-white pr-4"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute left-4 top-4 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
              </div>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="w-5 h-5 rounded border border-white/20 bg-white/5 group-hover:border-primary/50 transition-colors flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-sm opacity-0 group-hover:opacity-50 transition-opacity" />
                </div>
                <span className="text-sm text-white/60">تذكرني</span>
              </label>
              <a href="#" className="text-sm text-primary/80 hover:text-primary transition-colors">نسيت كلمة المرور؟</a>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white font-black h-14 rounded-2xl text-xl shadow-primary/20 shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                "دخول النظام"
              )}
            </Button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-white/5 flex flex-wrap justify-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center gap-1.5"><ShieldCheck size={16} /><span className="text-xs font-bold">تشفير AES-256</span></div>
            <div className="flex items-center gap-1.5"><Cpu size={16} /><span className="text-xs font-bold">معالجة سحابية</span></div>
            <div className="flex items-center gap-1.5"><Lock size={16} /><span className="text-xs font-bold">دخول آمن</span></div>
          </div>
        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-2">
          <div className="bg-yellow-500/20 text-yellow-500 text-[10px] font-black px-2 py-0.5 rounded border border-yellow-500/30">جديد</div>
          <p className="text-sm text-white/40">
            مدعوم بواسطة ذكاء <span className="text-white/80 font-bold">Kimi K2 ✦</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
