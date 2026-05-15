import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, Bot, MessageSquare, Activity, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();

  const stats = [
    { 
      title: "الحسابات النشطة", 
      value: summary?.activeSocialAccounts || 0, 
      total: summary?.totalSocialAccounts || 0,
      icon: Share2, 
      color: "from-blue-500 to-cyan-400",
      bg: "bg-blue-500/10"
    },
    { 
      title: "الأتمتة الشغالة", 
      value: summary?.activeAutomations || 0, 
      icon: Zap, 
      color: "from-purple-500 to-pink-400",
      bg: "bg-purple-500/10"
    },
    { 
      title: "الرسائل المرسلة", 
      value: summary?.totalMessagesSent || 0, 
      icon: MessageSquare, 
      color: "from-emerald-500 to-teal-400",
      bg: "bg-emerald-500/10"
    },
    { 
      title: "وكلاء الذكاء الاصطناعي", 
      value: summary?.agentApps || 0, 
      icon: Bot, 
      color: "from-orange-500 to-red-400",
      bg: "bg-orange-500/10"
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
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
          <Activity className="w-8 h-8 text-primary" />
          نظرة عامة
        </h2>
      </div>

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
              <Card className="bg-card/40 backdrop-blur-sm border-border/40 overflow-hidden relative group hover:border-primary/50 transition-all duration-500">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-xl ${stat.bg}`}>
                    <Icon className={`w-5 h-5 text-transparent bg-clip-text bg-gradient-to-br ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black text-white">
                    {stat.value.toLocaleString('en-US')}
                  </div>
                  {stat.total !== undefined && (
                    <p className="text-xs text-muted-foreground mt-1">
                      من أصل {stat.total}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/40 backdrop-blur-sm border-border/40">
          <CardHeader>
            <CardTitle className="text-lg">توزيع المنصات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white">تيليغرام</span>
              <span className="font-bold text-primary">{summary?.telegramAccounts || 0}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${((summary?.telegramAccounts || 0) / Math.max(summary?.totalSocialAccounts || 1, 1)) * 100}%` }}></div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <span className="text-white">فيسبوك</span>
              <span className="font-bold text-blue-600">{summary?.facebookAccounts || 0}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${((summary?.facebookAccounts || 0) / Math.max(summary?.totalSocialAccounts || 1, 1)) * 100}%` }}></div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <span className="text-white">إنستغرام</span>
              <span className="font-bold text-pink-500">{summary?.instagramAccounts || 0}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: `${((summary?.instagramAccounts || 0) / Math.max(summary?.totalSocialAccounts || 1, 1)) * 100}%` }}></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
