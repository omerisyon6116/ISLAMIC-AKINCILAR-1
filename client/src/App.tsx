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
import EventDetail from "@/pages/EventDetail";
import PostDetail from "@/pages/PostDetail";
import Posts from "@/pages/Posts";
import ForumHome from "@/pages/ForumHome";
import ForumCategory from "@/pages/ForumCategory";
import ForumThread from "@/pages/ForumThread";
import Activity from "@/pages/Activity";
import Notifications from "@/pages/Notifications";
import Saved from "@/pages/Saved";
import Profile from "@/pages/Profile";
import NotificationsPage from "@/pages/Notifications";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import Saved from "@/pages/Saved";
import { SiteContentProvider } from "@/lib/site-content";
import { AuthProvider, RequireAuth } from "@/lib/auth";
import { tenantBasePath } from "@/lib/tenant";

function RedirectToTenant({ suffix = "" }: { suffix?: string }) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation(`${tenantBasePath}${suffix}`);
  }, [setLocation, suffix]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path={tenantBasePath} component={Home} />
      <Route path={`${tenantBasePath}/login`} component={Login} />
      <Route path={`${tenantBasePath}/register`} component={Register} />
      <Route path={`${tenantBasePath}/forum`} component={ForumHome} />
      <Route path={`${tenantBasePath}/activity`} component={Activity} />
      <Route path={`${tenantBasePath}/notifications`} component={Notifications} />
      <Route path={`${tenantBasePath}/notifications`} component={NotificationsPage} />
      <Route path={`${tenantBasePath}/saved`} component={Saved} />
      <Route path={`${tenantBasePath}/u/:username`}>
        {(params) => <Profile username={params.username} />}
      </Route>
      <Route path={`${tenantBasePath}/forum/category/:id`}>
        {(params) => <ForumCategory categoryId={params.id} />}
      </Route>
      <Route path={`${tenantBasePath}/forum/thread/:id`}>
        {(params) => <ForumThread threadId={params.id} />}
      </Route>
      <Route path={`${tenantBasePath}/notifications`}>
        <RequireAuth>
          <Notifications />
        </RequireAuth>
      </Route>
      <Route path={`${tenantBasePath}/saved`}>
        <RequireAuth>
          <Saved />
        </RequireAuth>
      </Route>
      <Route path={`${tenantBasePath}/forum/category/:id`}>
        {(params) => <ForumCategory categoryId={params.id} />}
      </Route>
      <Route path={`${tenantBasePath}/forum/thread/:id`}>
        {(params) => <ForumThread threadId={params.id} />}
      </Route>
      <Route path={`${tenantBasePath}/u/:username`}>
        {(params) => <Profile username={params.username} />}
      </Route>
      <Route path={`${tenantBasePath}/events/:id`}>
        {(params) => <EventDetail eventId={params.id} />}
      </Route>
      <Route path={`${tenantBasePath}/posts`} component={Posts} />
      <Route path={`${tenantBasePath}/posts/:id`}>
        {(params) => <PostDetail postId={params.id} />}
      </Route>
      <Route path={`${tenantBasePath}/u/:username`}>
        {(params) => <Profile username={params.username} />}
      </Route>
      <Route path={`${tenantBasePath}/admin`}>
        <RequireAuth requiredRoles={["superadmin", "admin"]}>
          <Admin />
        </RequireAuth>
      </Route>
      <Route path="/">
        <RedirectToTenant />
      </Route>
      <Route path="/admin">
        <RedirectToTenant suffix="/admin" />
      </Route>
      <Route path="/login">
        <RedirectToTenant suffix="/login" />
      </Route>
      <Route path="/register">
        <RedirectToTenant suffix="/register" />
      </Route>
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
