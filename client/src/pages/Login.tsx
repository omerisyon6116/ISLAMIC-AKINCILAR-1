import { useState, type FormEvent } from "react";
import { useLocation } from "wouter";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { tenantHref } from "@/lib/tenant";
import { Terminal, ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Eksik bilgi",
        description: "Kullanıcı adı ve şifre gereklidir.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    const result = await login(username, password);
    
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Giriş başarılı",
        description: "Hoşgeldiniz!",
      });
      setLocation("/admin");
    } else {
      toast({
        title: "Giriş başarısız",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="w-full max-w-md relative">
        <Link href={tenantHref("/")} className="inline-flex items-center gap-2 text-sm font-mono text-primary hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Ana sayfaya dön
        </Link>

        <Card className="border-primary/30 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/20 border border-primary flex items-center justify-center mb-4">
              <Terminal className="w-7 h-7 text-primary" />
            </div>
            <CardTitle className="text-2xl font-heading tracking-widest">SİSTEME GİR</CardTitle>
            <CardDescription>Akıncılar yönetim paneline erişmek için giriş yapın.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Kullanıcı Adı</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                  data-testid="input-username"
                  className="bg-background/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    data-testid="input-password"
                    className="bg-background/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full font-bold tracking-widest"
                disabled={isSubmitting || authLoading}
                data-testid="button-login"
              >
                {isSubmitting ? "GİRİŞ YAPILIYOR..." : "GİRİŞ YAP"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Henüz hesabınız yok mu?</p>
              <Link href={tenantHref("/register")} className="text-primary hover:underline">
                Kayıt ol
              </Link>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6 font-mono">
          AKINCILAR v1.0 | Güvenli bağlantı
        </p>
      </div>
    </div>
  );
}
