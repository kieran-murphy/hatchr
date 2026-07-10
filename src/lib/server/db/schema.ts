import { pgTable, text, integer, timestamp, pgEnum, uuid, boolean, index, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const rarityEnum = pgEnum('rarity', ['COMMON', 'UNCOMMON', 'RARE', 'LEGENDARY']);

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').default(false).notNull(),
	image: text('image'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
	lastChestClaimedAt: timestamp('last_chest_claimed_at', { mode: 'date' }),
	lastDailyRewardClaimedAt: timestamp('last_daily_reward_claimed_at', { mode: 'date' }),
	lastNewHatchClaimedAt: timestamp('last_new_hatch_claimed_at', { mode: 'date' }),
	gems: integer('gems').default(500).notNull()
});

export const follows = pgTable(
	'follows',
	{
		followerId: text('follower_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		followingId: text('following_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		createdAt: timestamp('created_at').defaultNow().notNull()
	},
	(table) => ({
		pk: primaryKey({ columns: [table.followerId, table.followingId] })
	})
);

export const creatures = pgTable('creatures', {
	id: uuid('id').defaultRandom().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	speciesName: text('species_name').notNull(),
	description: text('description').notNull(),
	rarity: rarityEnum('rarity').default('COMMON').notNull(),
	imageUrl: text('image_url').notNull(),
	type1: text('type1').notNull(),
	type2: text('type2'),
	hatchedAt: timestamp('hatched_at').defaultNow().notNull(),
	isFavorite: boolean('is_favorite').default(false)
});

export const session = pgTable(
	'session',
	{
		id: text('id').primaryKey(),
		expiresAt: timestamp('expires_at').notNull(),
		token: text('token').notNull().unique(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' })
	},
	(table) => [index('session_userId_idx').on(table.userId)]
);

export const account = pgTable(
	'account',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: timestamp('access_token_expires_at'),
		refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
		scope: text('scope'),
		password: text('password'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [index('account_userId_idx').on(table.userId)]
);

export const verification = pgTable(
	'verification',
	{
		id: text('id').primaryKey(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull()
	},
	(table) => [index('verification_identifier_idx').on(table.identifier)]
);

export const creatureQueue = pgTable('creature_queue', {
	id: text('id').primaryKey(),
	speciesName: text('species_name').notNull(),
	description: text('description').notNull(),
	imageUrl: text('image_url').notNull(),
	rarity: text('rarity').notNull(),
	queuedAt: timestamp('queued_at').defaultNow().notNull(),
	type1: text('type1').notNull(),
	type2: text('type2')
});

export const dualCreatureQueue = pgTable('dual_creature_queue', {
	id: text('id').primaryKey(),
	speciesName: text('species_name').notNull(),
	description: text('description').notNull(),
	imageUrl: text('image_url').notNull(),
	rarity: text('rarity').notNull(),
	type1: text('type1').notNull(),
	type2: text('type2').notNull(),
	queuedAt: timestamp('queued_at').defaultNow().notNull()
});

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	creatures: many(creatures),
	following: many(follows, { relationName: 'following' }),
	followers: many(follows, { relationName: 'followers' })
}));

export const followsRelations = relations(follows, ({ one }) => ({
	follower: one(user, {
		fields: [follows.followerId],
		references: [user.id],
		relationName: 'following'
	}),
	following: one(user, {
		fields: [follows.followingId],
		references: [user.id],
		relationName: 'followers'
	})
}));

export const creatureRelations = relations(creatures, ({ one }) => ({
	owner: one(user, {
		fields: [creatures.userId],
		references: [user.id]
	})
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] })
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] })
}));