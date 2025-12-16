import { useState, type FormEvent } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { tenantHref } from "@/lib/tenant";
import { Terminal, ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const { register, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !email.trim() || !password.trim()) {
      toast({
        title: "Eksik bilgi",
        description: "Tüm zorunlu alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Şifreler eşleşmiyor",
        description: "Lütfen şifreleri kontrol edin.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Şifre çok kısa",
        description: "Şifre en az 6 karakter olmalı.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    const result = await register({
      username,
      email,
      password,
      displayName: displayName.trim() || undefined,
    });
    
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Kayıt başarılı",
        description: "Hoşgeldiniz! Hesabınız oluşturuldu.",
      });
      setLocation("/");
    } else {
      toast({
        title: "Kayıt başarısız",
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
            <CardTitle className="text-2xl font-heading tracking-widest">KAYIT OL</CardTitle>
            <CardDescription>Akıncılar topluluğuna katılmak için hesap oluşturun.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Kullanıcı Adı *</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="kullanici_adi"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isSubmitting}
                  data-testid="input-register-username"
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Görünen Ad</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Adınız Soyadınız"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isSubmitting}
                  data-testid="input-register-displayname"
                  className="bg-background/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ornek@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  data-testid="input-register-email"
                  className="bg-background/50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Şifre *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="En az 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    data-testid="input-register-password"
                    className="bg-background/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Şifre Tekrar *</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Şifreyi tekrar girin"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isSubmitting}
                  data-testid="input-register-confirm-password"
                  className="bg-background/50"
                />
              </div>

              <Button
                type="submit"
                className="w-full font-bold tracking-widest"
                disabled={isSubmitting || authLoading}
                data-testid="button-register"
              >
                {isSubmitting ? "KAYIT YAPILIYOR..." : "KAYIT OL"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Zaten hesabınız var mı?</p>
              <Link href={tenantHref("/login")} className="text-primary hover:underline">
                Giriş yap
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
