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
import { Share2, Plus, Trash2, Power, User, AlertCircle } from "lucide-react";
import { SiTelegram, SiFacebook, SiInstagram } from "react-icons/si";
import { useQueryClient } from "@tanstack/react-query";
// Note: We need a dialog component. We'll use a placeholder structure for the flow.

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

  const renderAccountsList = (platform: string, Icon: any, colorClass: string) => {
    const platformAccounts = accounts?.filter(a => a.platform === platform) || [];

    return (
      <div className="space-y-4 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Icon className={`w-6 h-6 ${colorClass}`} />
            حسابات {platform === 'telegram' ? 'تيليغرام' : platform === 'facebook' ? 'فيسبوك' : 'إنستغرام'}
          </h3>
          <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
            <Plus className="w-4 h-4 ml-2" /> إضافة حساب
          </Button>
        </div>

        {platformAccounts.length === 0 ? (
          <div className="text-center py-12 bg-card/20 rounded-xl border border-dashed border-border/50">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">لا يوجد حسابات مضافة لهذه المنصة</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {platformAccounts.map((account, index) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-card/40 backdrop-blur-md border-border/50 hover:border-primary/50 transition-colors relative overflow-hidden group">
                    <div className={`absolute top-0 right-0 w-2 h-full ${account.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                            {account.avatarUrl ? (
                              <img src={account.avatarUrl} alt={account.accountName} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-lg">{account.accountName}</h4>
                            <p className="text-sm text-muted-foreground dir-ltr text-right">{account.phoneNumber || '---'}</p>
                          </div>
                        </div>
                        <Badge variant={account.isActive ? "default" : "destructive"} className={account.isActive ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50" : ""}>
                          {account.status}
                        </Badge>
                      </div>
                      
                      <div className="mt-6 flex gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => toggleMutation.mutate({ id: account.id })}
                          disabled={toggleMutation.isPending}
                          className={account.isActive ? "text-orange-400 hover:text-orange-300 hover:bg-orange-400/10" : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"}
                        >
                          <Power className="w-4 h-4 ml-2" />
                          {account.isActive ? 'إيقاف' : 'تفعيل'}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteMutation.mutate({ id: account.id })}
                          disabled={deleteMutation.isPending}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4 ml-2" />
                          حذف
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
          <Share2 className="w-8 h-8 text-primary" />
          الحسابات الاجتماعية
        </h2>
      </div>

      <Tabs defaultValue="telegram" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 bg-card/50 border border-border/50">
          <TabsTrigger value="telegram" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">تيليغرام</TabsTrigger>
          <TabsTrigger value="facebook" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-500">فيسبوك</TabsTrigger>
          <TabsTrigger value="instagram" className="data-[state=active]:bg-pink-600/20 data-[state=active]:text-pink-500">إنستغرام</TabsTrigger>
        </TabsList>
        
        {isLoading ? (
          <div className="py-20 text-center text-primary animate-pulse">جاري جلب الحسابات...</div>
        ) : (
          <>
            <TabsContent value="telegram">
              {renderAccountsList('telegram', SiTelegram, 'text-[#26A5E4]')}
            </TabsContent>
            <TabsContent value="facebook">
              {renderAccountsList('facebook', SiFacebook, 'text-[#1877F2]')}
            </TabsContent>
            <TabsContent value="instagram">
              {renderAccountsList('instagram', SiInstagram, 'text-[#E4405F]')}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
