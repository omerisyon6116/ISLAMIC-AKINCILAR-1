import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { SiteContentProvider } from "@/lib/site-content";
import { AuthProvider, RequireAuth } from "@/lib/auth";
import { tenantBasePath } from "@/lib/tenant";

function RedirectToTenant() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation(tenantBasePath);
  }, [setLocation]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path={tenantBasePath} component={Home} />
      <Route path={`${tenantBasePath}/login`} component={Login} />
      <Route path={`${tenantBasePath}/register`} component={Register} />
      <Route path={`${tenantBasePath}/admin`}>
        <RequireAuth requiredRoles={["superadmin", "admin", "moderator"]}>
          <Admin />
        </RequireAuth>
      </Route>
      <Route path="/" component={RedirectToTenant} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SiteContentProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </SiteContentProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
