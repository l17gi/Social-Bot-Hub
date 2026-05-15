import { useState } from "react";
import { 
  useGetAutomations,
  useGetAutomationStats,
  useCreateAutomation,
  useUpdateAutomation,
  useDeleteAutomation,
  useStartAutomation,
  useStopAutomation,
  getGetAutomationsQueryKey,
  getGetAutomationStatsQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Settings, Play, Square, Trash2, Plus, Zap, AlertCircle, TrendingUp, Users, MessageSquare, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Automations() {
  const { data: automations, isLoading: automationsLoading } = useGetAutomations();
  const { data: stats, isLoading: statsLoading } = useGetAutomationStats();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const startMutation = useStartAutomation({
    mutation: {
      onSuccess: () => {
        toast({ title: "تم تشغيل الأتمتة بنجاح" });
        queryClient.invalidateQueries({ queryKey: getGetAutomationsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAutomationStatsQueryKey() });
      }
    }
  });

  const stopMutation = useStopAutomation({
    mutation: {
      onSuccess: () => {
        toast({ title: "تم إيقاف الأتمتة بنجاح" });
        queryClient.invalidateQueries({ queryKey: getGetAutomationsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAutomationStatsQueryKey() });
      }
    }
  });

  const deleteMutation = useDeleteAutomation({
    mutation: {
      onSuccess: () => {
        toast({ title: "تم حذف الأتمتة بنجاح" });
        queryClient.invalidateQueries({ queryKey: getGetAutomationsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAutomationStatsQueryKey() });
      }
    }
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-2xl shadow-primary/20">
            <Settings className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tight text-white">نظام الأتمتة</h2>
            <p className="text-muted-foreground mt-1 mr-10">جدولة وتنسيق العمليات الذكية على حساباتك</p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-primary to-purple-600 text-white font-black h-14 px-8 rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all text-lg">
          <Plus className="w-6 h-6 ml-2" /> أتمتة جديدة
        </Button>
      </div>

      {!statsLoading && stats && (
        <div className="grid gap-6 md:grid-cols-4">
          {[
            { label: 'إجمالي الأتمتة', value: stats.totalAutomations, icon: Settings, color: 'text-white' },
            { label: 'الأتمتة النشطة', value: stats.activeAutomations, icon: Zap, color: 'text-emerald-400' },
            { label: 'الرسائل المرسلة', value: stats.totalMessagesSent, icon: MessageSquare, color: 'text-blue-400' },
            { label: 'نسبة النجاح', value: `%${stats.successRate}`, icon: TrendingUp, color: 'text-purple-400' },
          ].map((s, i) => (
            <Card key={i} className="bg-card/30 backdrop-blur-2xl border-white/5 rounded-2xl overflow-hidden relative group">
              <div className="absolute top-0 right-0 w-1 h-full bg-white/10 group-hover:bg-primary/40 transition-colors" />
              <CardHeader className="py-4">
                <CardTitle className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                  <s.icon className="w-3.5 h-3.5" />
                  {s.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {automationsLoading ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
             <div key={i} className="h-64 bg-white/5 rounded-[2rem] animate-pulse border border-white/5" />
          ))}
        </div>
      ) : automations?.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-32 bg-white/2 rounded-[3rem] border border-dashed border-white/10"
        >
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <Zap className="w-12 h-12 text-primary opacity-50" />
          </div>
          <h3 className="text-2xl font-black text-white mb-3">لا توجد أتمتة حالياً</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">قم بإنشاء أول عملية أتمتة لتبدأ في توفير الوقت وتوسيع نطاق أعمالك</p>
        </motion.div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {automations?.map((auto, i) => (
              <motion.div
                key={auto.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`h-full bg-card/30 backdrop-blur-3xl border-white/5 hover:border-white/20 transition-all flex flex-col group relative overflow-hidden rounded-[2.5rem] shadow-2xl ${auto.status === 'active' ? 'ring-2 ring-emerald-500/20 shadow-emerald-500/10' : ''}`}>
                  {auto.status === 'active' && (
                    <div className="absolute top-0 right-0 w-3 h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                      <div className="absolute top-1/2 left-0 w-full h-20 bg-white/20 -translate-y-1/2 animate-pulse" />
                    </div>
                  )}
                  <CardHeader className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <Badge className={
                        auto.type === 'send_messages' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        auto.type === 'join_groups' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        'bg-orange-500/10 text-orange-400 border-orange-400/20'
                      }>
                        {auto.type === 'send_messages' ? 'إرسال رسائل' :
                         auto.type === 'join_groups' ? 'انضمام لمجموعات' : 'استخراج أعضاء'}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {auto.status === 'active' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
                        <Badge variant={auto.status === 'active' ? 'default' : 'secondary'} className={auto.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-white/5 text-muted-foreground'}>
                          {auto.status === 'active' ? 'نشط' : 'متوقف'}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-black text-white group-hover:text-primary transition-colors">{auto.name}</CardTitle>
                    <CardDescription className="text-muted-foreground line-clamp-1 mt-2">خطة أتمتة ذكية مدعومة بالذكاء الاصطناعي</CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 pt-0 flex-1 flex flex-col justify-end">
                    <div className="space-y-4 mb-8">
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MessageSquare className="w-3.5 h-3.5" /> الرسائل المرسلة
                        </div>
                        <span className="text-lg font-black text-white">{auto.messagesSent}</span>
                      </div>
                      {auto.aiModel && (
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10">
                          <div className="flex items-center gap-2 text-xs text-primary font-bold">
                            <Zap className="w-3.5 h-3.5" /> النموذج المستخدم
                          </div>
                          <span className="text-xs font-black text-white uppercase tracking-tighter">{auto.aiModel}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-3">
                      {auto.status === 'active' ? (
                        <Button 
                          className="flex-1 h-14 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 font-bold"
                          onClick={() => stopMutation.mutate({ id: auto.id })}
                          disabled={stopMutation.isPending}
                        >
                          {stopMutation.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : <><Square className="w-5 h-5 ml-2 fill-current" /> إيقاف</>}
                        </Button>
                      ) : (
                        <Button 
                          className="flex-1 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 font-bold"
                          onClick={() => startMutation.mutate({ id: auto.id })}
                          disabled={startMutation.isPending}
                        >
                          {startMutation.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : <><Play className="w-5 h-5 ml-2 fill-current" /> تشغيل</>}
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="w-14 h-14 rounded-2xl bg-white/5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all border border-white/5 hover:border-red-500/20"
                        onClick={() => deleteMutation.mutate({ id: auto.id })}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-6 h-6" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
