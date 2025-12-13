import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  integer,
  boolean,
  jsonb,
  index
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================
// TENANTS & MULTI-TENANT SYSTEM
// ============================================

export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  plan: text("plan").notNull().default("free"), // free | pro | enterprise
  status: text("status").notNull().default("active"), // active | suspended
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tenantSettings = pgTable("tenant_settings", {
  tenantId: varchar("tenant_id").primaryKey().references(() => tenants.id, { onDelete: "cascade" }),
  siteTitle: text("site_title"),
  heroTitle: text("hero_title"),
  heroSubtitle: text("hero_subtitle"),
  contactEmail: text("contact_email"),
  socials: jsonb("socials"), // {facebook, twitter, instagram, etc}
  defaultLanguage: text("default_language").default("tr"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tenantMembers = pgTable("tenant_members", {
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"), // owner | admin | moderator | editor | member
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
}, (table) => ({
  pk: sql`PRIMARY KEY (${table.tenantId}, ${table.userId})`,
}));

// ============================================
// USERS & AUTHENTICATION
// ============================================

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  displayName: text("display_name"),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"), // superadmin | admin | moderator | user
  status: text("status").notNull().default("active"), // active | suspended | banned
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  trustLevel: integer("trust_level").notNull().default(0), // 0-5
  reputationPoints: integer("reputation_points").notNull().default(0),
  emailVerified: boolean("email_verified").notNull().default(false),
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  usernameIdx: index("users_username_idx").on(table.username),
}));

export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull(),
  ip: text("ip"),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("user_sessions_user_idx").on(table.userId),
}));

// ============================================
// CMS (BLOG & PAGES)
// ============================================

export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  authorId: varchar("author_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImage: text("cover_image"),
  status: text("status").notNull().default("draft"), // draft | scheduled | published
  publishedAt: timestamp("published_at"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantSlugIdx: index("posts_tenant_slug_idx").on(table.tenantId, table.slug),
  statusIdx: index("posts_status_idx").on(table.status),
}));

// ============================================
// EVENTS
// ============================================

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category"),
  description: text("description"),
  location: text("location"),
  eventDate: timestamp("event_date"),
  capacity: integer("capacity"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  tenantIdx: index("events_tenant_idx").on(table.tenantId),
}));

export const eventRegistrations = pgTable("event_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  status: text("status").notNull().default("registered"), // registered | attended | cancelled
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  eventIdx: index("event_registrations_event_idx").on(table.eventId),
}));

// ============================================
// FORUM SYSTEM
// ============================================

export const forumCategories = pgTable("forum_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  isLocked: boolean("is_locked").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  tenantSlugIdx: index("forum_categories_tenant_slug_idx").on(table.tenantId, table.slug),
}));

export const forumThreads = pgTable("forum_threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  categoryId: varchar("category_id").notNull().references(() => forumCategories.id, { onDelete: "cascade" }),
  authorId: varchar("author_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  body: text("body").notNull(),
  isPinned: boolean("is_pinned").notNull().default(false),
  isLocked: boolean("is_locked").notNull().default(false),
  isHidden: boolean("is_hidden").notNull().default(false),
  viewsCount: integer("views_count").notNull().default(0),
  repliesCount: integer("replies_count").notNull().default(0),
  lastActivityAt: timestamp("last_activity_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  categoryIdx: index("forum_threads_category_idx").on(table.categoryId),
  tenantCategoryIdx: index("forum_threads_tenant_category_idx").on(table.tenantId, table.categoryId),
}));

export const forumReplies = pgTable("forum_replies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull().references(() => forumThreads.id, { onDelete: "cascade" }),
  authorId: varchar("author_id").notNull().references(() => users.id),
  body: text("body").notNull(),
  isHidden: boolean("is_hidden").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  threadIdx: index("forum_replies_thread_idx").on(table.threadId),
}));

export const forumReactions = pgTable("forum_reactions", {
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetType: text("target_type").notNull(), // thread | reply
  targetId: varchar("target_id").notNull(),
  reactionType: text("reaction_type").notNull().default("like"), // like | helpful | etc
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  pk: sql`PRIMARY KEY (${table.userId}, ${table.targetType}, ${table.targetId})`,
}));

export const forumSubscriptions = pgTable("forum_subscriptions", {
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  threadId: varchar("thread_id").notNull().references(() => forumThreads.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  pk: sql`PRIMARY KEY (${table.userId}, ${table.threadId})`,
}));

// ============================================
// NOTIFICATIONS
// ============================================

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // reply | mention | like | dm | mod_action
  payload: jsonb("payload").notNull(), // {threadId, replyId, message, etc}
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("notifications_user_idx").on(table.userId),
  userUnreadIdx: index("notifications_user_unread_idx").on(table.userId, table.isRead),
}));

// ============================================
// DIRECT MESSAGES
// ============================================

export const dmThreads = pgTable("dm_threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const dmParticipants = pgTable("dm_participants", {
  threadId: varchar("thread_id").notNull().references(() => dmThreads.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lastReadAt: timestamp("last_read_at"),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
}, (table) => ({
  pk: sql`PRIMARY KEY (${table.threadId}, ${table.userId})`,
}));

export const dmMessages = pgTable("dm_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull().references(() => dmThreads.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  threadIdx: index("dm_messages_thread_idx").on(table.threadId),
}));

// ============================================
// GROUPS / ROOMS
// ============================================

