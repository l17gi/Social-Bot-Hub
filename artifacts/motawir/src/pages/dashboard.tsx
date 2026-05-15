import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Bot, MessageSquare, Activity, Zap, TrendingUp, ArrowUpRight, Plus, Bell } from "lucide-react";
import { motion, useSpring, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
    });
    return () => controls.stop();
  }, [value]);

  return <>{displayValue.toLocaleString('en-US')}</>;
}

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();

  const stats = [
    { 
      title: "الحسابات النشطة", 
      value: summary?.activeSocialAccounts || 0, 
      total: summary?.totalSocialAccounts || 0,
      icon: Share2, 
      color: "from-blue-500 to-cyan-400",
      bg: "bg-blue-500/10",
      trend: "+12%"
    },
    { 
      title: "الأتمتة الشغالة", 
      value: summary?.activeAutomations || 0, 
      icon: Zap, 
      color: "from-purple-500 to-pink-400",
      bg: "bg-purple-500/10",
      trend: "+5%"
    },
    { 
      title: "الرسائل المرسلة", 
      value: summary?.totalMessagesSent || 0, 
      icon: MessageSquare, 
      color: "from-emerald-500 to-teal-400",
      bg: "bg-emerald-500/10",
      trend: "+24%"
    },
    { 
      title: "وكلاء الذكاء الاصطناعي", 
      value: summary?.agentApps || 0, 
      icon: Bot, 
      color: "from-orange-500 to-red-400",
      bg: "bg-orange-500/10",
      trend: "مستقر"
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-card rounded-md animate-pulse"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="bg-card/40 border-border/40">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-lg bg-muted animate-pulse mb-4"></div>
                <div className="h-6 w-24 bg-muted animate-pulse mb-2"></div>
                <div className="h-8 w-16 bg-muted animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Quick Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            نظرة عامة
          </h2>
          <p className="text-muted-foreground mt-1 mr-13">مرحباً بك في مركز التحكم الخاص بك</p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-white/5 border-white/10 hover:bg-white/10 text-white gap-2 h-11 px-6">
            <TrendingUp className="w-4 h-4" /> التقارير
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2 h-11 px-6 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" /> أتمتة جديدة
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-card/40 backdrop-blur-sm border-border/40 overflow-hidden relative group hover:border-primary/50 transition-all duration-500 rounded-2xl h-full">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-bold text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}>
                    <Icon className={`w-5 h-5 text-transparent bg-clip-text bg-gradient-to-br ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black text-white mb-2">
                    <AnimatedNumber value={stat.value} />
                  </div>
                  <div className="flex items-center justify-between">
                    {stat.total !== undefined ? (
                      <p className="text-xs text-muted-foreground">
                        من أصل <span className="text-white font-bold">{stat.total}</span>
                      </p>
                    ) : (
                      <div className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded">
                        <ArrowUpRight className="w-3 h-3" />
                        {stat.trend}
                      </div>
                    )}
                  </div>
                  
                  {/* Miniature progress bar */}
                  {stat.total !== undefined && (
                    <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(stat.value / Math.max(stat.total, 1)) * 100}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full bg-gradient-to-r ${stat.color}`}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        {/* Platforms breakdown */}
        <Card className="md:col-span-2 bg-card/40 backdrop-blur-sm border-border/40 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">توزيع المنصات</CardTitle>
            <Share2 className="w-5 h-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">تيليغرام</span>
                <span className="text-sm font-bold text-blue-400">{summary?.telegramAccounts || 0}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((summary?.telegramAccounts || 0) / Math.max(summary?.totalSocialAccounts || 1, 1)) * 100}%` }}
                  className="bg-blue-500 h-2.5 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">فيسبوك</span>
                <span className="text-sm font-bold text-blue-600">{summary?.facebookAccounts || 0}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((summary?.facebookAccounts || 0) / Math.max(summary?.totalSocialAccounts || 1, 1)) * 100}%` }}
                  className="bg-blue-600 h-2.5 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">إنستغرام</span>
                <span className="text-sm font-bold text-pink-500">{summary?.instagramAccounts || 0}</span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((summary?.instagramAccounts || 0) / Math.max(summary?.totalSocialAccounts || 1, 1)) * 100}%` }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Activity Feed */}
        <Card className="md:col-span-1 lg:col-span-2 bg-card/40 backdrop-blur-sm border-border/40 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">النشاط المباشر</CardTitle>
            <Bell className="w-5 h-5 text-muted-foreground animate-ring" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'automation', msg: 'تم إرسال 50 رسالة بنجاح', time: 'منذ دقيقة', color: 'text-emerald-500' },
                { type: 'account', msg: 'تم ربط حساب تيليغرام جديد', time: 'منذ 5 دقائق', color: 'text-blue-500' },
                { type: 'ai', msg: 'تم إنشاء وكيل ذكاء اصطناعي جديد', time: 'منذ ساعة', color: 'text-purple-500' },
                { type: 'system', msg: 'تحديث النظام للنسخة 2.0', time: 'منذ ساعتين', color: 'text-orange-500' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10 group">
                  <div className={`w-2 h-2 rounded-full ${activity.color.replace('text-', 'bg-')} animate-pulse`} />
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{activity.msg}</p>
                    <p className="text-[10px] text-muted-foreground">{activity.time}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
