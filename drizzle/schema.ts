import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  integer,
  decimal,
  timestamp,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// =============================================
// ENUMS
// =============================================

export const userRoleEnum = pgEnum("user_role", [
  "agency_admin",
  "business_admin",
  "worker",
]);

export const cardTypeEnum = pgEnum("card_type", ["stamps", "levels"]);

export const cardStatusEnum = pgEnum("card_status", [
  "active",
  "inactive",
  "archived",
]);

export const completionBehaviorEnum = pgEnum("completion_behavior", [
  "reset",
  "limit",
  "unlimited",
]);

export const pushStatusEnum = pgEnum("push_status", [
  "draft",
  "sending",
  "sent",
  "failed",
]);

export const redemptionStatusEnum = pgEnum("redemption_status", [
  "pending",
  "completed",
  "expired",
  "cancelled",
]);

// =============================================
// MULTI-TENANT CORE
// =============================================

export const agencies = pgTable("agencies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  appName: varchar("app_name", { length: 255 }).notNull(),
  logoUrl: text("logo_url"),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  config: jsonb("config").default({}),
  maxLocations: integer("max_locations").default(1),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  plan: varchar("plan", { length: 50 }).default("starter"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const businesses = pgTable(
  "businesses",
  {
    id: serial("id").primaryKey(),
    agencyId: integer("agency_id")
      .notNull()
      .references(() => agencies.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).unique(),
    logoUrl: text("logo_url"),
    emailDomain: varchar("email_domain", { length: 255 }),
    emailDomainVerified: boolean("email_domain_verified").default(false),
    config: jsonb("config").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_businesses_agency").on(table.agencyId)]
);

export const locations = pgTable(
  "locations",
  {
    id: serial("id").primaryKey(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    address: text("address"),
    city: varchar("city", { length: 100 }),
    region: varchar("region", { length: 100 }),
    country: varchar("country", { length: 10 }).default("ar"),
    latitude: decimal("latitude", { precision: 10, scale: 7 }),
    longitude: decimal("longitude", { precision: 10, scale: 7 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_locations_business").on(table.businessId)]
);

// =============================================
// AUTH & TEAM
// =============================================

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    passwordHash: text("password_hash").notNull(),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    role: userRoleEnum("role").notNull(),
    agencyId: integer("agency_id").references(() => agencies.id, {
      onDelete: "cascade",
    }),
    businessId: integer("business_id").references(() => businesses.id, {
      onDelete: "set null",
    }),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_users_agency").on(table.agencyId),
    index("idx_users_business").on(table.businessId),
  ]
);

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 255 }).primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// =============================================
// LOYALTY CARDS
// =============================================

export const loyaltyCards = pgTable(
  "loyalty_cards",
  {
    id: serial("id").primaryKey(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    type: cardTypeEnum("type").notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    language: varchar("language", { length: 10 }).default("es"),
    status: cardStatusEnum("status").default("active"),
    termsAndConditions: text("terms_and_conditions"),
    // Stamps-specific
    totalStamps: integer("total_stamps"),
    completionBehavior: completionBehaviorEnum("completion_behavior"),
    stampIcon: varchar("stamp_icon", { length: 50 }).default("coffee"),
    // Levels-specific
    currency: varchar("currency", { length: 10 }),
    // Scan limits
    scanLimitEnabled: boolean("scan_limit_enabled").default(false),
    scanLimitCount: integer("scan_limit_count"),
    scanLimitPeriod: varchar("scan_limit_period", { length: 20 }),
    // Registration form
    registrationFields: jsonb("registration_fields").default([]),
    // Geopush
    geopushEnabled: boolean("geopush_enabled").default(false),
    geopushMessage: text("geopush_message"),
    geopushLatitude: decimal("geopush_latitude", { precision: 10, scale: 7 }),
    geopushLongitude: decimal("geopush_longitude", { precision: 10, scale: 7 }),
    geopushRadiusMeters: integer("geopush_radius_meters").default(200),
    // Welcome
    welcomeMessage: text("welcome_message"),
    qrCodeData: text("qr_code_data"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_loyalty_cards_business").on(table.businessId)]
);

export const passDesigns = pgTable("pass_designs", {
  id: serial("id").primaryKey(),
  cardId: integer("card_id")
    .unique()
    .notNull()
    .references(() => loyaltyCards.id, { onDelete: "cascade" }),
  backgroundImage: text("background_image"),
  logoImage: text("logo_image"),
  iconImage: text("icon_image"),
  backgroundColor: varchar("background_color", { length: 7 }),
  foregroundColor: varchar("foreground_color", { length: 7 }),
  labelColor: varchar("label_color", { length: 7 }),
  stripImage: text("strip_image"),
  config: jsonb("config").default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// =============================================
// LEVELS
// =============================================

export const cardLevels = pgTable(
  "card_levels",
  {
    id: serial("id").primaryKey(),
    cardId: integer("card_id")
      .notNull()
      .references(() => loyaltyCards.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    minSpend: decimal("min_spend", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    isInitial: boolean("is_initial").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_card_levels_card").on(table.cardId)]
);

// =============================================
// REWARDS
// =============================================

export const rewards = pgTable(
  "rewards",
  {
    id: serial("id").primaryKey(),
    cardId: integer("card_id")
      .notNull()
      .references(() => loyaltyCards.id, { onDelete: "cascade" }),
    levelId: integer("level_id").references(() => cardLevels.id, {
      onDelete: "cascade",
    }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    stampsRequired: integer("stamps_required"),
    expiryDays: integer("expiry_days"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_rewards_card").on(table.cardId)]
);

// =============================================
// CUSTOMERS (end-users)
// =============================================

export const customers = pgTable(
  "customers",
  {
    id: serial("id").primaryKey(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    customFields: jsonb("custom_fields").default({}),
    applePassSerial: varchar("apple_pass_serial", { length: 255 }),
    applePushToken: text("apple_push_token"),
    googleWalletId: varchar("google_wallet_id", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_customers_business").on(table.businessId),
    uniqueIndex("idx_customers_business_email").on(
      table.businessId,
      table.email
    ),
  ]
);

// =============================================
// CARD ENROLLMENTS
// =============================================

export const cardEnrollments = pgTable(
  "card_enrollments",
  {
    id: serial("id").primaryKey(),
    customerId: integer("customer_id")
      .notNull()
      .references(() => customers.id, { onDelete: "cascade" }),
    cardId: integer("card_id")
      .notNull()
      .references(() => loyaltyCards.id, { onDelete: "cascade" }),
    // Stamps
    currentStamps: integer("current_stamps").default(0),
    totalStamps: integer("total_stamps").default(0),
    completions: integer("completions").default(0),
    // Levels
    currentLevelId: integer("current_level_id").references(() => cardLevels.id),
    totalSpend: decimal("total_spend", { precision: 12, scale: 2 }).default(
      "0"
    ),
    // Tracking
    registrationLinkId: integer("registration_link_id"),
    passSerial: varchar("pass_serial", { length: 255 }).unique(),
    lastVisitAt: timestamp("last_visit_at", { withTimezone: true }),
    totalVisits: integer("total_visits").default(0),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_enrollments_customer").on(table.customerId),
    index("idx_enrollments_card").on(table.cardId),
    uniqueIndex("idx_enrollments_unique").on(table.customerId, table.cardId),
  ]
);

// =============================================
// SCANS / VISITS
// =============================================

export const scans = pgTable(
  "scans",
  {
    id: serial("id").primaryKey(),
    enrollmentId: integer("enrollment_id")
      .notNull()
      .references(() => cardEnrollments.id, { onDelete: "cascade" }),
    locationId: integer("location_id").references(() => locations.id),
    scannedBy: integer("scanned_by").references(() => users.id),
    scanType: varchar("scan_type", { length: 20 }).notNull(), // 'stamp' | 'spend'
    stampsAdded: integer("stamps_added"),
    spendAmount: decimal("spend_amount", { precision: 12, scale: 2 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_scans_enrollment").on(table.enrollmentId),
    index("idx_scans_created").on(table.createdAt),
  ]
);

// =============================================
// REDEMPTIONS
// =============================================

export const redemptions = pgTable(
  "redemptions",
  {
    id: serial("id").primaryKey(),
    enrollmentId: integer("enrollment_id")
      .notNull()
      .references(() => cardEnrollments.id, { onDelete: "cascade" }),
    rewardId: integer("reward_id")
      .notNull()
      .references(() => rewards.id, { onDelete: "cascade" }),
    status: redemptionStatusEnum("status").default("pending"),
    redeemedBy: integer("redeemed_by").references(() => users.id),
    redeemedAt: timestamp("redeemed_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_redemptions_enrollment").on(table.enrollmentId)]
);

// =============================================
// PUSH NOTIFICATIONS
// =============================================

export const pushMessages = pgTable(
  "push_messages",
  {
    id: serial("id").primaryKey(),
    cardId: integer("card_id")
      .notNull()
      .references(() => loyaltyCards.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }),
    body: text("body").notNull(),
    isWelcome: boolean("is_welcome").default(false),
    status: pushStatusEnum("status").default("draft"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    deliveredCount: integer("delivered_count").default(0),
    createdBy: integer("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_push_messages_card").on(table.cardId)]
);

export const pushDeliveries = pgTable("push_deliveries", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id")
    .notNull()
    .references(() => pushMessages.id, { onDelete: "cascade" }),
  enrollmentId: integer("enrollment_id")
    .notNull()
    .references(() => cardEnrollments.id, { onDelete: "cascade" }),
  delivered: boolean("delivered").default(false),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  error: text("error"),
});

// =============================================
// REGISTRATION LINKS
// =============================================

export const registrationLinks = pgTable(
  "registration_links",
  {
    id: serial("id").primaryKey(),
    cardId: integer("card_id")
      .notNull()
      .references(() => loyaltyCards.id, { onDelete: "cascade" }),
    slug: varchar("slug", { length: 100 }).unique().notNull(),
    name: varchar("name", { length: 255 }),
    clicks: integer("clicks").default(0),
    registrations: integer("registrations").default(0),
    revenue: decimal("revenue", { precision: 12, scale: 2 }).default("0"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_registration_links_card").on(table.cardId),
    index("idx_registration_links_slug").on(table.slug),
  ]
);

// =============================================
// MENUS
// =============================================

export const menusPdf = pgTable("menus_pdf", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  fileUrl: text("file_url").notNull(),
  fileName: varchar("file_name", { length: 255 }),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const menuCategories = pgTable("menu_categories", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => menuCategories.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("ARS"),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const clubInvitations = pgTable("club_invitations", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id")
    .unique()
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  cardId: integer("card_id").references(() => loyaltyCards.id),
  title: varchar("title", { length: 255 }).default("¡Únete a Nuestro Club!"),
  description: text("description").default(
    "Únete a nuestro exclusivo club de beneficios y disfruta de ofertas especiales"
  ),
  buttonText: varchar("button_text", { length: 100 }).default("Unirse ahora"),
  isEnabled: boolean("is_enabled").default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// =============================================
// PAYMENTS (USDT BSC - same as Aurion)
// =============================================

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "confirmed",
  "expired",
  "failed",
]);

export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).unique().notNull(),
  priceUsdt: decimal("price_usdt", { precision: 10, scale: 2 }).notNull(),
  maxLocations: integer("max_locations").notNull().default(1),
  maxCards: integer("max_cards").notNull().default(2),
  features: jsonb("features").default([]),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const payments = pgTable(
  "payments",
  {
    id: serial("id").primaryKey(),
    agencyId: integer("agency_id")
      .notNull()
      .references(() => agencies.id, { onDelete: "cascade" }),
    planId: integer("plan_id")
      .notNull()
      .references(() => subscriptionPlans.id),
    amountUsdt: decimal("amount_usdt", { precision: 10, scale: 2 }).notNull(),
    paymentAddress: varchar("payment_address", { length: 100 }).notNull(),
    addressIndex: integer("address_index").notNull(),
    status: paymentStatusEnum("status").default("pending"),
    txHash: varchar("tx_hash", { length: 255 }),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdBy: integer("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_payments_agency").on(table.agencyId),
    index("idx_payments_status").on(table.status),
  ]
);

// =============================================
// RELATIONS
// =============================================

export const agenciesRelations = relations(agencies, ({ many }) => ({
  businesses: many(businesses),
  users: many(users),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  agency: one(agencies, {
    fields: [payments.agencyId],
    references: [agencies.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [payments.planId],
    references: [subscriptionPlans.id],
  }),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  agency: one(agencies, {
    fields: [businesses.agencyId],
    references: [agencies.id],
  }),
  locations: many(locations),
  users: many(users),
  loyaltyCards: many(loyaltyCards),
  customers: many(customers),
  menusPdf: many(menusPdf),
  menuCategories: many(menuCategories),
  clubInvitation: one(clubInvitations),
}));

export const locationsRelations = relations(locations, ({ one }) => ({
  business: one(businesses, {
    fields: [locations.businessId],
    references: [businesses.id],
  }),
}));

export const usersRelations = relations(users, ({ one }) => ({
  agency: one(agencies, {
    fields: [users.agencyId],
    references: [agencies.id],
  }),
  business: one(businesses, {
    fields: [users.businessId],
    references: [businesses.id],
  }),
}));

export const loyaltyCardsRelations = relations(
  loyaltyCards,
  ({ one, many }) => ({
    business: one(businesses, {
      fields: [loyaltyCards.businessId],
      references: [businesses.id],
    }),
    passDesign: one(passDesigns),
    levels: many(cardLevels),
    rewards: many(rewards),
    enrollments: many(cardEnrollments),
    pushMessages: many(pushMessages),
    registrationLinks: many(registrationLinks),
  })
);

export const passDesignsRelations = relations(passDesigns, ({ one }) => ({
  card: one(loyaltyCards, {
    fields: [passDesigns.cardId],
    references: [loyaltyCards.id],
  }),
}));

export const cardLevelsRelations = relations(cardLevels, ({ one, many }) => ({
  card: one(loyaltyCards, {
    fields: [cardLevels.cardId],
    references: [loyaltyCards.id],
  }),
  rewards: many(rewards),
}));

export const rewardsRelations = relations(rewards, ({ one }) => ({
  card: one(loyaltyCards, {
    fields: [rewards.cardId],
    references: [loyaltyCards.id],
  }),
  level: one(cardLevels, {
    fields: [rewards.levelId],
    references: [cardLevels.id],
  }),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  business: one(businesses, {
    fields: [customers.businessId],
    references: [businesses.id],
  }),
  enrollments: many(cardEnrollments),
}));

export const cardEnrollmentsRelations = relations(
  cardEnrollments,
  ({ one, many }) => ({
    customer: one(customers, {
      fields: [cardEnrollments.customerId],
      references: [customers.id],
    }),
    card: one(loyaltyCards, {
      fields: [cardEnrollments.cardId],
      references: [loyaltyCards.id],
    }),
    currentLevel: one(cardLevels, {
      fields: [cardEnrollments.currentLevelId],
      references: [cardLevels.id],
    }),
    scans: many(scans),
    redemptions: many(redemptions),
  })
);

export const scansRelations = relations(scans, ({ one }) => ({
  enrollment: one(cardEnrollments, {
    fields: [scans.enrollmentId],
    references: [cardEnrollments.id],
  }),
  location: one(locations, {
    fields: [scans.locationId],
    references: [locations.id],
  }),
  scanner: one(users, {
    fields: [scans.scannedBy],
    references: [users.id],
  }),
}));

export const redemptionsRelations = relations(redemptions, ({ one }) => ({
  enrollment: one(cardEnrollments, {
    fields: [redemptions.enrollmentId],
    references: [cardEnrollments.id],
  }),
  reward: one(rewards, {
    fields: [redemptions.rewardId],
    references: [rewards.id],
  }),
  redeemer: one(users, {
    fields: [redemptions.redeemedBy],
    references: [users.id],
  }),
}));

export const pushMessagesRelations = relations(
  pushMessages,
  ({ one, many }) => ({
    card: one(loyaltyCards, {
      fields: [pushMessages.cardId],
      references: [loyaltyCards.id],
    }),
    creator: one(users, {
      fields: [pushMessages.createdBy],
      references: [users.id],
    }),
    deliveries: many(pushDeliveries),
  })
);

export const pushDeliveriesRelations = relations(
  pushDeliveries,
  ({ one }) => ({
    message: one(pushMessages, {
      fields: [pushDeliveries.messageId],
      references: [pushMessages.id],
    }),
    enrollment: one(cardEnrollments, {
      fields: [pushDeliveries.enrollmentId],
      references: [cardEnrollments.id],
    }),
  })
);

export const registrationLinksRelations = relations(
  registrationLinks,
  ({ one }) => ({
    card: one(loyaltyCards, {
      fields: [registrationLinks.cardId],
      references: [loyaltyCards.id],
    }),
  })
);
