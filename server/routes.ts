import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { type Server } from "http";
import { passport } from "./auth";
import { db } from "./db";
import {
  users,
  tenants,
  tenantMembers,
  forumCategories,
  forumThreads,
  forumReplies,
  forumReactions,
  forumSubscriptions,
  posts,
  events,
  tenantSettings,
  notifications,
  moderationLogs,
} from "@shared/schema";
import { and, desc, eq, like, sql, inArray } from "drizzle-orm";
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

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const createThreadSchema = z.object({
  title: z.string().min(3),
  body: z.string().min(1),
});

const createReplySchema = z.object({
  body: z.string().min(1),
});

const createEventSchema = z.object({
  title: z.string().min(1),
  category: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  eventDate: z.coerce.date().optional(),
  capacity: z.coerce.number().int().optional(),
});

const updateEventSchema = createEventSchema.partial();

const createPostSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  coverImage: z.string().optional(),
  status: z.enum(["draft", "published", "scheduled"]).optional(),
  publishedAt: z.coerce.date().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
});

const updatePostSchema = createPostSchema.partial();

const updateSiteContentSchema = z.object({
  siteTitle: z.string().optional(),
  heroTitle: z.string().optional(),
  heroSubtitle: z.string().optional(),
  contactEmail: z.string().email().optional(),
  socials: z.record(z.string()).optional(),
  defaultLanguage: z.string().optional(),
});

const updateMemberRoleSchema = z.object({
  role: z.string().min(1),
});

const followSchema = z.object({
  targetType: z.enum(["category", "thread"]),
  targetId: z.string().min(1),
});

const saveSchema = z.object({
  targetType: z.enum(["thread", "post"]),
  targetId: z.string().min(1),
});

const authRateLimitWindowMs = 15 * 60 * 1000;
const authRateLimitMax = 20;
const authRateMap = new Map<string, { count: number; reset: number }>();

function rateLimitAuth(req: Request, res: Response, next: NextFunction) {
  const key = req.ip;
  const now = Date.now();
  const current = authRateMap.get(key) || { count: 0, reset: now + authRateLimitWindowMs };

  if (now > current.reset) {
    current.count = 0;
    current.reset = now + authRateLimitWindowMs;
  }

  current.count += 1;
  authRateMap.set(key, current);

  if (current.count > authRateLimitMax) {
    return res.status(429).json({ message: "Çok fazla istek, lütfen bekleyin" });
  }

  return next();
}

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

    if (!req.tenantMembership && globalRole !== "superadmin") {
      return res.status(403).json({ message: "Bu kiracı için üyelik gerekli" });
    }

    if (globalRole === "superadmin") {
      return next();
    }

    if ((tenantRole && roles.includes(tenantRole)) || (globalRole && roles.includes(globalRole))) {
      return next();
    }

    return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
  };
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function logAudit(
  actorId: string | null,
  actionType: string,
  targetType: string,
  targetId: string,
  metadata?: Record<string, unknown>,
) {
  if (!actorId) return;
  try {
    await db.insert(moderationLogs).values({
      actorId,
      actionType,
      targetType,
      targetId,
      metadata,
    });
  } catch (error) {
    console.error("Audit log error", error);
  }
}

const privilegedRoles = ["superadmin", "owner"] as const;

function canManageMembership(
  actorTenantRole: string | undefined,
  actorGlobalRole: string | undefined,
  targetRole?: string,
  desiredRole?: string,
) {
  if (actorGlobalRole === "superadmin") return true;
  if (actorTenantRole === "owner") return true;
  if (actorTenantRole === "admin") {
    const manageable = ["member", "moderator", "editor"];
    return (!targetRole || manageable.includes(targetRole)) && (!desiredRole || manageable.includes(desiredRole));
  }
  return false;
}

