import { pgTable, index, foreignKey, unique, pgPolicy, text, timestamp, uniqueIndex, uuid, varchar, jsonb, boolean, integer, serial, check, numeric } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const sessions = pgTable("sessions", {
	id: text().primaryKey().notNull(),
	adminId: text().notNull(),
	token: text().notNull(),
	expiresAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_sessions_adminid").using("btree", table.adminId.asc().nullsLast().op("text_ops")),
	index("idx_sessions_expires").using("btree", table.expiresAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_sessions_token").using("btree", table.token.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.adminId],
			foreignColumns: [adminUsers.id],
			name: "sessions_adminId_fkey"
		}).onDelete("cascade"),
	unique("sessions_token_key").on(table.token),
	pgPolicy("service_role_only", { as: "permissive", for: "all", to: ["service_role"], using: sql`true`, withCheck: sql`true`  }),
]);

export const abandonedCarts = pgTable("abandoned_carts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text(),
	guestId: varchar({ length: 255 }),
	items: jsonb().default([]).notNull(),
	lastActive: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
	emailSent: boolean().default(false),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	uniqueIndex("idx_abandoned_carts_guest_id").using("btree", table.guestId.asc().nullsLast().op("text_ops")),
	uniqueIndex("idx_abandoned_carts_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "abandoned_carts_userId_fkey"
		}).onDelete("cascade"),
]);

export const supportGuides = pgTable("support_guides", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	slug: text().notNull(),
	content: text().notNull(),
	summary: text(),
	category: text().notNull(),
	authorId: text(),
	coverImage: text(),
	published: boolean().default(false),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_support_guides_authorid").using("btree", table.authorId.asc().nullsLast().op("text_ops")),
	index("idx_support_guides_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("idx_support_guides_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_support_guides_published").using("btree", table.published.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.authorId],
			foreignColumns: [adminUsers.id],
			name: "support_guides_authorId_fkey"
		}).onDelete("set null"),
	unique("support_guides_slug_key").on(table.slug),
	pgPolicy("public_support_guides_readable", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
]);

export const teamMembers = pgTable("team_members", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	role: text().notNull(),
	bio: text(),
	image: text(),
	social: jsonb(),
	order: integer().default(0),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	pgPolicy("service_role_only", { as: "permissive", for: "all", to: ["service_role"], using: sql`true`, withCheck: sql`true`  }),
]);

export const reviews = pgTable("reviews", {
	id: text().primaryKey().notNull(),
	productId: text().notNull(),
	userName: text().notNull(),
	rating: integer().notNull(),
	comment: text(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_reviews_created").using("btree", table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	index("idx_reviews_product").using("btree", table.productId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "reviews_productId_fkey"
		}).onDelete("cascade"),
	pgPolicy("public_reviews_readable", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
]);

export const projects = pgTable("projects", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	category: text().notNull(),
	client: text(),
	description: text(),
	useCase: text(),
	technologies: jsonb(),
	image: text(),
	link: text(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	pgPolicy("public_projects_readable", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
]);

export const consultations = pgTable("consultations", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	phone: text(),
	service: text().notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	time: text().notNull(),
	message: text(),
	status: text().default('pending'),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_consultations_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	pgPolicy("public_consultations_insert", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`(email IS NOT NULL)`  }),
	pgPolicy("public_consultations_select", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("public_consultations_update", { as: "permissive", for: "update", to: ["public"] }),
]);

