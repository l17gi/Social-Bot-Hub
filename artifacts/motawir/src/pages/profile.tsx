import { useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User as UserIcon, Mail, Shield, Save } from "lucide-react";

export default function Profile() {
  const { data: user, isLoading } = useGetMe();

  if (isLoading) {
    return <div className="animate-pulse p-8">جاري التحميل...</div>;
  }

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <UserIcon className="w-8 h-8 text-primary" />
        <h2 className="text-3xl font-black text-white">الملف الشخصي</h2>
      </div>

      <Card className="bg-card/40 border-border/50 backdrop-blur-md">
        <CardHeader>
          <CardTitle>المعلومات الشخصية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
              {user.username.charAt(0).toUpperCase()}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>اسم المستخدم</Label>
              <div className="relative">
                <UserIcon className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input defaultValue={user.username} className="pr-10 bg-background/50 border-border/50" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input defaultValue={user.email} dir="ltr" className="pr-10 bg-background/50 border-border/50 text-right" disabled />
              </div>
            </div>

            <div className="space-y-2">
              <Label>الصلاحية</Label>
              <div className="relative">
                <Shield className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input defaultValue={user.role === 'admin' ? 'مدير النظام' : 'مستخدم'} className="pr-10 bg-background/50 border-border/50" disabled />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button className="bg-primary text-white hover:bg-primary/90">
              <Save className="w-4 h-4 ml-2" /> حفظ التعديلات
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
