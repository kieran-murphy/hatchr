import { pgTable, text, integer, timestamp, pgEnum, uuid } from 'drizzle-orm/pg-core';

export const rarityEnum = pgEnum('rarity', ['COMMON', 'RARE', 'EPIC', 'LEGENDARY']);

export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').unique(),
  gems: integer('gems').default(100).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const creatures = pgTable('creatures', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  speciesName: text('species_name').notNull(),
  rarity: rarityEnum('rarity').default('COMMON').notNull(),
  imageUrl: text('image_url').notNull(),
  hatchedAt: timestamp('hatched_at').defaultNow().notNull(),
});