export const groups = pgTable("groups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tenantId: varchar("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  visibility: text("visibility").notNull().default("public"), // public | private
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  tenantSlugIdx: index("groups_tenant_slug_idx").on(table.tenantId, table.slug),
}));

export const groupMembers = pgTable("group_members", {
  groupId: varchar("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"), // admin | member
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
}, (table) => ({
  pk: sql`PRIMARY KEY (${table.groupId}, ${table.userId})`,
}));

// ============================================
// MODERATION & SAFETY
// ============================================

export const forumReports = pgTable("forum_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reporterId: varchar("reporter_id").notNull().references(() => users.id),
  targetType: text("target_type").notNull(), // thread | reply | user | post
  targetId: varchar("target_id").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // pending | reviewed | resolved | dismissed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
}, (table) => ({
  statusIdx: index("forum_reports_status_idx").on(table.status),
}));

export const moderationLogs = pgTable("moderation_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actorId: varchar("actor_id").notNull().references(() => users.id),
  actionType: text("action_type").notNull(), // hide | lock | ban | suspend | warn
  targetType: text("target_type").notNull(), // thread | reply | user | post
  targetId: varchar("target_id").notNull(),
  reason: text("reason"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  actorIdx: index("moderation_logs_actor_idx").on(table.actorId),
  targetIdx: index("moderation_logs_target_idx").on(table.targetType, table.targetId),
}));

// ============================================
// PWA PUSH NOTIFICATIONS
// ============================================

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("push_subscriptions_user_idx").on(table.userId),
}));

// ============================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================

// Tenants
export const insertTenantSchema = createInsertSchema(tenants).omit({ id: true, createdAt: true });
export const selectTenantSchema = createSelectSchema(tenants);
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = z.infer<typeof selectTenantSchema>;

// Tenant Settings
export const insertTenantSettingsSchema = createInsertSchema(tenantSettings).omit({ updatedAt: true });
export const selectTenantSettingsSchema = createSelectSchema(tenantSettings);
export type InsertTenantSettings = z.infer<typeof insertTenantSettingsSchema>;
export type TenantSettings = z.infer<typeof selectTenantSettingsSchema>;

// Users
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  lastLoginAt: true,
  trustLevel: true,
  reputationPoints: true,
  emailVerified: true,
});
export const selectUserSchema = createSelectSchema(users);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = z.infer<typeof selectUserSchema>;

// Posts
export const insertPostSchema = createInsertSchema(posts).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  publishedAt: true,
});
export const selectPostSchema = createSelectSchema(posts);
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = z.infer<typeof selectPostSchema>;

// Events
export const insertEventSchema = createInsertSchema(events).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectEventSchema = createSelectSchema(events);
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = z.infer<typeof selectEventSchema>;

// Event Registrations
export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({ 
  id: true, 
  createdAt: true 
});
export const selectEventRegistrationSchema = createSelectSchema(eventRegistrations);
export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;
export type EventRegistration = z.infer<typeof selectEventRegistrationSchema>;

// Forum Categories
export const insertForumCategorySchema = createInsertSchema(forumCategories).omit({ 
  id: true, 
  createdAt: true 
});
export const selectForumCategorySchema = createSelectSchema(forumCategories);
export type InsertForumCategory = z.infer<typeof insertForumCategorySchema>;
export type ForumCategory = z.infer<typeof selectForumCategorySchema>;

// Forum Threads
export const insertForumThreadSchema = createInsertSchema(forumThreads).omit({ 
  id: true, 
  createdAt: true, 
  lastActivityAt: true,
  viewsCount: true,
  repliesCount: true,
});
export const selectForumThreadSchema = createSelectSchema(forumThreads);
export type InsertForumThread = z.infer<typeof insertForumThreadSchema>;
export type ForumThread = z.infer<typeof selectForumThreadSchema>;

// Forum Replies
export const insertForumReplySchema = createInsertSchema(forumReplies).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectForumReplySchema = createSelectSchema(forumReplies);
export type InsertForumReply = z.infer<typeof insertForumReplySchema>;
export type ForumReply = z.infer<typeof selectForumReplySchema>;

// Notifications
export const insertNotificationSchema = createInsertSchema(notifications).omit({ 
  id: true, 
  createdAt: true 
});
export const selectNotificationSchema = createSelectSchema(notifications);
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = z.infer<typeof selectNotificationSchema>;

// DM Messages
export const insertDMMessageSchema = createInsertSchema(dmMessages).omit({ 
  id: true, 
  createdAt: true 
});
export const selectDMMessageSchema = createSelectSchema(dmMessages);
export type InsertDMMessage = z.infer<typeof insertDMMessageSchema>;
export type DMMessage = z.infer<typeof selectDMMessageSchema>;

// Groups
export const insertGroupSchema = createInsertSchema(groups).omit({ 
  id: true, 
  createdAt: true 
});
export const selectGroupSchema = createSelectSchema(groups);
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = z.infer<typeof selectGroupSchema>;

// Forum Reports
export const insertForumReportSchema = createInsertSchema(forumReports).omit({ 
  id: true, 
  createdAt: true,
  resolvedAt: true,
  resolvedBy: true,
});
export const selectForumReportSchema = createSelectSchema(forumReports);
export type InsertForumReport = z.infer<typeof insertForumReportSchema>;
export type ForumReport = z.infer<typeof selectForumReportSchema>;
