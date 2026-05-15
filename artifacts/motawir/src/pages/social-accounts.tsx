import { useState } from "react";
import { 
  useGetSocialAccounts, 
  getGetSocialAccountsQueryKey,
  useDeleteSocialAccount,
  useToggleSocialAccount
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Plus, Trash2, Power, User, AlertCircle, Phone, Globe, ShieldCheck, Loader2 } from "lucide-react";
import { SiTelegram, SiFacebook, SiInstagram } from "react-icons/si";
import { useQueryClient } from "@tanstack/react-query";

export default function SocialAccounts() {
  const { data: accounts, isLoading } = useGetSocialAccounts();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleMutation = useToggleSocialAccount({
    mutation: {
      onSuccess: () => {
        toast({ title: "تم تحديث حالة الحساب" });
        queryClient.invalidateQueries({ queryKey: getGetSocialAccountsQueryKey() });
      }
    }
  });

  const deleteMutation = useDeleteSocialAccount({
    mutation: {
      onSuccess: () => {
        toast({ title: "تم حذف الحساب بنجاح" });
        queryClient.invalidateQueries({ queryKey: getGetSocialAccountsQueryKey() });
      }
    }
  });

  const renderAccountsList = (platform: string, Icon: any, colorClass: string, gradientClass: string) => {
    const platformAccounts = accounts?.filter(a => a.platform === platform) || [];

    return (
      <div className="space-y-6 mt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 rounded-[2rem] border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${gradientClass} shadow-lg`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">
                حسابات {platform === 'telegram' ? 'تيليغرام' : platform === 'facebook' ? 'فيسبوك' : 'إنستغرام'}
              </h3>
              <p className="text-muted-foreground text-sm">إدارة وربط حساباتك لعمليات الأتمتة</p>
            </div>
          </div>
          <Button className={`bg-gradient-to-r ${gradientClass} text-white font-bold h-12 px-8 rounded-2xl shadow-xl hover:scale-105 transition-all`}>
            <Plus className="w-5 h-5 ml-2" /> إضافة حساب
          </Button>
        </div>

        {platformAccounts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white/2 rounded-[2.5rem] border border-dashed border-white/10"
          >
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-muted-foreground opacity-30" />
            </div>
            <p className="text-muted-foreground font-bold">لا يوجد حسابات مضافة لهذه المنصة</p>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {platformAccounts.map((account, index) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-card/30 backdrop-blur-2xl border-white/5 hover:border-white/20 transition-all relative overflow-hidden group rounded-[2rem] shadow-2xl h-full">
                    <div className={`absolute top-0 right-0 w-2 h-full ${account.isActive ? 'bg-emerald-500' : 'bg-red-500'} shadow-[0_0_15px_rgba(16,185,129,0.3)]`} />
                    <CardContent className="p-8">
                      <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 overflow-hidden border border-white/10">
                              {account.avatarUrl ? (
                                <img src={account.avatarUrl} alt={account.accountName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <User className="w-8 h-8 text-white/20" />
                                </div>
                              )}
                            </div>
                            {account.isActive && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0a0e1a] animate-pulse" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-black text-white text-xl mb-1">{account.accountName}</h4>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              <span className="text-xs font-mono dir-ltr">{account.phoneNumber || '---'}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={`${account.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'} rounded-lg px-3 py-1`}>
                          {account.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <p className="text-[10px] text-muted-foreground mb-1">تاريخ الربط</p>
                          <p className="text-xs text-white font-bold">2024/05/12</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <p className="text-[10px] text-muted-foreground mb-1">نوع الحساب</p>
                          <div className="flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-primary" />
                            <p className="text-xs text-white font-bold">موثق</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 pt-6 border-t border-white/5">
                        <Button 
                          variant="ghost" 
                          className={`flex-1 rounded-xl h-12 transition-all ${account.isActive ? 'bg-orange-500/5 text-orange-500 hover:bg-orange-500/10' : 'bg-emerald-500/5 text-emerald-500 hover:bg-emerald-500/10'}`}
                          onClick={() => toggleMutation.mutate({ id: account.id })}
                          disabled={toggleMutation.isPending}
                        >
                          <Power className="w-4 h-4 ml-2" />
                          {account.isActive ? 'إيقاف' : 'تفعيل'}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="w-12 h-12 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-all"
                          onClick={() => deleteMutation.mutate({ id: account.id })}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-5 h-5" />
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
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-2xl shadow-primary/20">
            <Share2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tight text-white">الحسابات الاجتماعية</h2>
            <p className="text-muted-foreground mt-1 mr-10">إدارة مركزية لجميع منصات التواصل الاجتماعي الخاصة بك</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="telegram" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-white/5 p-1.5 rounded-[1.5rem] border border-white/5 mb-8">
          <TabsTrigger value="telegram" className="rounded-xl h-12 text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">تيليغرام</TabsTrigger>
          <TabsTrigger value="facebook" className="rounded-xl h-12 text-sm font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">فيسبوك</TabsTrigger>
          <TabsTrigger value="instagram" className="rounded-xl h-12 text-sm font-bold data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all">إنستغرام</TabsTrigger>
        </TabsList>
        
        {isLoading ? (
          <div className="py-40 text-center flex flex-col items-center gap-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-primary font-black animate-pulse text-lg">جاري جلب بيانات الحسابات الموثقة...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <TabsContent value="telegram">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {renderAccountsList('telegram', SiTelegram, 'text-[#26A5E4]', 'from-[#26A5E4] to-[#1a8db8]')}
              </motion.div>
            </TabsContent>
            <TabsContent value="facebook">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {renderAccountsList('facebook', SiFacebook, 'text-[#1877F2]', 'from-[#1877F2] to-[#0d59bd]')}
              </motion.div>
            </TabsContent>
            <TabsContent value="instagram">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {renderAccountsList('instagram', SiInstagram, 'text-[#E4405F]', 'from-[#833ab4] via-[#fd1d1d] to-[#fcb045]')}
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        )}
      </Tabs>
    </div>
  );
}
