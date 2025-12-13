import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { queryClient, apiRequest } from "./queryClient";
import { apiBasePath, tenantBasePath } from "./tenant";

const AUTH_ME_KEY = `${apiBasePath}/auth/me`;

interface User {
  id: string;
  username: string;
  displayName: string | null;
  email: string;
  role: string;
  status: string;
  bio: string | null;
  avatarUrl: string | null;
  trustLevel: number;
  reputationPoints: number;
  emailVerified: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchCurrentUser(): Promise<User | null> {
  const res = await fetch(`${apiBasePath}/auth/me`, {
    credentials: "include",
  });
  
  if (res.status === 401) {
    return null;
  }
  
  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }
  
  const data = await res.json();
  return data.user ?? null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: [AUTH_ME_KEY],
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const isAuthenticated = !!user;

  const loginMutation = useMutation({
    mutationFn: async ({ username, password }: { username: string; password: string }) => {
      const res = await apiRequest("POST", `${apiBasePath}/auth/login`, { username, password });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTH_ME_KEY] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `${apiBasePath}/auth/logout`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTH_ME_KEY] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const res = await apiRequest("POST", `${apiBasePath}/auth/register`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AUTH_ME_KEY] });
    },
  });

  const login = async (username: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ username, password });
      return { success: true, message: "Giriş başarılı" };
    } catch (error: any) {
      const message = error?.message || "Giriş başarısız";
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await registerMutation.mutateAsync(data);
      return { success: true, message: "Kayıt başarılı" };
    } catch (error: any) {
      const message = error?.message || "Kayıt başarısız";
      return { success: false, message };
    }
  };

  return (
    <AuthContext.Provider value={{ user: user ?? null, isLoading, isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function RequireAuth({ children, requiredRoles }: { children: ReactNode; requiredRoles?: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation(`${tenantBasePath}/login`);
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary font-mono">Yükleniyor...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary font-mono">Yönlendiriliyor...</div>
      </div>
    );
  }

  if (requiredRoles && user && !requiredRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Yetkisiz Erişim</h1>
          <p className="text-muted-foreground">Bu sayfaya erişim yetkiniz yok.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
