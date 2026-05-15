import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Bot, 
  Share2, 
  MessageSquare,
  LogOut,
  ShieldAlert,
  Bell,
  Activity as ActivityIcon
} from "lucide-react";
import { Button } from "./ui/button";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "لوحة التحكم", icon: LayoutDashboard },
    { href: "/social-accounts", label: "الحسابات الاجتماعية", icon: Share2 },
    { href: "/automations", label: "نظام الأتمتة", icon: Settings },
    { href: "/ai", label: "المساعد الذكي", icon: MessageSquare },
    { href: "/agent-builder", label: "منشئ الوكلاء", icon: Bot },
    { href: "/profile", label: "الملف الشخصي", icon: Users },
  ];

  if (user?.role === "admin") {
    navItems.push({ href: "/admin", label: "لوحة المدير", icon: ShieldAlert });
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background text-foreground selection:bg-primary/30 font-sans">
      {/* Sidebar - Desktop */}
      <aside className="w-full md:w-64 bg-card border-l border-border/50 flex-shrink-0 flex flex-col p-4 z-10 sticky top-0 md:h-screen overflow-y-auto hidden md:flex shadow-[4px_0_24px_rgba(0,0,0,0.4)] relative">
        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-primary/50 to-purple-500/50 blur-sm"></div>
        <div className="flex items-center gap-3 mb-8">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          >
            م
          </motion.div>
          <h1 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">المطور🌍🥇</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-300 relative group overflow-hidden",
                  isActive ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab" 
                      className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className={cn("w-5 h-5 relative z-10", isActive ? "text-primary" : "group-hover:text-white")} />
                  <span className="relative z-10">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-border/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-border">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} className="w-full h-full rounded-full object-cover" />
              ) : (
                <Users className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-white">{user?.username}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-muted-foreground">متصل</span>
              </div>
            </div>
          </div>
          <Button variant="destructive" className="w-full justify-start gap-2 bg-red-950/40 text-red-400 hover:bg-red-900/60 hover:text-red-300 border border-red-900/50" onClick={logout}>
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#0a0e1a] relative">
        {/* Cyberpunk background effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/5 blur-[100px]" />
        </div>
        
        <header className="h-16 border-b border-border/40 bg-card/40 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-20">
          <div className="md:hidden flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              م
            </div>
            <span className="font-bold">المطور🌍🥇</span>
          </div>
          
          <div className="flex-1 flex justify-end items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-[#0a0e1a]" />
            </Button>
            <div className="hidden md:flex flex-col items-end">
               <span className="text-xs text-muted-foreground">مرحباً بعودتك</span>
               <span className="text-sm font-bold text-white">{user?.username}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-8 pb-24 md:pb-8 z-10 relative scroll-smooth">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border/50 px-4 py-2 flex justify-between items-center z-30">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
                )}>
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
                </div>
              </Link>
            );
          })}
          <Link href="/profile">
            <div className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
              location === "/profile" ? "text-primary bg-primary/10" : "text-muted-foreground"
            )}>
              <Users className="w-5 h-5" />
              <span className="text-[10px] font-medium">حسابي</span>
            </div>
          </Link>
        </nav>
      </main>
    </div>
  );
}
