import { relations } from "drizzle-orm/relations";
import { adminUsers, sessions, users, abandonedCarts, supportGuides, products, reviews, newsletterCampaigns, activityLogs, userSessions, expenses, tickets, aiChatSessions } from "./schema";

export const sessionsRelations = relations(sessions, ({one}) => ({
	adminUser: one(adminUsers, {
		fields: [sessions.adminId],
		references: [adminUsers.id]
	}),
}));

export const adminUsersRelations = relations(adminUsers, ({many}) => ({
	sessions: many(sessions),
	supportGuides: many(supportGuides),
	newsletterCampaigns: many(newsletterCampaigns),
	activityLogs: many(activityLogs),
	expenses: many(expenses),
}));

export const abandonedCartsRelations = relations(abandonedCarts, ({one}) => ({
	user: one(users, {
		fields: [abandonedCarts.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	abandonedCarts: many(abandonedCarts),
	userSessions: many(userSessions),
	tickets: many(tickets),
	aiChatSessions: many(aiChatSessions),
}));

export const supportGuidesRelations = relations(supportGuides, ({one}) => ({
	adminUser: one(adminUsers, {
		fields: [supportGuides.authorId],
		references: [adminUsers.id]
	}),
}));

export const reviewsRelations = relations(reviews, ({one}) => ({
	product: one(products, {
		fields: [reviews.productId],
		references: [products.id]
	}),
}));

export const productsRelations = relations(products, ({many}) => ({
	reviews: many(reviews),
	tickets: many(tickets),
}));

export const newsletterCampaignsRelations = relations(newsletterCampaigns, ({one}) => ({
	adminUser: one(adminUsers, {
		fields: [newsletterCampaigns.createdBy],
		references: [adminUsers.id]
	}),
}));

export const activityLogsRelations = relations(activityLogs, ({one}) => ({
	adminUser: one(adminUsers, {
		fields: [activityLogs.adminId],
		references: [adminUsers.id]
	}),
}));

export const userSessionsRelations = relations(userSessions, ({one}) => ({
	user: one(users, {
		fields: [userSessions.userId],
		references: [users.id]
	}),
}));

export const expensesRelations = relations(expenses, ({one}) => ({
	adminUser: one(adminUsers, {
		fields: [expenses.adminId],
		references: [adminUsers.id]
	}),
}));

export const ticketsRelations = relations(tickets, ({one}) => ({
	product: one(products, {
		fields: [tickets.productId],
		references: [products.id]
	}),
	user: one(users, {
		fields: [tickets.userId],
		references: [users.id]
	}),
}));

export const aiChatSessionsRelations = relations(aiChatSessions, ({one}) => ({
	user: one(users, {
		fields: [aiChatSessions.userId],
		references: [users.id]
	}),
}));