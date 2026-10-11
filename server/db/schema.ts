import { integer, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'

export const brandStatus = pgEnum('brand_status', ['draft', 'published', 'archived'])
export const linkType = pgEnum('brand_link_type', ['website', 'instagram', 'other'])
export const userRole = pgEnum('user_role', ['user', 'admin'])

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  displayName: text('display_name').notNull(),
  role: userRole('role').notNull().default('user'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export const brands = pgTable('brands', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  countries: text('countries').array().notNull(),
  categories: text('categories').array().notNull(),
  status: brandStatus('status').notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
})

export const brandLinks = pgTable('brand_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }),
  type: linkType('type').notNull(),
  url: text('url').notNull(),
  sortOrder: integer('sort_order').notNull().default(0)
})

export const brandImages = pgTable('brand_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  brandId: uuid('brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  alt: text('alt').notNull(),
  sortOrder: integer('sort_order').notNull().default(0)
})

export const savedBrands = pgTable('saved_brands', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  brandId: uuid('brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, table => ({
  userBrandUnique: uniqueIndex('saved_brands_user_brand_idx').on(table.userId, table.brandId)
}))

export const collections = pgTable('collections', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: uuid('owner_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  visibility: text('visibility').notNull().default('private'),
  publicSlug: text('public_slug').unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
})

export const collectionBrands = pgTable('collection_brands', {
  id: uuid('id').primaryKey().defaultRandom(),
  collectionId: uuid('collection_id').notNull().references(() => collections.id, { onDelete: 'cascade' }),
  brandId: uuid('brand_id').notNull().references(() => brands.id, { onDelete: 'cascade' }),
  position: integer('position').notNull().default(0)
}, table => ({
  collectionBrandUnique: uniqueIndex('collection_brands_collection_brand_idx').on(table.collectionId, table.brandId)
}))
