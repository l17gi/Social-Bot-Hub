import { useState } from "react";
import {
  useGetSocialAccounts,
  getGetSocialAccountsQueryKey,
  useDeleteSocialAccount,
  useToggleSocialAccount
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Plus, Trash2, Power, User, AlertCircle, Phone, ShieldCheck, Loader2, X, CheckCircle2 } from "lucide-react";
import { SiTelegram, SiFacebook, SiInstagram } from "react-icons/si";
import { useQueryClient } from "@tanstack/react-query";

function getToken() {
  return localStorage.getItem("motawir_token") || "";
}

async function apiPost(path: string, body: any) {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "حدث خطأ");
  return data;
}

function TelegramModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const { toast } = useToast();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [hash, setHash] = useState("");
  const [loading, setLoading] = useState(false);

  const requestOtp = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    try {
      const data = await apiPost("/social-accounts/telegram/request-otp", { phoneNumber: phone });
      setHash(data.phoneCodeHash);
      setStep("otp");
      toast({ title: "تم إرسال رمز OTP", description: `تحقق من تطبيق تيليغرام على ${phone}` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "خطأ", description: e.message });
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      await apiPost("/social-accounts/telegram/verify", { phoneNumber: phone, phoneCode: code, phoneCodeHash: hash });
      toast({ title: "تم ربط حساب تيليغرام بنجاح" });
      onSuccess();
      onClose();
      setStep("phone"); setPhone(""); setCode(""); setHash("");
    } catch (e: any) {
      toast({ variant: "destructive", title: "خطأ في التحقق", description: e.message });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0d1226] border-white/10 text-white rounded-3xl max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-black">
            <div className="w-10 h-10 rounded-2xl bg-[#26A5E4]/10 flex items-center justify-center">
              <SiTelegram className="w-6 h-6 text-[#26A5E4]" />
            </div>
            ربط حساب تيليغرام
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {step === "phone" ? (
            <>
              <div className="bg-[#26A5E4]/5 border border-[#26A5E4]/20 rounded-2xl p-4 text-sm text-white/60">
                أدخل رقم هاتفك المرتبط بتيليغرام وسيصلك رمز التحقق OTP
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 font-bold">رقم الهاتف</Label>
                <Input
                  dir="ltr"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+966500000000"
                  className="bg-white/5 border-white/10 h-13 rounded-2xl text-white focus:border-[#26A5E4]/50 text-left"
                  onKeyDown={e => e.key === "Enter" && requestOtp()}
                />
              </div>
              <Button onClick={requestOtp} disabled={loading || !phone.trim()} className="w-full h-12 bg-[#26A5E4] hover:bg-[#26A5E4]/90 text-white font-bold rounded-2xl">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "إرسال رمز OTP"}
              </Button>
            </>
          ) : (
            <>
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 text-sm text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                تم إرسال رمز OTP إلى <span dir="ltr" className="font-mono font-bold">{phone}</span>
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 font-bold">رمز OTP</Label>
                <Input
                  dir="ltr"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="12345"
                  className="bg-white/5 border-white/10 h-13 rounded-2xl text-white text-center text-2xl tracking-widest font-mono focus:border-emerald-500/50"
                  maxLength={6}
                  onKeyDown={e => e.key === "Enter" && verifyOtp()}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep("phone")} className="flex-1 h-12 rounded-2xl border border-white/10 hover:bg-white/5">
                  تغيير الرقم
                </Button>
                <Button onClick={verifyOtp} disabled={loading || !code.trim()} className="flex-1 h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "تحقق والربط"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FacebookModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const { toast } = useToast();
  const [accountName, setAccountName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!accountName.trim() || !username.trim()) return;
    setLoading(true);
    try {
      await apiPost("/social-accounts/facebook", { accountName, username });
      toast({ title: "تم ربط حساب فيسبوك بنجاح" });
      onSuccess();
      onClose();
      setAccountName(""); setUsername("");
    } catch (e: any) {
      toast({ variant: "destructive", title: "خطأ", description: e.message });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0d1226] border-white/10 text-white rounded-3xl max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-black">
            <div className="w-10 h-10 rounded-2xl bg-[#1877F2]/10 flex items-center justify-center">
              <SiFacebook className="w-6 h-6 text-[#1877F2]" />
            </div>
            ربط حساب فيسبوك
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="bg-[#1877F2]/5 border border-[#1877F2]/20 rounded-2xl p-4 text-sm text-white/60">
            أدخل بيانات حساب فيسبوك الخاص بك لربطه بالمنصة
          </div>
          <div className="space-y-2">
            <Label className="text-white/70 font-bold">اسم الحساب (الاسم الذي يظهر)</Label>
            <Input value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Ahmad Al-Motawir" className="bg-white/5 border-white/10 h-12 rounded-2xl text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-white/70 font-bold">اسم المستخدم أو البريد</Label>
            <Input dir="ltr" value={username} onChange={e => setUsername(e.target.value)} placeholder="user@example.com" className="bg-white/5 border-white/10 h-12 rounded-2xl text-white text-left" />
          </div>
          <Button onClick={handleSubmit} disabled={loading || !accountName.trim() || !username.trim()} className="w-full h-12 bg-[#1877F2] hover:bg-[#1877F2]/90 text-white font-bold rounded-2xl">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ربط الحساب"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InstagramModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const { toast } = useToast();
  const [accountName, setAccountName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!accountName.trim() || !username.trim()) return;
    setLoading(true);
    try {
      await apiPost("/social-accounts/instagram", { accountName, username });
      toast({ title: "تم ربط حساب إنستغرام بنجاح" });
      onSuccess();
      onClose();
      setAccountName(""); setUsername("");
    } catch (e: any) {
      toast({ variant: "destructive", title: "خطأ", description: e.message });
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0d1226] border-white/10 text-white rounded-3xl max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-black">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/10 flex items-center justify-center">
              <SiInstagram className="w-6 h-6 text-pink-500" />
            </div>
            ربط حساب إنستغرام
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="bg-pink-500/5 border border-pink-500/20 rounded-2xl p-4 text-sm text-white/60">
            أدخل بيانات حساب إنستغرام الخاص بك لربطه بالمنصة
          </div>
          <div className="space-y-2">
            <Label className="text-white/70 font-bold">اسم الحساب</Label>
            <Input value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="@motawir_official" className="bg-white/5 border-white/10 h-12 rounded-2xl text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-white/70 font-bold">اسم المستخدم</Label>
            <Input dir="ltr" value={username} onChange={e => setUsername(e.target.value)} placeholder="motawir_official" className="bg-white/5 border-white/10 h-12 rounded-2xl text-white text-left" />
          </div>
          <Button onClick={handleSubmit} disabled={loading || !accountName.trim() || !username.trim()} className="w-full h-12 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-90 text-white font-bold rounded-2xl">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "ربط الحساب"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SocialAccounts() {
  const { data: accounts, isLoading } = useGetSocialAccounts();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [telegramOpen, setTelegramOpen] = useState(false);
  const [facebookOpen, setFacebookOpen] = useState(false);
  const [instagramOpen, setInstagramOpen] = useState(false);

  const refresh = () => queryClient.invalidateQueries({ queryKey: getGetSocialAccountsQueryKey() });

  const toggleMutation = useToggleSocialAccount({ mutation: { onSuccess: () => { toast({ title: "تم تحديث حالة الحساب" }); refresh(); } } });
  const deleteMutation = useDeleteSocialAccount({ mutation: { onSuccess: () => { toast({ title: "تم حذف الحساب بنجاح" }); refresh(); } } });

  const renderAccountsList = (
    platform: string,
    Icon: any,
    gradientClass: string,
    onAdd: () => void
  ) => {
    const platformAccounts = accounts?.filter(a => a.platform === platform) || [];
    const platformName = platform === "telegram" ? "تيليغرام" : platform === "facebook" ? "فيسبوك" : "إنستغرام";
    const canAdd = platformAccounts.length < 3;

    return (
      <div className="space-y-4 mt-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradientClass} shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-white">حسابات {platformName}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">{platformAccounts.length}/3 حسابات مضافة</p>
            </div>
          </div>
          <Button
            onClick={onAdd}
            disabled={!canAdd}
            className={`w-full sm:w-auto bg-gradient-to-r ${gradientClass} text-white font-bold h-11 px-6 rounded-2xl shadow-xl hover:opacity-90 transition-all disabled:opacity-40`}
          >
            <Plus className="w-4 h-4 ml-2" />
            {canAdd ? "إضافة حساب" : "الحد الأقصى 3"}
          </Button>
        </div>

        {platformAccounts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white/2 rounded-3xl border border-dashed border-white/10 cursor-pointer hover:border-white/20 transition-all"
            onClick={canAdd ? onAdd : undefined}
          >
            <div className={`w-16 h-16 bg-gradient-to-br ${gradientClass} rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-30`}>
              <Icon className="w-8 h-8 text-white" />
            </div>
            <p className="text-muted-foreground font-bold mb-2">لا توجد حسابات مضافة</p>
            <p className="text-muted-foreground/60 text-sm">اضغط هنا لإضافة حساب {platformName}</p>
          </motion.div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {platformAccounts.map((account, index) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card/30 backdrop-blur-xl border border-white/5 hover:border-white/15 transition-all relative overflow-hidden rounded-2xl shadow-xl group"
                >
                  <div className={`absolute top-0 right-0 w-1 h-full bg-gradient-to-b ${gradientClass} opacity-60`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden border border-white/10 flex items-center justify-center">
                            {account.avatarUrl
                              ? <img src={account.avatarUrl} alt={account.accountName} className="w-full h-full object-cover" />
                              : <User className="w-6 h-6 text-white/30" />}
                          </div>
                          {account.isActive && (
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0e1a] animate-pulse" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-white text-sm truncate">{account.accountName}</h4>
                          {account.phoneNumber && (
                            <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                              <Phone className="w-3 h-3 flex-shrink-0" />
                              <span className="text-xs font-mono dir-ltr truncate">{account.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge className={`text-xs px-2 py-0.5 flex-shrink-0 ${account.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                        {account.isActive ? "نشط" : "متوقف"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-4 bg-white/5 rounded-xl p-2">
                      <ShieldCheck className="w-3 h-3 text-primary flex-shrink-0" />
                      <span className="text-xs text-white/60 font-bold">حساب موثق</span>
                      <span className="mr-auto text-[10px] text-white/40">{new Date(account.createdAt).toLocaleDateString("ar-SA")}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        className={`flex-1 rounded-xl h-10 text-xs font-bold transition-all ${account.isActive ? "bg-orange-500/5 text-orange-400 hover:bg-orange-500/10" : "bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10"}`}
                        onClick={() => toggleMutation.mutate({ id: account.id })}
                        disabled={toggleMutation.isPending}
                      >
                        <Power className="w-3.5 h-3.5 ml-1.5" />
                        {account.isActive ? "إيقاف" : "تفعيل"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-10 h-10 rounded-xl bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
                        onClick={() => deleteMutation.mutate({ id: account.id })}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <TelegramModal open={telegramOpen} onClose={() => setTelegramOpen(false)} onSuccess={refresh} />
      <FacebookModal open={facebookOpen} onClose={() => setFacebookOpen(false)} onSuccess={refresh} />
      <InstagramModal open={instagramOpen} onClose={() => setInstagramOpen(false)} onSuccess={refresh} />

      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Share2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">الحسابات الاجتماعية</h2>
          <p className="text-muted-foreground text-sm">إدارة مركزية لجميع منصاتك</p>
        </div>
      </div>

      <Tabs defaultValue="telegram" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/5 p-1.5 rounded-2xl border border-white/5 mb-4">
          <TabsTrigger value="telegram" className="rounded-xl h-10 text-xs sm:text-sm font-bold data-[state=active]:bg-[#26A5E4] data-[state=active]:text-white transition-all">
            <SiTelegram className="w-4 h-4 ml-1.5" />
            <span className="hidden sm:inline">تيليغرام</span>
            <span className="sm:hidden">TG</span>
          </TabsTrigger>
          <TabsTrigger value="facebook" className="rounded-xl h-10 text-xs sm:text-sm font-bold data-[state=active]:bg-[#1877F2] data-[state=active]:text-white transition-all">
            <SiFacebook className="w-4 h-4 ml-1.5" />
            <span className="hidden sm:inline">فيسبوك</span>
            <span className="sm:hidden">FB</span>
          </TabsTrigger>
          <TabsTrigger value="instagram" className="rounded-xl h-10 text-xs sm:text-sm font-bold data-[state=active]:bg-pink-600 data-[state=active]:text-white transition-all">
            <SiInstagram className="w-4 h-4 ml-1.5" />
            <span className="hidden sm:inline">إنستغرام</span>
            <span className="sm:hidden">IG</span>
          </TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="py-32 text-center flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-primary font-bold animate-pulse">جاري جلب الحسابات...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <TabsContent value="telegram">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {renderAccountsList("telegram", SiTelegram, "from-[#26A5E4] to-[#1a8db8]", () => setTelegramOpen(true))}
              </motion.div>
            </TabsContent>
            <TabsContent value="facebook">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {renderAccountsList("facebook", SiFacebook, "from-[#1877F2] to-[#0d59bd]", () => setFacebookOpen(true))}
              </motion.div>
            </TabsContent>
            <TabsContent value="instagram">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {renderAccountsList("instagram", SiInstagram, "from-[#833ab4] via-[#fd1d1d] to-[#fcb045]", () => setInstagramOpen(true))}
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        )}
      </Tabs>
    </div>
  );
}
