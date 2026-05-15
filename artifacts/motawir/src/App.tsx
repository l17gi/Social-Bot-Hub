import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { lazy, Suspense } from "react";

const NotFound = lazy(() => import("@/pages/not-found"));
const Login = lazy(() => import("@/pages/login"));
const Register = lazy(() => import("@/pages/register"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const SocialAccounts = lazy(() => import("@/pages/social-accounts"));
const AgentBuilder = lazy(() => import("@/pages/agent-builder"));
const Automations = lazy(() => import("@/pages/automations"));
const AI = lazy(() => import("@/pages/ai"));
const Profile = lazy(() => import("@/pages/profile"));
const Admin = lazy(() => import("@/pages/admin"));
const Layout = lazy(() => import("@/components/layout"));

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType, adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]"><div className="animate-pulse text-primary font-bold text-2xl drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">جاري التحميل...</div></div>;
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (adminOnly && user.role !== "admin") {
    setLocation("/");
    return null;
  }

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0a0e1a]"><div className="animate-pulse text-primary font-bold text-2xl drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">جاري التحميل...</div></div>}>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/">
          <ProtectedRoute component={Dashboard} />
        </Route>
        <Route path="/social-accounts">
          <ProtectedRoute component={SocialAccounts} />
        </Route>
        <Route path="/automations">
          <ProtectedRoute component={Automations} />
        </Route>
        <Route path="/ai">
          <ProtectedRoute component={AI} />
        </Route>
        <Route path="/agent-builder">
          <ProtectedRoute component={AgentBuilder} />
        </Route>
        <Route path="/profile">
          <ProtectedRoute component={Profile} />
        </Route>
        <Route path="/admin">
          <ProtectedRoute adminOnly component={Admin} />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