export const newsletterCampaigns = pgTable("newsletter_campaigns", {
	id: text().primaryKey().notNull(),
	subject: text().notNull(),
	content: text().notNull(),
	status: text().default('draft'),
	audienceStatus: text().default('active'),
	audienceSource: text(),
	audienceSubscribedAfter: timestamp({ mode: 'string' }),
	audienceSubscribedBefore: timestamp({ mode: 'string' }),
	recipientLimit: integer(),
	batchSize: integer().default(100),
	sendDelayMs: integer().default(0),
	isTest: boolean().default(false),
	testEmail: text(),
	totalTargets: integer().default(0),
	sentCount: integer().default(0),
	failedCount: integer().default(0),
	scheduledAt: timestamp({ mode: 'string' }),
	sentAt: timestamp({ mode: 'string' }),
	createdBy: text(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	channel: text().default('email'),
	testPhone: text(),
	whatsappTemplateName: text(),
	whatsappTemplateLanguage: text(),
	whatsappTemplateParams: jsonb(),
}, (table) => [
	index("idx_newsletter_campaigns_channel").using("btree", table.channel.asc().nullsLast().op("text_ops")),
	index("idx_newsletter_campaigns_created").using("btree", table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	index("idx_newsletter_campaigns_createdby").using("btree", table.createdBy.asc().nullsLast().op("text_ops")),
	index("idx_newsletter_campaigns_scheduled").using("btree", table.scheduledAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_newsletter_campaigns_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [adminUsers.id],
			name: "newsletter_campaigns_createdBy_fkey"
		}).onDelete("set null"),
	pgPolicy("public_newsletter_campaigns_readable", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
]);

export const activityLogs = pgTable("activity_logs", {
	id: text().primaryKey().notNull(),
	adminId: text(),
	action: text().notNull(),
	details: text(),
	type: text().default('info'),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_activity_logs_admin").using("btree", table.adminId.asc().nullsLast().op("text_ops")),
	index("idx_activity_logs_created").using("btree", table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	foreignKey({
			columns: [table.adminId],
			foreignColumns: [adminUsers.id],
			name: "activity_logs_adminId_fkey"
		}).onDelete("set null"),
	pgPolicy("public_activity_logs_service", { as: "permissive", for: "all", to: ["public"], using: sql`(( SELECT auth.role() AS role) = 'service_role'::text)` }),
]);

export const adminUsers = pgTable("admin_users", {
	id: text().primaryKey().notNull(),
	username: text().notNull(),
	email: text().notNull(),
	passwordHash: text().notNull(),
	role: text().default('admin'),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	avatar: text(),
	phone: text(),
	passwordResetRequired: boolean().default(true),
	passwordUpdatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	isActive: boolean().default(true),
	mfaEnabled: boolean().default(false),
	mfaSecret: text(),
}, (table) => [
	index("idx_admin_users_id").using("btree", table.id.asc().nullsLast().op("text_ops")),
	unique("admin_users_username_key").on(table.username),
	unique("admin_users_email_key").on(table.email),
	pgPolicy("service_role_only", { as: "permissive", for: "all", to: ["service_role"], using: sql`true`, withCheck: sql`true`  }),
]);

export const customerFeedback = pgTable("customer_feedback", {
	id: serial().primaryKey().notNull(),
	name: text(),
	email: text(),
	rating: integer(),
	message: text().notNull(),
	page: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	pgPolicy("service_role_only", { as: "permissive", for: "all", to: ["service_role"], using: sql`true`, withCheck: sql`true`  }),
]);

export const testimonials = pgTable("testimonials", {
	id: text().primaryKey().notNull(),
	quote: text().notNull(),
	author: text().notNull(),
	role: text(),
	company: text(),
	image: text(),
	order: integer().default(0),
	active: boolean().default(true),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	externalSource: text(),
	externalId: text(),
	rating: integer(),
	reviewUrl: text(),
	publishedAt: timestamp({ mode: 'string' }),
}, (table) => [
	uniqueIndex("idx_testimonials_external_unique").using("btree", table.externalSource.asc().nullsLast().op("text_ops"), table.externalId.asc().nullsLast().op("text_ops")).where(sql`(("externalSource" IS NOT NULL) AND ("externalId" IS NOT NULL))`),
	index("idx_testimonials_order_created").using("btree", table.order.asc().nullsLast().op("int4_ops"), table.createdAt.desc().nullsFirst().op("int4_ops")),
	pgPolicy("public_testimonials_readable", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
]);

export const catalogGaps = pgTable("catalog_gaps", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	keyword: text().notNull(),
	queryCount: integer().default(1),
	lastRequested: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	isResolved: boolean().default(false),
}, (table) => [
	index("idx_catalog_gaps_count").using("btree", table.queryCount.desc().nullsFirst().op("int4_ops")),
	pgPolicy("public_catalog_gaps_readable", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
]);

export const orders = pgTable("orders", {
	id: text().primaryKey().notNull(),
	guestId: text().notNull(),
	userId: text(),
	items: jsonb().notNull(),
	total: numeric({ precision: 10, scale:  2 }).notNull(),
	shippingInfo: jsonb().notNull(),
	paymentMethod: text(),
	status: text().default('pending'),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	referralCode: text(),
	orderAccessTokenHash: text(),
	cogs: numeric({ precision: 10, scale:  2 }).default('0.00'),
	paymentStatus: text().default('pending').notNull(),
	paymentMessage: text(),
	clientReference: text(),
}, (table) => [
	index("idx_orders_access_token_hash").using("btree", table.orderAccessTokenHash.asc().nullsLast().op("text_ops")),
	index("idx_orders_client_reference").using("btree", table.clientReference.asc().nullsLast().op("text_ops")),
	index("idx_orders_composite").using("btree", table.status.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
	index("idx_orders_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_orders_guest_id").using("btree", table.guestId.asc().nullsLast().op("text_ops")),
	index("idx_orders_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_orders_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	pgPolicy("service_role_only", { as: "permissive", for: "all", to: ["service_role"], using: sql`true`, withCheck: sql`true`  }),
	check("orders_paymentStatus_check", sql`"paymentStatus" = ANY (ARRAY['confirmed'::text, 'failed'::text, 'pending'::text])`),
]);

export const products = pgTable("products", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	category: text().notNull(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	originalPrice: numeric({ precision: 10, scale:  2 }),
	image: text(),
	images: jsonb(),
	rating: numeric({ precision: 3, scale:  2 }).default('0'),
	reviews: integer().default(0),
	badge: text(),
	inStock: boolean().default(true),
	stockQuantity: integer().default(100),
	description: text(),
	features: jsonb(),
	specifications: jsonb(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	sku: text(),
	condition: text().default('New'),
	slug: text(),
	isSpotlight: boolean().default(false),
	isFeatured: boolean().default(false),
	costPrice: numeric({ precision: 10, scale:  2 }).default('0.00'),
	metaTitle: varchar({ length: 60 }),
	metaDescription: varchar({ length: 160 }),
}, (table) => [
	index("idx_products_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("idx_products_created_at").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("idx_products_in_stock").using("btree", table.inStock.asc().nullsLast().op("bool_ops")),
	index("idx_products_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	uniqueIndex("idx_products_sku").using("btree", table.sku.asc().nullsLast().op("text_ops")).where(sql`(sku IS NOT NULL)`),
	uniqueIndex("idx_products_slug").using("btree", table.slug.asc().nullsLast().op("text_ops")).where(sql`(slug IS NOT NULL)`),
	index("idx_products_stock").using("btree", table.stockQuantity.asc().nullsLast().op("int4_ops")),
	unique("products_sku_key").on(table.sku),
	unique("products_slug_key").on(table.slug),
	pgPolicy("public_products_readable", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
	pgPolicy("admin_products_insert", { as: "permissive", for: "insert", to: ["authenticated", "service_role"] }),
	pgPolicy("admin_products_update", { as: "permissive", for: "update", to: ["authenticated", "service_role"] }),
	pgPolicy("admin_products_delete", { as: "permissive", for: "delete", to: ["authenticated", "service_role"] }),
]);

export const categories = pgTable("categories", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	icon: text(),
}, (table) => [
	index("idx_categories_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	pgPolicy("public_categories_readable", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
]);

export const aiChatLogs = pgTable("ai_chat_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	guestId: text(),
	userId: text(),
	query: text().notNull(),
	response: text().notNull(),
	intent: text(),
	recommendedProducts: jsonb(),
	hasImage: boolean().default(false),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	source: text().default('general'),
}, (table) => [
	index("idx_chat_logs_created_at").using("btree", table.createdAt.desc().nullsFirst().op("timestamp_ops")),
	pgPolicy("public_ai_chat_logs_insert", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`((( SELECT auth.role() AS role) = 'authenticated'::text) OR (( SELECT auth.role() AS role) = 'service_role'::text) OR (( SELECT auth.role() AS role) = 'anon'::text))`  }),
	pgPolicy("public_ai_chat_logs_select", { as: "permissive", for: "select", to: ["public"] }),
]);

export const siteStats = pgTable("site_stats", {
	id: text().primaryKey().notNull(),
	label: text().notNull(),
	value: text().notNull(),
	suffix: text(),
	prefix: text(),
	icon: text(),
	color: text(),
	order: integer().default(0),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	pgPolicy("public_site_stats_readable", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
]);

export const userSessions = pgTable("user_sessions", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	token: text().notNull(),
	expiresAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_user_sessions_token").using("btree", table.token.asc().nullsLast().op("text_ops")),
	index("idx_user_sessions_userid").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_sessions_userId_fkey"
		}).onDelete("cascade"),
	unique("user_sessions_token_key").on(table.token),
	pgPolicy("service_role_only", { as: "permissive", for: "all", to: ["service_role"], using: sql`true`, withCheck: sql`true`  }),
]);

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	passwordHash: text().notNull(),
	name: text().notNull(),
	phone: text(),
	emailVerified: boolean().default(false),
	verificationToken: text(),
	verificationExpiry: text(),
	shippingAddress: jsonb(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	avatar: text(),
	isActive: boolean().default(true),
	role: text().default('customer'),
	passwordResetRequired: boolean().default(false),
	passwordUpdatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	resetToken: text(),
	resetTokenExpiry: timestamp({ mode: 'string' }),
}, (table) => [
	unique("users_email_key").on(table.email),
	pgPolicy("service_role_only", { as: "permissive", for: "all", to: ["service_role"], using: sql`true`, withCheck: sql`true`  }),
]);

export const inquiries = pgTable("inquiries", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	subject: text(),
	message: text().notNull(),
	status: text().default('pending'),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_inquiries_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	pgPolicy("public_inquiries_insert", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`(email IS NOT NULL)`  }),
	pgPolicy("public_inquiries_select", { as: "permissive", for: "select", to: ["public"] }),
]);

export const expenses = pgTable("expenses", {
	id: text().primaryKey().notNull(),
	title: text().notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	category: text().notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	description: text(),
	adminId: text(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_expenses_adminid").using("btree", table.adminId.asc().nullsLast().op("text_ops")),
	index("idx_expenses_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("idx_expenses_date").using("btree", table.date.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
			columns: [table.adminId],
			foreignColumns: [adminUsers.id],
			name: "expenses_adminId_fkey"
		}).onDelete("set null"),
	pgPolicy("public_expenses_readable", { as: "permissive", for: "select", to: ["public"], using: sql`(( SELECT auth.role() AS role) = 'service_role'::text)` }),
]);

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	name: text(),
	source: text().default('footer'),
	status: text().default('active'),
	unsubscribeToken: text().notNull(),
	subscribedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	unsubscribedAt: timestamp({ mode: 'string' }),
	lastCampaignAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	phone: text(),
}, (table) => [
	index("idx_newsletter_subscribers_email").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("idx_newsletter_subscribers_phone").using("btree", table.phone.asc().nullsLast().op("text_ops")),
	index("idx_newsletter_subscribers_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_newsletter_subscribers_token").using("btree", table.unsubscribeToken.asc().nullsLast().op("text_ops")),
	unique("newsletter_subscribers_email_key").on(table.email),
	unique("newsletter_subscribers_unsubscribeToken_key").on(table.unsubscribeToken),
	pgPolicy("public_newsletter_subscribers_insert", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`(email IS NOT NULL)`  }),
	pgPolicy("public_newsletter_subscribers_select", { as: "permissive", for: "select", to: ["public"] }),
	pgPolicy("public_newsletter_subscribers_update", { as: "permissive", for: "update", to: ["public"] }),
]);

