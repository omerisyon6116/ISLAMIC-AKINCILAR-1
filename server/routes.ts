import type { Express, Request, Response, NextFunction } from "express";
import { type Server } from "http";
import { passport } from "./auth";
import { db } from "./db";
import { users, tenants, tenantMembers } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalı").max(50),
  email: z.string().email("Geçerli bir email adresi girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  displayName: z.string().optional(),
});

const loginSchema = z.object({
  username: z.string().min(1, "Kullanıcı adı gerekli"),
  password: z.string().min(1, "Şifre gerekli"),
});

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Oturum açmanız gerekiyor" });
}

function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Oturum açmanız gerekiyor" });
    }
    if (!roles.includes(req.user!.role)) {
      return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
    }
    next();
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ==========================================
  // AUTHENTICATION ROUTES
  // ==========================================

  // Register new user
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          message: "Doğrulama hatası", 
          errors: parsed.error.flatten().fieldErrors 
        });
      }

      const { username, email, password, displayName } = parsed.data;

      // Check if username exists
      const [existingUsername] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUsername) {
        return res.status(400).json({ message: "Bu kullanıcı adı zaten kullanılıyor" });
      }

      // Check if email exists
      const [existingEmail] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingEmail) {
        return res.status(400).json({ message: "Bu email adresi zaten kayıtlı" });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          username,
          email,
          passwordHash,
          displayName: displayName || username,
          role: "user",
          status: "active",
        })
        .returning();

      // Get default tenant and add user as member
      const [defaultTenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.slug, "akincilar"))
        .limit(1);

      if (defaultTenant) {
        await db.insert(tenantMembers).values({
          tenantId: defaultTenant.id,
          userId: newUser.id,
          role: "member",
        });
      }

      // Auto-login after registration
      const safeUser = {
        id: newUser.id,
        username: newUser.username,
        displayName: newUser.displayName,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        bio: newUser.bio,
        avatarUrl: newUser.avatarUrl,
        trustLevel: newUser.trustLevel,
        reputationPoints: newUser.reputationPoints,
        emailVerified: newUser.emailVerified,
        createdAt: newUser.createdAt,
      };

      req.login(safeUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Oturum açılamadı" });
        }
        return res.status(201).json({ 
          message: "Kayıt başarılı", 
          user: safeUser 
        });
      });
    } catch (error) {
      console.error("Register error:", error);
      return res.status(500).json({ message: "Sunucu hatası" });
    }
  });

  // Login
  app.post("/api/auth/login", (req: Request, res: Response, next: NextFunction) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ 
        message: "Doğrulama hatası", 
        errors: parsed.error.flatten().fieldErrors 
      });
    }

    passport.authenticate("local", (err: any, user: Express.User | false, info: { message: string }) => {
      if (err) {
        return res.status(500).json({ message: "Sunucu hatası" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Giriş başarısız" });
      }
      
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Oturum açılamadı" });
        }
        return res.json({ 
          message: "Giriş başarılı", 
          user 
        });
      });
    })(req, res, next);
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Çıkış yapılamadı" });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Oturum sonlandırılamadı" });
        }
        res.clearCookie("connect.sid");
        return res.json({ message: "Çıkış yapıldı" });
      });
    });
  });

  // Get current user
  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Oturum açık değil", user: null });
    }
    return res.json({ user: req.user });
  });

  // ==========================================
  // HEALTH CHECK
  // ==========================================

  app.get("/api/health", (_req: Request, res: Response) => {
    return res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  return httpServer;
}
