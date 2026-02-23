import { pgTable, uuid, varchar, timestamp, integer, boolean, pgEnum, text } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userStatusEnum = pgEnum("user_status", ["pending_verification", "active", "suspended"]);
export const twoFactorMethodEnum = pgEnum("two_factor_method", ["totp", "backup_code"]);
export const oauthProviderEnum = pgEnum("oauth_provider", ["google", "apple"]);
export const kybStatusEnum = pgEnum("kyb_status", ["not_started", "pending", "verified", "rejected"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  avatarUrl: varchar("avatar_url", { length: 500 }),
  role: varchar("role", { length: 100 }),
  organizationName: varchar("organization_name", { length: 255 }),
  status: userStatusEnum("status").default("pending_verification").notNull(),
  organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
  // Two-factor authentication fields
  twoFactorEnabled: boolean("two_factor_enabled").default(false).notNull(),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorEnabledAt: timestamp("two_factor_enabled_at"),
  // Account lockout fields
  failedTwoFactorAttempts: integer("failed_two_factor_attempts").default(0).notNull(),
  twoFactorLockoutUntil: timestamp("two_factor_lockout_until"),
  failedLoginAttempts: integer("failed_login_attempts").default(0).notNull(),
  lockedUntil: timestamp("locked_until"),
  // OAuth fields
  oauthProvider: oauthProviderEnum("oauth_provider"),
  oauthId: varchar("oauth_id", { length: 255 }),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userRelations = relations(users, (helpers: any) => ({
  organization: helpers.one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
}));

export const organizationRelations = relations(organizations, (helpers: any) => ({
  users: helpers.many(users),
}));

export const emailVerifications = pgTable("email_verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  otpHash: varchar("otp_hash", { length: 255 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  attempts: integer("attempts").default(0).notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const backupCodes = pgTable("backup_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  codeHash: varchar("code_hash", { length: 255 }).notNull(),
  used: boolean("used").default(false).notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const twoFactorAttempts = pgTable("two_factor_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  success: boolean("success").notNull(),
  method: twoFactorMethodEnum("method").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trustedDevices = pgTable("trusted_devices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  deviceToken: varchar("device_token", { length: 255 }).notNull().unique(),
  deviceName: varchar("device_name", { length: 255 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  refreshTokenHash: varchar("refresh_token_hash", { length: 255 }).notNull(),
  deviceInfo: text("device_info"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
});

export const loginAttempts = pgTable("login_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  success: boolean("success").notNull(),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const kybVerifications = pgTable("kyb_verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  registrationType: varchar("registration_type", { length: 255 }).notNull(),
  registrationNo: varchar("registration_no", { length: 255 }).notNull(),
  incorporationCertificatePath: varchar("incorporation_certificate_path", { length: 512 }).notNull(),
  incorporationCertificateUrl: varchar("incorporation_certificate_url", { length: 1024 }).notNull(),
  memorandumArticlePath: varchar("memorandum_article_path", { length: 512 }).notNull(),
  memorandumArticleUrl: varchar("memorandum_article_url", { length: 1024 }).notNull(),
  formC02C07Path: varchar("form_c02_c07_path", { length: 512 }),
  formC02C07Url: varchar("form_c02_c07_url", { length: 1024 }),
  status: kybStatusEnum("status").default("pending").notNull(),
  rejectionReason: text("rejection_reason"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