export const tickets = pgTable("tickets", {
	id: text().primaryKey().notNull(),
	userId: text(),
	name: text().notNull(),
	email: text().notNull(),
	subject: text().notNull(),
	message: text().notNull(),
	category: text().notNull(),
	priority: text().default('medium'),
	status: text().default('open'),
	productId: text(),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	phone: text(),
	ticketNo: serial("ticket_no").notNull(),
}, (table) => [
	index("idx_tickets_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("idx_tickets_productid").using("btree", table.productId.asc().nullsLast().op("text_ops")),
	index("idx_tickets_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	index("idx_tickets_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "tickets_productId_fkey"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "tickets_userId_fkey"
		}).onDelete("set null"),
	pgPolicy("service_role_only", { as: "permissive", for: "all", to: ["service_role"], using: sql`true`, withCheck: sql`true`  }),
]);

export const aiChatSessions = pgTable("ai_chat_sessions", {
	sessionId: text("session_id").primaryKey().notNull(),
	userId: text("user_id"),
	summary: text(),
	lastUpdated: timestamp("last_updated", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_ai_chat_sessions_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "ai_chat_sessions_user_id_fkey"
		}).onDelete("set null"),
]);

export const careers = pgTable("careers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	department: text().notNull(),
	location: text().notNull(),
	type: text().notNull(),
	description: text(),
	requirements: jsonb(),
	isActive: boolean().default(true),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
	updatedAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	pgPolicy("public_careers_readable", { as: "permissive", for: "select", to: ["public"], using: sql`true` }),
	pgPolicy("service_role_careers_all", { as: "permissive", for: "all", to: ["service_role"], using: sql`true`, withCheck: sql`true`  }),
]);

export const jobApplications = pgTable("job_applications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	jobId: uuid().notNull(),
	applicantName: text().notNull(),
	applicantEmail: text().notNull(),
	applicantPhone: text(),
	resumeUrl: text(),
	portfolioUrl: text(),
	coverLetter: text(),
	status: text().default('pending'),
	createdAt: timestamp({ mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_job_applications_job_id").using("btree", table.jobId),
	index("idx_job_applications_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.jobId],
			foreignColumns: [careers.id],
			name: "job_applications_jobId_fkey"
		}).onDelete("cascade"),
	pgPolicy("public_job_applications_insert", { as: "permissive", for: "insert", to: ["public"], withCheck: sql`("applicantEmail" IS NOT NULL)`  }),
	pgPolicy("service_role_job_applications_all", { as: "permissive", for: "all", to: ["service_role"], using: sql`true`, withCheck: sql`true`  }),
]);
