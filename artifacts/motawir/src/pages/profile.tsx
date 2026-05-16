import { useState, useRef } from "react";
import { useGetMe } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { User as UserIcon, Mail, Shield, Save, Camera, Loader2, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

function getToken() {
  return localStorage.getItem("motawir_token") || "";
}

export default function Profile() {
  const { data: user, isLoading } = useGetMe();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [username, setUsername] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const displayName = username || user?.username || "";
  const displayAvatar = avatarPreview || user?.avatarUrl || null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: "destructive", title: "الصورة كبيرة جداً", description: "يجب أن تكون أقل من 2 ميجابايت" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setAvatarPreview(result);
      setAvatarBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: any = {};
      if (username.trim()) body.username = username.trim();
      if (avatarBase64) body.avatarUrl = avatarBase64;
      if (newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ");

      localStorage.setItem("motawir_user", JSON.stringify(data));
      queryClient.invalidateQueries();
      toast({ title: "تم حفظ التعديلات بنجاح" });
      setSaved(true);
      setCurrentPassword(""); setNewPassword("");
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      toast({ variant: "destructive", title: "خطأ في الحفظ", description: e.message });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-bold animate-pulse">جاري التحميل...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
          <UserIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">الملف الشخصي</h2>
          <p className="text-muted-foreground text-sm">إدارة بياناتك الشخصية</p>
        </div>
      </div>

      {/* Avatar Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/30 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 sm:p-8"
      >
        <h3 className="font-black text-white text-lg mb-6 pb-4 border-b border-white/5">صورة الحساب</h3>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div
              className="w-28 h-28 rounded-3xl overflow-hidden border-2 border-white/10 cursor-pointer group-hover:border-primary/50 transition-all shadow-2xl"
              onClick={() => fileInputRef.current?.click()}
            >
              {displayAvatar ? (
                <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-4xl font-black text-white">
                  {(displayName || user.username).charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </div>
          <div className="text-center sm:text-right">
            <h4 className="font-black text-white text-xl">{user.username}</h4>
            <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-emerald-500 font-bold">متصل الآن</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 text-primary hover:text-primary hover:bg-primary/10 text-xs rounded-xl px-4 h-9 border border-primary/20"
            >
              <Camera className="w-3.5 h-3.5 ml-1.5" />
              تغيير الصورة
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Personal Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card/30 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 sm:p-8 space-y-5"
      >
        <h3 className="font-black text-white text-lg pb-4 border-b border-white/5">المعلومات الشخصية</h3>

        <div className="space-y-2">
          <Label className="text-white/70 font-bold text-sm">اسم المستخدم</Label>
          <div className="relative">
            <UserIcon className="absolute right-4 top-3.5 w-4 h-4 text-muted-foreground" />
            <Input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder={user.username}
              className="pr-11 bg-white/5 border-white/10 h-12 rounded-2xl text-white focus:border-primary/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-white/70 font-bold text-sm">البريد الإلكتروني</Label>
          <div className="relative">
            <Mail className="absolute right-4 top-3.5 w-4 h-4 text-muted-foreground" />
            <Input
              value={user.email}
              dir="ltr"
              className="pr-11 bg-white/5 border-white/5 h-12 rounded-2xl text-white/50 text-right cursor-not-allowed"
              disabled
            />
          </div>
          <p className="text-xs text-muted-foreground/60">لا يمكن تغيير البريد الإلكتروني</p>
        </div>

        <div className="space-y-2">
          <Label className="text-white/70 font-bold text-sm">الصلاحية</Label>
          <div className="relative">
            <Shield className="absolute right-4 top-3.5 w-4 h-4 text-primary" />
            <Input
              value={user.role === "admin" ? "مدير النظام" : "مستخدم"}
              className="pr-11 bg-primary/5 border-primary/20 h-12 rounded-2xl text-primary font-bold cursor-not-allowed"
              disabled
            />
          </div>
        </div>
      </motion.div>

      {/* Password Change Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card/30 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 sm:p-8 space-y-5"
      >
        <h3 className="font-black text-white text-lg pb-4 border-b border-white/5">تغيير كلمة المرور</h3>
        <div className="space-y-2">
          <Label className="text-white/70 font-bold text-sm">كلمة المرور الحالية</Label>
          <div className="relative">
            <Lock className="absolute right-4 top-3.5 w-4 h-4 text-muted-foreground" />
            <Input
              type={showCurrentPw ? "text" : "password"}
              dir="ltr"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-11 pl-11 bg-white/5 border-white/10 h-12 rounded-2xl text-white"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPw(!showCurrentPw)}
              className="absolute left-4 top-3.5 text-muted-foreground hover:text-white transition-colors"
            >
              {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-white/70 font-bold text-sm">كلمة المرور الجديدة</Label>
          <div className="relative">
            <Lock className="absolute right-4 top-3.5 w-4 h-4 text-muted-foreground" />
            <Input
              type={showNewPw ? "text" : "password"}
              dir="ltr"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="pr-11 pl-11 bg-white/5 border-white/10 h-12 rounded-2xl text-white"
            />
            <button
              type="button"
              onClick={() => setShowNewPw(!showNewPw)}
              className="absolute left-4 top-3.5 text-muted-foreground hover:text-white transition-colors"
            >
              {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground/60">اترك الحقول فارغة إذا لم ترد تغيير كلمة المرور</p>
      </motion.div>

      {/* Save Button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-14 bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white font-black text-lg rounded-2xl shadow-2xl shadow-primary/20 transition-all"
        >
          {saving ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : saved ? (
            <><CheckCircle2 className="w-6 h-6 ml-2 text-emerald-300" />تم الحفظ بنجاح</>
          ) : (
            <><Save className="w-5 h-5 ml-2" />حفظ التعديلات</>
          )}
        </Button>
      </motion.div>
    </div>
  );
}
