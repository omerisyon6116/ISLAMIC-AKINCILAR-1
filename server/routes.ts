import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { type Server } from "http";
import { passport } from "./auth";
import { db } from "./db";
import { users, tenants, tenantMembers } from "@shared/schema";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

declare global {
  namespace Express {
    interface Request {
      tenant?: typeof tenants.$inferSelect;
      tenantMembership?: typeof tenantMembers.$inferSelect | null;
    }
  }
}

const DEFAULT_TENANT_SLUG = process.env.DEFAULT_TENANT_SLUG || "akincilar";

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

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  newPassword: z.string().min(8, "Yeni şifre en az 8 karakter olmalı"),
});

async function attachTenant(req: Request, res: Response, next: NextFunction) {
  const tenantSlug = (req.params as { tenantSlug?: string }).tenantSlug || DEFAULT_TENANT_SLUG;

  const [tenant] = await db.select().from(tenants).where(eq(tenants.slug, tenantSlug)).limit(1);

  if (!tenant) {
    return res.status(404).json({ message: "Geçersiz topluluk" });
  }

  req.tenant = tenant;
  return next();
}

async function attachTenantMembership(req: Request, _res: Response, next: NextFunction) {
  if (!req.tenant || !req.isAuthenticated()) {
    req.tenantMembership = null;
    return next();
  }

  const [membership] = await db
    .select()
    .from(tenantMembers)
    .where(and(eq(tenantMembers.tenantId, req.tenant.id), eq(tenantMembers.userId, req.user!.id)))
    .limit(1);

  req.tenantMembership = membership || null;
  if (req.user && membership) {
    req.user.tenantRole = membership.role;
  }

  return next();
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Oturum açmanız gerekiyor" });
  }

  if (!req.tenant || !req.tenantMembership) {
    return res.status(403).json({ message: "Bu kiracı için yetkiniz yok" });
  }

  return next();
}

function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Oturum açmanız gerekiyor" });
    }

    const tenantRole = req.tenantMembership?.role;
    const globalRole = req.user?.role;

    if (globalRole === "superadmin") {
      return next();
    }

    if ((tenantRole && roles.includes(tenantRole)) || (globalRole && roles.includes(globalRole))) {
      return next();
    }

    return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
  };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  const apiRouter = express.Router({ mergeParams: true });
  apiRouter.use(attachTenant);
  apiRouter.use(attachTenantMembership);

  // ==========================================
  // AUTHENTICATION ROUTES
  // ==========================================

  apiRouter.post("/auth/register", async (req: Request, res: Response) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(422).json({
          message: "Doğrulama hatası",
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const { username, email, password, displayName } = parsed.data;

      const [existingUsername] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUsername) {
        return res.status(409).json({ message: "Bu kullanıcı adı zaten kullanılıyor" });
      }

      const [existingEmail] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingEmail) {
        return res.status(409).json({ message: "Bu email adresi zaten kayıtlı" });
      }

      const passwordHash = await bcrypt.hash(password, 12);

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

      await db
        .insert(tenantMembers)
        .values({ tenantId: req.tenant!.id, userId: newUser.id, role: "member" })
        .onConflictDoNothing();

      const safeUser: Express.User = {
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
        mustChangePassword: newUser.mustChangePassword,
        createdAt: newUser.createdAt,
        tenantRole: "member",
      };

      req.login(safeUser, (err) => {
        if (err) {
          return res.status(500).json({ message: "Oturum açılamadı" });
        }
        return res.status(201).json({
          message: "Kayıt başarılı",
          user: safeUser,
          tenant: req.tenant,
        });
      });
    } catch (error) {
      console.error("Register error:", error);
      return res.status(500).json({ message: "Sunucu hatası" });
    }
  });

  apiRouter.post("/auth/login", (req: Request, res: Response, next: NextFunction) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({
        message: "Doğrulama hatası",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    passport.authenticate("local", async (err: any, user: Express.User | false, info: { message: string }) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Sunucu hatası" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Giriş başarısız" });
      }

      try {
        const [membership] = await db
          .select()
          .from(tenantMembers)
          .where(and(eq(tenantMembers.tenantId, req.tenant!.id), eq(tenantMembers.userId, user.id)))
          .limit(1);

        if (!membership) {
          return res.status(403).json({ message: "Bu topluluğa erişim yetkiniz yok" });
        }

        const sessionUser: Express.User = { ...user, tenantRole: membership.role };
        (req.session as any).tenantId = req.tenant!.id;

        req.login(sessionUser, (loginErr) => {
          if (loginErr) {
            console.error("Login session error:", loginErr);
            return res.status(500).json({ message: "Oturum açılamadı" });
          }
          return res.json({
            message: "Giriş başarılı",
            user: sessionUser,
            tenant: req.tenant,
          });
        });
      } catch (membershipError) {
        console.error("Membership lookup error:", membershipError);
        return res.status(500).json({ message: "Sunucu hatası" });
      }
    })(req, res, next);
  });

  apiRouter.post("/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Çıkış yapılamadı" });
      }
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          return res.status(500).json({ message: "Oturum sonlandırılamadı" });
        }
        res.clearCookie("connect.sid");
        return res.json({ message: "Çıkış yapıldı" });
      });
    });
  });

  apiRouter.get("/auth/me", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Oturum açık değil", user: null });
    }

    return res.json({
      user: req.user ? { ...req.user, tenantRole: req.tenantMembership?.role } : null,
      tenant: req.tenant,
    });
  });

  apiRouter.post("/auth/change-password", requireAuth, async (req: Request, res: Response) => {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({
        message: "Doğrulama hatası",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const [user] = await db.select().from(users).where(eq(users.id, req.user!.id)).limit(1);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    const matches = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ message: "Geçerli şifre yanlış" });
    }

    const newHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await db
      .update(users)
      .set({ passwordHash: newHash, mustChangePassword: false })
      .where(eq(users.id, user.id));

    return res.json({ message: "Şifre güncellendi" });
  });

  // ==========================================
  // HEALTH CHECK
  // ==========================================

  apiRouter.get("/health", (_req: Request, res: Response) => {
    return res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  app.use(`/:tenantSlug/api`, apiRouter);
  app.use(
    "/api",
    (req, _res, next) => {
      (req.params as any).tenantSlug = DEFAULT_TENANT_SLUG;
      next();
    },
    apiRouter,
  );

  return httpServer;
}

export { requireAuth, requireRole, attachTenant, attachTenantMembership };
