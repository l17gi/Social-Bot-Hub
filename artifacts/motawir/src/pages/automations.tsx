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
import { Settings, Play, Square, Trash2, Plus, Zap, AlertCircle } from "lucide-react";
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary" />
          نظام الأتمتة
        </h2>
        <Button className="bg-gradient-to-r from-primary to-purple-600 text-white font-bold">
          <Plus className="w-4 h-4 ml-2" /> أتمتة جديدة
        </Button>
      </div>

      {!statsLoading && stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-card/40 border-border/50">
            <CardHeader className="py-4">
              <CardTitle className="text-sm text-muted-foreground">إجمالي الأتمتة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalAutomations}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-border/50">
            <CardHeader className="py-4">
              <CardTitle className="text-sm text-muted-foreground">الأتمتة النشطة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">{stats.activeAutomations}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-border/50">
            <CardHeader className="py-4">
              <CardTitle className="text-sm text-muted-foreground">الرسائل المرسلة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{stats.totalMessagesSent}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/40 border-border/50">
            <CardHeader className="py-4">
              <CardTitle className="text-sm text-muted-foreground">نسبة النجاح</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">%{stats.successRate}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {automationsLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
             <div key={i} className="h-48 bg-card/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : automations?.length === 0 ? (
        <div className="text-center py-20 bg-card/20 rounded-xl border border-dashed border-border/50">
          <Zap className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold text-white mb-2">لا توجد أتمتة حالياً</h3>
          <p className="text-muted-foreground">قم بإنشاء أول عملية أتمتة لتبدأ في توفير الوقت</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {automations?.map((auto, i) => (
              <motion.div
                key={auto.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className={`h-full bg-card/40 backdrop-blur-md border-border/50 hover:border-primary/50 transition-all flex flex-col group relative overflow-hidden ${auto.status === 'active' ? 'shadow-[0_0_15px_rgba(16,185,129,0.15)]' : ''}`}>
                  {auto.status === 'active' && (
                    <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500 animate-pulse" />
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className={
                        auto.type === 'send_messages' ? 'text-blue-400 border-blue-400/30 bg-blue-400/10' :
                        auto.type === 'join_groups' ? 'text-purple-400 border-purple-400/30 bg-purple-400/10' :
                        'text-orange-400 border-orange-400/30 bg-orange-400/10'
                      }>
                        {auto.type === 'send_messages' ? 'إرسال رسائل' :
                         auto.type === 'join_groups' ? 'انضمام لمجموعات' : 'استخراج أعضاء'}
                      </Badge>
                      <Badge variant={auto.status === 'active' ? 'default' : 'secondary'} className={auto.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : ''}>
                        {auto.status === 'active' ? 'نشط' : 'متوقف'}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-white">{auto.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <div className="space-y-3 text-sm text-muted-foreground mb-6">
                      <div className="flex justify-between">
                        <span>الرسائل المرسلة:</span>
                        <span className="text-white font-bold">{auto.messagesSent}</span>
                      </div>
                      {auto.aiModel && (
                        <div className="flex justify-between">
                          <span>النموذج:</span>
                          <span className="text-primary">{auto.aiModel}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {auto.status === 'active' ? (
                        <Button 
                          variant="secondary" 
                          className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500/20"
                          onClick={() => stopMutation.mutate({ id: auto.id })}
                          disabled={stopMutation.isPending}
                        >
                          <Square className="w-4 h-4 ml-2" /> إيقاف
                        </Button>
                      ) : (
                        <Button 
                          variant="secondary" 
                          className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                          onClick={() => startMutation.mutate({ id: auto.id })}
                          disabled={startMutation.isPending}
                        >
                          <Play className="w-4 h-4 ml-2" /> تشغيل
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        onClick={() => deleteMutation.mutate({ id: auto.id })}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
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
