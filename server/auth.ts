import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { User } from "@shared/schema";

declare global {
  namespace Express {
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
      mustChangePassword: boolean;
      createdAt: Date;
      tenantRole?: string;
    }
  }
}

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    async (username, password, done) => {
      try {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        if (!user) {
          return done(null, false, { message: "Kullanıcı bulunamadı" });
        }

        if (user.status === "banned") {
          return done(null, false, { message: "Hesabınız askıya alınmış" });
        }

        if (user.status === "suspended") {
          return done(null, false, { message: "Hesabınız geçici olarak askıda" });
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
          return done(null, false, { message: "Şifre yanlış" });
        }

        await db
          .update(users)
          .set({ lastLoginAt: new Date() })
          .where(eq(users.id, user.id));

        const safeUser: Express.User = {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          role: user.role,
          status: user.status,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          trustLevel: user.trustLevel,
          reputationPoints: user.reputationPoints,
          emailVerified: user.emailVerified,
          mustChangePassword: user.mustChangePassword,
          createdAt: user.createdAt,
        };

        return done(null, safeUser);
      } catch (error) {
        console.error("Local strategy error:", error);
        return done(error as Error);
      }
    }
  )
);

passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      return done(null, false);
    }

    const safeUser: Express.User = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      status: user.status,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      trustLevel: user.trustLevel,
      reputationPoints: user.reputationPoints,
      emailVerified: user.emailVerified,
      mustChangePassword: user.mustChangePassword,
      createdAt: user.createdAt,
    };

    done(null, safeUser);
  } catch (error) {
    done(error);
  }
});

export { passport };