async function isLastSuperAdmin(tenantId: string, userId: string) {
  const remaining = await db
    .select()
    .from(tenantMembers)
    .where(and(eq(tenantMembers.tenantId, tenantId), inArray(tenantMembers.role, privilegedRoles)));

  return remaining.length <= 1 && remaining.some((member) => member.userId === userId);
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

  apiRouter.post("/auth/register", rateLimitAuth, async (req: Request, res: Response) => {
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
        logAudit(safeUser.id, "register", "auth", req.tenant!.id, { tenantId: req.tenant!.id }).catch(() => {});

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

  apiRouter.post("/auth/login", rateLimitAuth, (req: Request, res: Response, next: NextFunction) => {
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
          logAudit(sessionUser.id, "login", "auth", req.tenant!.id, { tenantId: req.tenant!.id }).catch(() => {});

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
    const userId = req.user?.id ?? null;
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Çıkış yapılamadı" });
      }
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          return res.status(500).json({ message: "Oturum sonlandırılamadı" });
        }
        res.clearCookie("connect.sid");
        logAudit(userId, "logout", "auth", req.tenant!.id, { tenantId: req.tenant!.id }).catch(() => {});
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
  // FORUM
  // ==========================================

  apiRouter.get("/forum/categories", async (req: Request, res: Response) => {
    const categories = await db
      .select()
      .from(forumCategories)
      .where(eq(forumCategories.tenantId, req.tenant!.id))
      .orderBy(forumCategories.createdAt);

    const categoriesWithActivity = await Promise.all(
      categories.map(async (category) => {
        const [lastThread] = await db
          .select({
            thread: forumThreads,
            author: {
              id: users.id,
              username: users.username,
              displayName: users.displayName,
            },
          })
          .from(forumThreads)
          .leftJoin(users, eq(forumThreads.authorId, users.id))
          .where(and(eq(forumThreads.categoryId, category.id), eq(forumThreads.tenantId, req.tenant!.id)))
          .orderBy(desc(forumThreads.lastActivityAt))
          .limit(1);

        return {
          ...category,
          lastThread: lastThread
            ? { ...lastThread.thread, author: lastThread.author }
            : null,
        };
      }),
    );

    return res.json({ categories: categoriesWithActivity });
    const categoryIds = categories.map((c) => c.id);
    let latestThreads: Record<string, any> = {};

    if (categoryIds.length > 0) {
      const latest = await db
        .select({
          thread: forumThreads,
          author: {
            id: users.id,
            username: users.username,
            displayName: users.displayName,
          },
        })
        .from(forumThreads)
        .leftJoin(users, eq(forumThreads.authorId, users.id))
        .where(inArray(forumThreads.categoryId, categoryIds))
        .orderBy(desc(forumThreads.lastActivityAt));

      latestThreads = latest.reduce((acc, row) => {
        if (!acc[row.thread.categoryId]) {
          acc[row.thread.categoryId] = { ...row.thread, author: row.author };
        }
        return acc;
      }, {} as Record<string, any>);
    }

    return res.json({
      categories: categories.map((category) => ({
        ...category,
        latestThread: latestThreads[category.id] || null,
      })),
    });
    return res.json({ categories });
  });

  apiRouter.get("/forum/categories/:categoryId/threads", async (req: Request, res: Response) => {
    const pagination = paginationSchema.safeParse(req.query);
    if (!pagination.success) {
      return res.status(422).json({ message: "Geçersiz sayfalama" });
    }

    const { page, limit } = pagination.data;
    const offset = (page - 1) * limit;

    const [category] = await db
      .select()
      .from(forumCategories)
      .where(and(eq(forumCategories.id, req.params.categoryId), eq(forumCategories.tenantId, req.tenant!.id)))
      .limit(1);

    if (!category) {
      return res.status(404).json({ message: "Kategori bulunamadı" });
    }

    const threads = await db
      .select({
        thread: forumThreads,
        author: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          role: users.role,
        },
      })
      .from(forumThreads)
      .leftJoin(users, eq(forumThreads.authorId, users.id))
      .where(and(eq(forumThreads.categoryId, category.id), eq(forumThreads.tenantId, req.tenant!.id)))
      .orderBy(desc(forumThreads.isPinned), desc(forumThreads.createdAt))
      .limit(limit)
      .offset(offset);

    const countResult = await db.execute(
      sql`select count(*)::int as count from ${forumThreads} where ${forumThreads.categoryId} = ${category.id} and ${forumThreads.tenantId} = ${req.tenant!.id}`,
    );
    const total = Number((countResult.rows[0] as any).count || 0);

    return res.json({
      category,
      threads: threads.map((row) => ({ ...row.thread, author: row.author })),
      pagination: { page, limit, total },
    });
  });

  apiRouter.post("/forum/categories/:categoryId/threads", requireAuth, async (req: Request, res: Response) => {
    const parsed = createThreadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({ message: "Geçersiz veri" });
    }

    const [category] = await db
      .select()
      .from(forumCategories)
      .where(and(eq(forumCategories.id, req.params.categoryId), eq(forumCategories.tenantId, req.tenant!.id)))
      .limit(1);

    if (!category || category.isLocked) {
      return res.status(403).json({ message: "Bu kategoride konu açılamaz" });
    }

    const slugBase = slugify(parsed.data.title);
    const [thread] = await db
      .insert(forumThreads)
      .values({
        tenantId: req.tenant!.id,
        categoryId: category.id,
        authorId: req.user!.id,
        title: parsed.data.title,
        slug: slugBase || `thread-${Date.now()}`,
        body: parsed.data.body,
      })
      .returning();

    return res.status(201).json({ thread });
  });

  apiRouter.get("/forum/threads/:threadId", async (req: Request, res: Response) => {
    const pagination = paginationSchema.safeParse(req.query);
    if (!pagination.success) {
      return res.status(422).json({ message: "Geçersiz sayfalama" });
    }

    const { page, limit } = pagination.data;
    const offset = (page - 1) * limit;

    const [threadRow] = await db
      .select({
        thread: forumThreads,
        author: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          role: users.role,
        },
      })
      .from(forumThreads)
      .leftJoin(users, eq(forumThreads.authorId, users.id))
      .where(and(eq(forumThreads.id, req.params.threadId), eq(forumThreads.tenantId, req.tenant!.id)))
      .limit(1);

    if (!threadRow) {
      return res.status(404).json({ message: "Konu bulunamadı" });
    }

    await db
      .update(forumThreads)
      .set({ viewsCount: sql`${forumThreads.viewsCount} + 1` })
      .where(eq(forumThreads.id, threadRow.thread.id));
    const [viewedThread] = await db
      .update(forumThreads)
      .set({ viewsCount: sql`${forumThreads.viewsCount} + 1` })
      .where(eq(forumThreads.id, threadRow.thread.id))
      .returning();

    const replies = await db
      .select({
        reply: forumReplies,
        author: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          role: users.role,
        },
      })
      .from(forumReplies)
      .leftJoin(users, eq(forumReplies.authorId, users.id))
      .where(eq(forumReplies.threadId, threadRow.thread.id))
      .orderBy(forumReplies.createdAt)
      .limit(limit)
      .offset(offset);

    const countResult = await db.execute(
      sql`select count(*)::int as count from ${forumReplies} where ${forumReplies.threadId} = ${threadRow.thread.id}`,
    );
    const total = Number((countResult.rows[0] as any).count || 0);

    let isSubscribed = false;
    let isSaved = false;

    if (req.user) {
      const [sub] = await db
        .select()
        .from(forumSubscriptions)
        .where(and(eq(forumSubscriptions.threadId, threadRow.thread.id), eq(forumSubscriptions.userId, req.user!.id)))
        .limit(1);
      isSubscribed = !!sub;

      const [saved] = await db
        .select()
        .from(forumReactions)
        .where(
          and(
            eq(forumReactions.userId, req.user!.id),
            eq(forumReactions.targetId, threadRow.thread.id),
            eq(forumReactions.targetType, "thread"),
            eq(forumReactions.reactionType, "save"),
          ),
        )
        .limit(1);
      isSaved = !!saved;
    }

    return res.json({
      thread: { ...threadRow.thread, ...(viewedThread ?? {}), author: threadRow.author, isSubscribed, isSaved },
    return res.json({
      thread: { ...threadRow.thread, author: threadRow.author },
      replies: replies.map((row) => ({ ...row.reply, author: row.author })),
      pagination: { page, limit, total },
    });
  });

  apiRouter.post("/forum/threads/:threadId/replies", requireAuth, async (req: Request, res: Response) => {
    const parsed = createReplySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({ message: "Geçersiz veri" });
    }

    const [thread] = await db
      .select()
      .from(forumThreads)
      .where(and(eq(forumThreads.id, req.params.threadId), eq(forumThreads.tenantId, req.tenant!.id)))
      .limit(1);

    if (!thread) {
      return res.status(404).json({ message: "Konu bulunamadı" });
    }

    if (thread.isLocked) {
      return res.status(403).json({ message: "Konu kilitli" });
    }

    const [reply] = await db
      .insert(forumReplies)
      .values({
        threadId: thread.id,
        authorId: req.user!.id,
        body: parsed.data.body,
      })
      .returning();

    await db
      .update(forumThreads)
      .set({
        repliesCount: sql`${forumThreads.repliesCount} + 1`,
        lastActivityAt: new Date(),
      })
      .where(eq(forumThreads.id, thread.id));

    if (thread.authorId !== req.user!.id) {
      await db
        .insert(notifications)
        .values({
          userId: thread.authorId,
          type: "reply",
          payload: { threadId: thread.id, replyId: reply.id, message: "Yeni yanıt" },
        })
        .onConflictDoNothing();
    }

    return res.status(201).json({ reply });
  });

  apiRouter.post(
    "/forum/threads/:threadId/lock",
    requireRole("moderator", "admin", "superadmin"),
    async (req: Request, res: Response) => {
      const [thread] = await db
        .select()
        .from(forumThreads)
        .where(and(eq(forumThreads.id, req.params.threadId), eq(forumThreads.tenantId, req.tenant!.id)))
        .limit(1);

      if (!thread) {
        return res.status(404).json({ message: "Konu bulunamadı" });
      }

      const locked = typeof req.body?.locked === "boolean" ? Boolean(req.body.locked) : true;

      const [updated] = await db
        .update(forumThreads)
        .set({ isLocked: locked })
        .where(eq(forumThreads.id, thread.id))
        .returning();

      logAudit(req.user?.id ?? null, "thread_lock", "forum_thread", thread.id, {
        tenantId: req.tenant!.id,
        locked,
      }).catch(() => {});

      return res.json({ thread: updated });
    },
  );

  apiRouter.delete(
    "/forum/threads/:threadId",
    requireRole("moderator", "admin", "superadmin"),
    async (req: Request, res: Response) => {
      const [thread] = await db
        .select()
        .from(forumThreads)
        .where(and(eq(forumThreads.id, req.params.threadId), eq(forumThreads.tenantId, req.tenant!.id)))
        .limit(1);

      if (!thread) {
        return res.status(404).json({ message: "Konu bulunamadı" });
      }

      await db.delete(forumThreads).where(eq(forumThreads.id, thread.id));
      logAudit(req.user?.id ?? null, "thread_delete", "forum_thread", thread.id, {
        tenantId: req.tenant!.id,
      }).catch(() => {});
      return res.json({ message: "Konu silindi" });
    },
  );

  apiRouter.delete(
    "/forum/replies/:replyId",
    requireRole("moderator", "admin", "superadmin"),
    async (req: Request, res: Response) => {
      const [replyRow] = await db
        .select({ reply: forumReplies, thread: forumThreads })
        .from(forumReplies)
        .leftJoin(forumThreads, eq(forumReplies.threadId, forumThreads.id))
        .where(eq(forumReplies.id, req.params.replyId))
        .limit(1);

      if (!replyRow || !replyRow.thread || replyRow.thread.tenantId !== req.tenant!.id) {
        return res.status(404).json({ message: "Yanıt bulunamadı" });
      }

      await db.delete(forumReplies).where(eq(forumReplies.id, req.params.replyId));
      await db
        .update(forumThreads)
        .set({ repliesCount: sql`${forumThreads.repliesCount} - 1` })
        .where(eq(forumThreads.id, replyRow.thread.id));

      if (replyRow.reply.authorId !== req.user!.id) {
        await db
          .insert(notifications)
          .values({
            userId: replyRow.reply.authorId,
            type: "mod_action",
            payload: { action: "reply_deleted", replyId: replyRow.reply.id },
          })
          .onConflictDoNothing();
      }

      logAudit(req.user?.id ?? null, "reply_delete", "forum_reply", replyRow.reply.id, {
        tenantId: req.tenant!.id,
        threadId: replyRow.thread.id,
      }).catch(() => {});

      return res.json({ message: "Yanıt silindi" });
    },
  );

  apiRouter.get("/forum/needs-answers", async (req: Request, res: Response) => {
    const threads = await db
      .select({
        thread: forumThreads,
        author: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
        },
      })
      .from(forumThreads)
      .leftJoin(users, eq(forumThreads.authorId, users.id))
      .where(and(eq(forumThreads.tenantId, req.tenant!.id), eq(forumThreads.repliesCount, 0)))
      .orderBy(desc(forumThreads.createdAt))
      .limit(10);

    return res.json({
      threads: threads.map((row) => ({ ...row.thread, author: row.author })),
    });
  });

  apiRouter.get("/forum/highlights", async (req: Request, res: Response) => {
    const baseSelect = {
      thread: forumThreads,
    const baseSelection = {
      thread: forumThreads,
      category: {
        id: forumCategories.id,
        name: forumCategories.name,
      },
      author: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
      },
    };

    const newThreads = await db
      .select(baseSelect)
      .from(forumThreads)
      .leftJoin(users, eq(forumThreads.authorId, users.id))
      .where(eq(forumThreads.tenantId, req.tenant!.id))
      .orderBy(desc(forumThreads.createdAt))
      .limit(6);

    const mostReplied = await db
      .select(baseSelect)
      .from(forumThreads)
      .leftJoin(users, eq(forumThreads.authorId, users.id))
      .where(eq(forumThreads.tenantId, req.tenant!.id))
      .orderBy(desc(forumThreads.repliesCount), desc(forumThreads.lastActivityAt))
      .limit(6);

    const mostViewed = await db
      .select(baseSelect)
      .from(forumThreads)
      .leftJoin(users, eq(forumThreads.authorId, users.id))
      .where(eq(forumThreads.tenantId, req.tenant!.id))
      .orderBy(desc(forumThreads.viewsCount), desc(forumThreads.lastActivityAt))
      .limit(6);

    return res.json({
      newThreads: newThreads.map((row) => ({ ...row.thread, author: row.author })),
      mostReplied: mostReplied.map((row) => ({ ...row.thread, author: row.author })),
      mostViewed: mostViewed.map((row) => ({ ...row.thread, author: row.author })),
    const newest = await db
      .select(baseSelection)
      .from(forumThreads)
      .leftJoin(forumCategories, eq(forumThreads.categoryId, forumCategories.id))
      .leftJoin(users, eq(forumThreads.authorId, users.id))
      .where(eq(forumThreads.tenantId, req.tenant!.id))
      .orderBy(desc(forumThreads.createdAt))
      .limit(8);

    const mostAnswered = await db
      .select(baseSelection)
      .from(forumThreads)
      .leftJoin(forumCategories, eq(forumThreads.categoryId, forumCategories.id))
      .leftJoin(users, eq(forumThreads.authorId, users.id))
      .where(eq(forumThreads.tenantId, req.tenant!.id))
      .orderBy(desc(forumThreads.repliesCount), desc(forumThreads.lastActivityAt))
      .limit(8);

    const mostViewed = await db
      .select(baseSelection)
      .from(forumThreads)
      .leftJoin(forumCategories, eq(forumThreads.categoryId, forumCategories.id))
      .leftJoin(users, eq(forumThreads.authorId, users.id))
      .where(eq(forumThreads.tenantId, req.tenant!.id))
      .orderBy(desc(forumThreads.viewsCount), desc(forumThreads.lastActivityAt))
      .limit(8);

    return res.json({
      newest: newest.map((row) => ({ ...row.thread, category: row.category, author: row.author })),
      mostAnswered: mostAnswered.map((row) => ({ ...row.thread, category: row.category, author: row.author })),
      mostViewed: mostViewed.map((row) => ({ ...row.thread, category: row.category, author: row.author })),
    });
  });

  apiRouter.post("/forum/threads/:threadId/subscribe", requireAuth, async (req: Request, res: Response) => {
    const [thread] = await db
      .select()
      .from(forumThreads)
      .where(and(eq(forumThreads.id, req.params.threadId), eq(forumThreads.tenantId, req.tenant!.id)))
      .limit(1);

    if (!thread) {
      return res.status(404).json({ message: "Konu bulunamadı" });
    }

    if (!req.tenantMembership) {
      return res.status(403).json({ message: "Üyelik gerekli" });
    }

    await db
      .insert(forumSubscriptions)
      .values({ userId: req.user!.id, threadId: thread.id })
      .onConflictDoNothing();

    return res.json({ subscribed: true });
  });

  apiRouter.delete("/forum/threads/:threadId/subscribe", requireAuth, async (req: Request, res: Response) => {
    await db
      .delete(forumSubscriptions)
      .where(and(eq(forumSubscriptions.threadId, req.params.threadId), eq(forumSubscriptions.userId, req.user!.id)));

    return res.json({ subscribed: false });
  });

  apiRouter.post("/forum/threads/:threadId/save", requireAuth, async (req: Request, res: Response) => {
    const [thread] = await db
      .select()
      .from(forumThreads)
      .where(and(eq(forumThreads.id, req.params.threadId), eq(forumThreads.tenantId, req.tenant!.id)))
      .limit(1);

    if (!thread) {
      return res.status(404).json({ message: "Konu bulunamadı" });
    }

    if (!req.tenantMembership) {
      return res.status(403).json({ message: "Üyelik gerekli" });
    }

    await db
      .insert(forumReactions)
      .values({
        userId: req.user!.id,
        targetId: thread.id,
        targetType: "thread",
        reactionType: "save",
      })
      .onConflictDoNothing();

    return res.json({ saved: true });
  });

  apiRouter.delete("/forum/threads/:threadId/save", requireAuth, async (req: Request, res: Response) => {
    await db
      .delete(forumReactions)
      .where(
        and(
          eq(forumReactions.userId, req.user!.id),
          eq(forumReactions.targetId, req.params.threadId),
          eq(forumReactions.targetType, "thread"),
          eq(forumReactions.reactionType, "save"),
        ),
      );

    return res.json({ saved: false });
  });

  apiRouter.get("/forum/saved", requireAuth, async (req: Request, res: Response) => {
    const saved = await db
      .select({
        reaction: forumReactions,
        thread: forumThreads,
        category: {
          id: forumCategories.id,
          name: forumCategories.name,
        },
      })
      .from(forumReactions)
      .leftJoin(forumThreads, eq(forumReactions.targetId, forumThreads.id))
      .leftJoin(forumCategories, eq(forumThreads.categoryId, forumCategories.id))
      .where(
        and(
          eq(forumReactions.userId, req.user!.id),
          eq(forumReactions.targetType, "thread"),
          eq(forumReactions.reactionType, "save"),
          eq(forumThreads.tenantId, req.tenant!.id),
        ),
      )
      .orderBy(desc(forumReactions.createdAt));

    return res.json({
      threads: saved
        .filter((row) => row.thread)
        .map((row) => ({ ...row.thread!, category: row.category })),
    });
  });

  apiRouter.get("/profiles/:username", async (req: Request, res: Response) => {
    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        bio: users.bio,
        avatarUrl: users.avatarUrl,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.username, req.params.username))
      .limit(1);

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    const [membership] = await db
      .select()
      .from(tenantMembers)
      .where(and(eq(tenantMembers.userId, user.id), eq(tenantMembers.tenantId, req.tenant!.id)))
      .limit(1);

    if (!membership) {
      return res.status(404).json({ message: "Kullanıcı bu toplulukta değil" });
    }

    const threads = await db
      .select({
        thread: forumThreads,
        category: { id: forumCategories.id, name: forumCategories.name },
      })
      .from(forumThreads)
      .leftJoin(forumCategories, eq(forumThreads.categoryId, forumCategories.id))
      .where(and(eq(forumThreads.authorId, user.id), eq(forumThreads.tenantId, req.tenant!.id)))
      .orderBy(desc(forumThreads.createdAt))
      .limit(10);

    const replies = await db
      .select({
        reply: forumReplies,
        thread: forumThreads,
      })
      .from(forumReplies)
      .leftJoin(forumThreads, eq(forumReplies.threadId, forumThreads.id))
      .where(and(eq(forumReplies.authorId, user.id), eq(forumThreads.tenantId, req.tenant!.id)))
      .orderBy(desc(forumReplies.createdAt))
      .limit(10);

    return res.json({
      user,
      threads: threads.map((row) => ({ ...row.thread, category: row.category })),
      replies: replies
        .filter((row) => row.thread)
        .map((row) => ({ ...row.reply, thread: row.thread })),
    });
  });

  apiRouter.get("/activity", async (req: Request, res: Response) => {
    const pagination = paginationSchema.safeParse(req.query);
    const { limit, page } = pagination.success ? pagination.data : { page: 1, limit: 20 };
    const offset = (page - 1) * limit;

    const threadActivity = await db
      .select({
        id: forumThreads.id,
        title: forumThreads.title,
        createdAt: forumThreads.lastActivityAt,
        type: sql`'thread'::text`.as("type"),
        refId: forumThreads.id,
      })
      .from(forumThreads)
      .where(eq(forumThreads.tenantId, req.tenant!.id))
      .orderBy(desc(forumThreads.lastActivityAt))
      .limit(limit)
      .offset(offset);

    const replyActivity = await db
      .select({
        id: forumReplies.id,
        title: forumReplies.body,
        createdAt: forumReplies.createdAt,
        type: sql`'reply'::text`.as("type"),
        refId: forumReplies.threadId,
      })
      .from(forumReplies)
      .leftJoin(forumThreads, eq(forumReplies.threadId, forumThreads.id))
      .where(eq(forumThreads.tenantId, req.tenant!.id))
      .orderBy(desc(forumReplies.createdAt))
      .limit(limit)
      .offset(offset);

    const postActivity = await db
      .select({
        id: posts.id,
        title: posts.title,
        createdAt: sql`coalesce(${posts.publishedAt}, ${posts.createdAt})`,
        type: sql`'post'::text`.as("type"),
        refId: posts.slug,
      })
      .from(posts)
      .where(eq(posts.tenantId, req.tenant!.id))
      .orderBy(desc(sql`coalesce(${posts.publishedAt}, ${posts.createdAt})`))
      .limit(limit)
      .offset(offset);

    const eventActivity = await db
      .select({
        id: events.id,
        title: events.title,
        createdAt: sql`coalesce(${events.eventDate}, ${events.createdAt})`,
        type: sql`'event'::text`.as("type"),
        refId: events.id,
      })
      .from(events)
      .where(eq(events.tenantId, req.tenant!.id))
      .orderBy(desc(sql`coalesce(${events.eventDate}, ${events.createdAt})`))
      .limit(limit)
      .offset(offset);

    const items = [...threadActivity, ...replyActivity, ...postActivity, ...eventActivity]
      .filter((item) => item.createdAt)
      .sort((a, b) => new Date(b.createdAt as Date).getTime() - new Date(a.createdAt as Date).getTime())
      .slice(0, limit);

    return res.json({ items, pagination: { page, limit } });
  });

  apiRouter.get("/follows", requireAuth, async (req: Request, res: Response) => {
    const targetType = req.query.targetType as string | undefined;
    const targetId = req.query.targetId as string | undefined;

    const follows: {
      targetType: string;
      targetId: string;
      title?: string;
    }[] = [];

    if (!targetType || targetType === "category") {
      const categoryRows = await db
        .select({
          follow: forumReactions,
          category: forumCategories,
        })
        .from(forumReactions)
        .leftJoin(forumCategories, eq(forumReactions.targetId, forumCategories.id))
        .where(
          and(
            eq(forumReactions.userId, req.user!.id),
            eq(forumReactions.reactionType, "follow"),
            eq(forumReactions.targetType, "follow_category"),
            eq(forumCategories.tenantId, req.tenant!.id),
            targetId ? eq(forumReactions.targetId, targetId) : sql`true`,
          ),
        );

      follows.push(
        ...categoryRows
          .filter((row) => row.category)
          .map((row) => ({
            targetType: "category",
            targetId: row.category!.id,
            title: row.category!.name,
          })),
      );
    }

    if (!targetType || targetType === "thread") {
      const threadRows = await db
        .select({ follow: forumReactions, thread: forumThreads })
        .from(forumReactions)
        .leftJoin(forumThreads, eq(forumReactions.targetId, forumThreads.id))
        .where(
          and(
            eq(forumReactions.userId, req.user!.id),
            eq(forumReactions.reactionType, "follow"),
            eq(forumReactions.targetType, "follow_thread"),
            eq(forumThreads.tenantId, req.tenant!.id),
            targetId ? eq(forumReactions.targetId, targetId) : sql`true`,
          ),
        );

      follows.push(
        ...threadRows
          .filter((row) => row.thread)
          .map((row) => ({
            targetType: "thread",
            targetId: row.thread!.id,
            title: row.thread!.title,
          })),
      );
    }

    return res.json({ follows });
  });

  apiRouter.post("/follows", requireAuth, async (req: Request, res: Response) => {
    const parsed = followSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({ message: "Geçersiz veri" });
    }

    if (parsed.data.targetType === "category") {
      const [category] = await db
        .select()
        .from(forumCategories)
        .where(and(eq(forumCategories.id, parsed.data.targetId), eq(forumCategories.tenantId, req.tenant!.id)))
        .limit(1);
      if (!category) return res.status(404).json({ message: "Kategori bulunamadı" });

      await db
        .insert(forumReactions)
        .values({
          userId: req.user!.id,
          targetType: "follow_category",
          targetId: category.id,
          reactionType: "follow",
        })
        .onConflictDoNothing();
    }

    if (parsed.data.targetType === "thread") {
      const [thread] = await db
        .select()
        .from(forumThreads)
        .where(and(eq(forumThreads.id, parsed.data.targetId), eq(forumThreads.tenantId, req.tenant!.id)))
        .limit(1);
      if (!thread) return res.status(404).json({ message: "Konu bulunamadı" });

      await db
        .insert(forumReactions)
        .values({
          userId: req.user!.id,
          targetType: "follow_thread",
          targetId: thread.id,
          reactionType: "follow",
        })
        .onConflictDoNothing();
    }

    return res.json({ message: "Takip edildi" });
  });

  apiRouter.delete("/follows", requireAuth, async (req: Request, res: Response) => {
    const parsed = followSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({ message: "Geçersiz veri" });
    }

    const targetType = parsed.data.targetType === "category" ? "follow_category" : "follow_thread";

    await db
      .delete(forumReactions)
      .where(
        and(
          eq(forumReactions.userId, req.user!.id),
          eq(forumReactions.targetType, targetType),
          eq(forumReactions.targetId, parsed.data.targetId),
          eq(forumReactions.reactionType, "follow"),
        ),
      );

    return res.json({ message: "Takip kaldırıldı" });
  });

  apiRouter.get("/saved", requireAuth, async (req: Request, res: Response) => {
    const targetType = req.query.targetType as string | undefined;

    const savedItems: any[] = [];

    if (!targetType || targetType === "thread") {
      const rows = await db
        .select({ reaction: forumReactions, thread: forumThreads })
        .from(forumReactions)
        .leftJoin(forumThreads, eq(forumReactions.targetId, forumThreads.id))
        .where(
          and(
            eq(forumReactions.userId, req.user!.id),
            eq(forumReactions.targetType, "saved_thread"),
            eq(forumReactions.reactionType, "save"),
            eq(forumThreads.tenantId, req.tenant!.id),
          ),
        );
      savedItems.push(
        ...rows
          .filter((row) => row.thread)
          .map((row) => ({ targetType: "thread", targetId: row.thread!.id, title: row.thread!.title })),
      );
    }

    if (!targetType || targetType === "post") {
      const rows = await db
        .select({ reaction: forumReactions, post: posts })
        .from(forumReactions)
        .leftJoin(posts, eq(forumReactions.targetId, posts.id))
        .where(
          and(
            eq(forumReactions.userId, req.user!.id),
            eq(forumReactions.targetType, "saved_post"),
            eq(forumReactions.reactionType, "save"),
            eq(posts.tenantId, req.tenant!.id),
          ),
        );
      savedItems.push(
        ...rows
          .filter((row) => row.post)
          .map((row) => ({ targetType: "post", targetId: row.post!.id, title: row.post!.title })),
      );
    }

    return res.json({ saved: savedItems });
  });

  apiRouter.post("/saved", requireAuth, async (req: Request, res: Response) => {
    const parsed = saveSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({ message: "Geçersiz veri" });
    }

    if (parsed.data.targetType === "thread") {
      const [thread] = await db
        .select()
        .from(forumThreads)
        .where(and(eq(forumThreads.id, parsed.data.targetId), eq(forumThreads.tenantId, req.tenant!.id)))
        .limit(1);
      if (!thread) return res.status(404).json({ message: "Konu bulunamadı" });

      await db
        .insert(forumReactions)
        .values({
          userId: req.user!.id,
          targetType: "saved_thread",
          targetId: thread.id,
          reactionType: "save",
        })
        .onConflictDoNothing();
    }

    if (parsed.data.targetType === "post") {
      const [post] = await db
        .select()
        .from(posts)
        .where(and(eq(posts.id, parsed.data.targetId), eq(posts.tenantId, req.tenant!.id)))
        .limit(1);
      if (!post) return res.status(404).json({ message: "Yazı bulunamadı" });

      await db
        .insert(forumReactions)
        .values({
          userId: req.user!.id,
          targetType: "saved_post",
          targetId: post.id,
          reactionType: "save",
        })
        .onConflictDoNothing();
    }

    return res.json({ message: "Kaydedildi" });
  });

  apiRouter.delete("/saved", requireAuth, async (req: Request, res: Response) => {
    const parsed = saveSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({ message: "Geçersiz veri" });
    }

    const targetType = parsed.data.targetType === "thread" ? "saved_thread" : "saved_post";

    await db
      .delete(forumReactions)
      .where(
        and(
          eq(forumReactions.userId, req.user!.id),
          eq(forumReactions.targetType, targetType),
          eq(forumReactions.targetId, parsed.data.targetId),
          eq(forumReactions.reactionType, "save"),
        ),
      );

    return res.json({ message: "Kayıt kaldırıldı" });
  });

  // ==========================================
  // EVENTS
  // ==========================================

  apiRouter.get("/events", async (req: Request, res: Response) => {
    const rows = await db
      .select()
      .from(events)
      .where(eq(events.tenantId, req.tenant!.id))
      .orderBy(desc(sql`coalesce(${events.eventDate}, ${events.createdAt})`));

    return res.json({ events: rows });
  });

  apiRouter.get("/events/:id", async (req: Request, res: Response) => {
    const [event] = await db
      .select()
      .from(events)
      .where(and(eq(events.id, req.params.id), eq(events.tenantId, req.tenant!.id)))
      .limit(1);

    if (!event) {
      return res.status(404).json({ message: "Etkinlik bulunamadı" });
    }

    return res.json({ event });
  });

  apiRouter.post("/admin/events", requireRole("admin", "owner", "superadmin"), async (req: Request, res: Response) => {
    const parsed = createEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({ message: "Geçersiz veri" });
    }

    const [event] = await db
      .insert(events)
      .values({
        tenantId: req.tenant!.id,
        title: parsed.data.title,
        category: parsed.data.category,
        description: parsed.data.description,
        location: parsed.data.location,
        eventDate: parsed.data.eventDate,
        capacity: parsed.data.capacity,
      })
      .returning();

    logAudit(req.user?.id ?? null, "event_create", "event", event.id, {
      tenantId: req.tenant!.id,
    }).catch(() => {});

    return res.status(201).json({ event });
  });

  apiRouter.patch(
    "/admin/events/:id",
    requireRole("admin", "owner", "superadmin"),
    async (req: Request, res: Response) => {
      const parsed = updateEventSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(422).json({ message: "Geçersiz veri" });
      }

      const [existing] = await db
        .select()
        .from(events)
        .where(and(eq(events.id, req.params.id), eq(events.tenantId, req.tenant!.id)))
        .limit(1);

      if (!existing) {
        return res.status(404).json({ message: "Etkinlik bulunamadı" });
      }

      const [event] = await db
        .update(events)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(events.id, existing.id))
        .returning();

      logAudit(req.user?.id ?? null, "event_update", "event", event.id, {
        tenantId: req.tenant!.id,
      }).catch(() => {});

      return res.json({ event });
    },
  );

  apiRouter.delete(
    "/admin/events/:id",
    requireRole("admin", "owner", "superadmin"),
    async (req: Request, res: Response) => {
      const [existing] = await db
        .select()
        .from(events)
        .where(and(eq(events.id, req.params.id), eq(events.tenantId, req.tenant!.id)))
        .limit(1);

      if (!existing) {
        return res.status(404).json({ message: "Etkinlik bulunamadı" });
      }

      await db.delete(events).where(eq(events.id, existing.id));
      logAudit(req.user?.id ?? null, "event_delete", "event", existing.id, {
        tenantId: req.tenant!.id,
      }).catch(() => {});
      return res.json({ message: "Etkinlik silindi" });
    },
  );

  // ==========================================
  // POSTS
  // ==========================================

  apiRouter.get("/posts", async (req: Request, res: Response) => {
    const rows = await db
      .select()
      .from(posts)
      .where(and(eq(posts.tenantId, req.tenant!.id), eq(posts.status, "published")))
      .orderBy(desc(sql`coalesce(${posts.publishedAt}, ${posts.createdAt})`));

    return res.json({ posts: rows });
  });

  apiRouter.get("/posts/:idOrSlug", async (req: Request, res: Response) => {
    const [post] = await db
      .select()
      .from(posts)
      .where(
        and(
          eq(posts.tenantId, req.tenant!.id),
          sql`${posts.id} = ${req.params.idOrSlug} or ${posts.slug} = ${req.params.idOrSlug}`,
          eq(posts.status, "published"),
        ),
      )
      .limit(1);

    if (!post) {
      return res.status(404).json({ message: "Yazı bulunamadı" });
    }

    return res.json({ post });
  });

  apiRouter.post("/admin/posts", requireRole("admin", "owner", "superadmin"), async (req: Request, res: Response) => {
    const parsed = createPostSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({ message: "Geçersiz veri" });
    }

    const [post] = await db
      .insert(posts)
      .values({
        ...parsed.data,
        tenantId: req.tenant!.id,
        authorId: req.user!.id,
      })
      .returning();

    logAudit(req.user?.id ?? null, "post_create", "post", post.id, {
      tenantId: req.tenant!.id,
      slug: post.slug,
    }).catch(() => {});

    return res.status(201).json({ post });
  });

  apiRouter.patch(
    "/admin/posts/:id",
    requireRole("admin", "owner", "superadmin"),
    async (req: Request, res: Response) => {
      const parsed = updatePostSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(422).json({ message: "Geçersiz veri" });
      }

      const [existing] = await db
        .select()
        .from(posts)
        .where(and(eq(posts.id, req.params.id), eq(posts.tenantId, req.tenant!.id)))
        .limit(1);

      if (!existing) {
        return res.status(404).json({ message: "Yazı bulunamadı" });
      }

      const [post] = await db
        .update(posts)
        .set({ ...parsed.data, updatedAt: new Date() })
        .where(eq(posts.id, existing.id))
        .returning();

      logAudit(req.user?.id ?? null, "post_update", "post", post.id, {
        tenantId: req.tenant!.id,
        slug: post.slug,
      }).catch(() => {});

      return res.json({ post });
    },
  );

  apiRouter.delete(
    "/admin/posts/:id",
    requireRole("admin", "owner", "superadmin"),
    async (req: Request, res: Response) => {
      const [existing] = await db
        .select()
        .from(posts)
        .where(and(eq(posts.id, req.params.id), eq(posts.tenantId, req.tenant!.id)))
        .limit(1);

      if (!existing) {
        return res.status(404).json({ message: "Yazı bulunamadı" });
      }

      await db.delete(posts).where(eq(posts.id, existing.id));
      logAudit(req.user?.id ?? null, "post_delete", "post", existing.id, {
        tenantId: req.tenant!.id,
      }).catch(() => {});
      return res.json({ message: "Yazı silindi" });
    },
  );

  // ==========================================
  // MEMBERSHIP MANAGEMENT
  // ==========================================

  apiRouter.get(
    "/admin/members",
    requireRole("admin", "owner", "superadmin"),
    async (req: Request, res: Response) => {
      const rows = await db
        .select({ membership: tenantMembers, user: users })
        .from(tenantMembers)
        .leftJoin(users, eq(users.id, tenantMembers.userId))
        .where(eq(tenantMembers.tenantId, req.tenant!.id));

      const members = rows.map((row) => ({
        id: row.user?.id,
        username: row.user?.username,
        displayName: row.user?.displayName,
        email: row.user?.email,
        role: row.membership.role,
        tenantRole: row.membership.role,
        status: row.user?.status,
        joinedAt: row.membership.joinedAt,
      }));

      return res.json({ members });
    },
  );

  apiRouter.patch(
    "/admin/members/:userId/role",
    requireRole("admin", "owner", "superadmin"),
    async (req: Request, res: Response) => {
      const parsed = updateMemberRoleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(422).json({ message: "Geçersiz rol" });
      }

      const [membership] = await db
        .select()
        .from(tenantMembers)
        .where(and(eq(tenantMembers.userId, req.params.userId), eq(tenantMembers.tenantId, req.tenant!.id)))
        .limit(1);

      if (!membership) {
        return res.status(404).json({ message: "Üye bulunamadı" });
      }

      const actorTenantRole = req.tenantMembership?.role;
      const actorGlobalRole = req.user?.role;

      if (!canManageMembership(actorTenantRole, actorGlobalRole, membership.role, parsed.data.role)) {
        return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
      }

      if (
        membership.role &&
        privilegedRoles.includes(membership.role as (typeof privilegedRoles)[number]) &&
        parsed.data.role !== membership.role
      ) {
        const lastSuper = await isLastSuperAdmin(req.tenant!.id, membership.userId);
        if (lastSuper) {
          return res.status(400).json({ message: "Son süper yöneticiyi düşüremezsiniz" });
        }
      }

      const [updated] = await db
        .update(tenantMembers)
        .set({ role: parsed.data.role })
        .where(eq(tenantMembers.userId, membership.userId))
        .returning();

      logAudit(req.user?.id ?? null, "role_change", "member", membership.userId, {
        tenantId: req.tenant!.id,
        from: membership.role,
        to: parsed.data.role,
      }).catch(() => {});

      return res.json({ member: updated });
    },
  );

  apiRouter.delete(
    "/admin/members/:userId",
    requireRole("admin", "owner", "superadmin"),
    async (req: Request, res: Response) => {
      const [membership] = await db
        .select()
        .from(tenantMembers)
        .where(and(eq(tenantMembers.userId, req.params.userId), eq(tenantMembers.tenantId, req.tenant!.id)))
        .limit(1);

      if (!membership) {
        return res.status(404).json({ message: "Üye bulunamadı" });
      }

      const actorTenantRole = req.tenantMembership?.role;
      const actorGlobalRole = req.user?.role;

      if (!canManageMembership(actorTenantRole, actorGlobalRole, membership.role)) {
        return res.status(403).json({ message: "Bu işlem için yetkiniz yok" });
      }

      if (
        membership.role &&
        privilegedRoles.includes(membership.role as (typeof privilegedRoles)[number]) &&
        (await isLastSuperAdmin(req.tenant!.id, membership.userId))
      ) {
        return res.status(400).json({ message: "Son süper yöneticiyi silemezsiniz" });
      }

      await db
        .delete(tenantMembers)
        .where(and(eq(tenantMembers.userId, req.params.userId), eq(tenantMembers.tenantId, req.tenant!.id)));

      logAudit(req.user?.id ?? null, "member_remove", "member", membership.userId, {
        tenantId: req.tenant!.id,
        role: membership.role,
      }).catch(() => {});

      return res.json({ message: "Üyelik kaldırıldı" });
    },
  );

  // ==========================================
  // AUDIT LOGS
  // ==========================================

  apiRouter.get(
    "/admin/audit-logs",
    requireRole("admin", "owner", "superadmin"),
    async (req: Request, res: Response) => {
      const pagination = paginationSchema.safeParse(req.query);
      if (!pagination.success) {
        return res.status(422).json({ message: "Geçersiz sayfalama" });
      }

      const { page, limit } = pagination.data;
      const offset = (page - 1) * limit;

      const logs = await db
        .select()
        .from(moderationLogs)
        .where(sql`(metadata->>'tenantId') = ${req.tenant!.id}`)
        .orderBy(desc(moderationLogs.createdAt))
        .limit(limit)
        .offset(offset);

      return res.json({ logs });
    },
  );

  // ==========================================
  // SITE CONTENT
  // ==========================================

  apiRouter.get("/site-content", async (req: Request, res: Response) => {
    const [settings] = await db
      .select()
      .from(tenantSettings)
      .where(eq(tenantSettings.tenantId, req.tenant!.id))
      .limit(1);

    return res.json({ content: settings || null });
  });

  apiRouter.patch(
    "/site-content",
    requireRole("admin", "editor", "owner", "superadmin"),
    async (req: Request, res: Response) => {
      const parsed = updateSiteContentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(422).json({ message: "Geçersiz veri" });
      }

      const [existing] = await db
        .select()
        .from(tenantSettings)
        .where(eq(tenantSettings.tenantId, req.tenant!.id))
        .limit(1);

      let updated;
      if (existing) {
        [updated] = await db
          .update(tenantSettings)
          .set({ ...parsed.data, updatedAt: new Date() })
          .where(eq(tenantSettings.tenantId, req.tenant!.id))
          .returning();
      } else {
        [updated] = await db
          .insert(tenantSettings)
          .values({ tenantId: req.tenant!.id, ...parsed.data })
          .returning();
      }

      logAudit(req.user?.id ?? null, "site_content_update", "site_content", req.tenant!.id, {
        tenantId: req.tenant!.id,
      }).catch(() => {});

      return res.json({ content: updated });
    },
  );

  // ==========================================
  // NOTIFICATIONS
  // ==========================================

  apiRouter.get("/notifications", requireAuth, async (req: Request, res: Response) => {
    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, req.user!.id))
      .orderBy(desc(notifications.createdAt));

    return res.json({ notifications: rows });
  });

  apiRouter.post("/notifications/read", requireAuth, async (req: Request, res: Response) => {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, req.user!.id));
    return res.json({ message: "Okundu" });
  });

  apiRouter.get("/users/:username/profile", async (req: Request, res: Response) => {
    const [userRow] = await db
      .select({ user: users, membership: tenantMembers })
      .from(users)
      .leftJoin(tenantMembers, and(eq(tenantMembers.userId, users.id), eq(tenantMembers.tenantId, req.tenant!.id)))
      .where(eq(users.username, req.params.username))
      .limit(1);

    if (!userRow?.user || !userRow.membership) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    const threads = await db
      .select({
        thread: forumThreads,
        category: forumCategories,
      })
      .from(forumThreads)
      .leftJoin(forumCategories, eq(forumThreads.categoryId, forumCategories.id))
      .where(and(eq(forumThreads.authorId, userRow.user.id), eq(forumThreads.tenantId, req.tenant!.id)))
      .orderBy(desc(forumThreads.createdAt))
      .limit(10);

    const replies = await db
      .select({
        reply: forumReplies,
        thread: forumThreads,
      })
      .from(forumReplies)
      .leftJoin(forumThreads, eq(forumReplies.threadId, forumThreads.id))
      .where(and(eq(forumReplies.authorId, userRow.user.id), eq(forumThreads.tenantId, req.tenant!.id)))
      .orderBy(desc(forumReplies.createdAt))
      .limit(10);

    return res.json({
      user: {
        id: userRow.user.id,
        username: userRow.user.username,
        displayName: userRow.user.displayName,
        bio: userRow.user.bio,
      },
      threads: threads.map((row) => ({ ...row.thread, category: row.category })),
      replies: replies.map((row) => ({ ...row.reply, thread: row.thread })),
    });
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

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled error", err);
    const status = typeof err?.status === "number" ? err.status : 500;
    return res.status(status).json({ message: err?.message || "Beklenmedik hata" });
  });

  return httpServer;
}

export { requireAuth, requireRole, attachTenant, attachTenantMembership };
