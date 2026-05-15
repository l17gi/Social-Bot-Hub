import { useAdminGetStats, useAdminGetUsers } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Users, Activity, Settings } from "lucide-react";

export default function Admin() {
  const { data: stats, isLoading: statsLoading } = useAdminGetStats();
  const { data: users, isLoading: usersLoading } = useAdminGetUsers();

  if (statsLoading || usersLoading) {
    return <div className="p-8 animate-pulse">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <ShieldAlert className="w-8 h-8 text-red-500" />
        <h2 className="text-3xl font-black text-white">لوحة المدير</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/40 border-red-500/20">
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-muted-foreground">إجمالي المستخدمين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{stats?.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/40 border-red-500/20">
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-muted-foreground">مستخدمين نشطين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">{stats?.activeUsers}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-red-500/20">
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-muted-foreground">إجمالي الحسابات الاجتماعية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">{stats?.totalSocialAccounts}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-red-500/20">
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-muted-foreground">إجمالي الأتمتة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">{stats?.totalAutomations}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/40 border-border/50">
        <CardHeader>
          <CardTitle>المستخدمين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="text-xs text-muted-foreground bg-muted/50">
                <tr>
                  <th className="px-4 py-3 rounded-tr-lg">المعرف</th>
                  <th className="px-4 py-3">الاسم</th>
                  <th className="px-4 py-3">البريد</th>
                  <th className="px-4 py-3">الصلاحية</th>
                  <th className="px-4 py-3">الحالة</th>
                  <th className="px-4 py-3 rounded-tl-lg">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody>
                {users?.map(user => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-mono text-muted-foreground">{user.id}</td>
                    <td className="px-4 py-3 font-bold text-white">{user.username}</td>
                    <td className="px-4 py-3 text-muted-foreground dir-ltr text-right">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${user.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {user.isActive ? 'نشط' : 'غير نشط'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
