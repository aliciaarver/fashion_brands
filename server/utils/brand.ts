import { and, asc, eq, ne, sql } from 'drizzle-orm'
import type { Brand } from '~~/shared/types/brand'
import type { CreateBrandInput } from '~~/shared/validation/brand'
import { useDatabase } from '../db/client'
import { brandImages, brandLinks, brands } from '../db/schema'

export async function hydrateBrand(db: ReturnType<typeof useDatabase>, row: typeof brands.$inferSelect): Promise<Brand> {
  const [links, images] = await Promise.all([
    db.select().from(brandLinks).where(eq(brandLinks.brandId, row.id)).orderBy(asc(brandLinks.sortOrder)),
    db.select().from(brandImages).where(eq(brandImages.brandId, row.id)).orderBy(asc(brandImages.sortOrder))
  ])

  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    links: links.map(({ id, type, url, sortOrder }) => ({ id, type, url, sortOrder })),
    images: images.map(({ id, url, alt, sortOrder }) => ({ id, url, alt, sortOrder }))
  }
}

// Параметр может прийти один раз (строка) или несколько (?country=RU&country=GE — массив)
function toList(value: unknown): string[] {
  return (Array.isArray(value) ? value : [value]).map(item => String(item ?? '').trim()).filter(Boolean)
}

export function filterBrands(brandsList: Brand[], query: Record<string, unknown>): Brand[] {
  const q = String(query.q || '').trim().toLowerCase()
  const names = toList(query.brand).map(name => name.toLowerCase())
  const countries = toList(query.country)
  const category = String(query.category || '')

  return brandsList.filter((brand) => {
    if (q && !brand.name.toLowerCase().includes(q)) return false
    if (names.length && !names.includes(brand.name.toLowerCase())) return false
    if (countries.length && !brand.countries.some(country => countries.includes(country))) return false
    if (category && !brand.categories.includes(category)) return false
    return true
  })
}

export function slugifyBrandName(name: string) {
  const normalized = name
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-|-$/g, '')

  return normalized || `brand-${Date.now()}`
}

type Database = ReturnType<typeof useDatabase>
type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0]

// Названия брендов уникальны без учёта регистра и пробелов по краям
export async function assertBrandNameFree(db: Database, name: string, exceptId?: string) {
  const sameName = sql`lower(btrim(${brands.name})) = lower(${name})`
  const [existing] = await db.select({ id: brands.id }).from(brands)
    .where(exceptId ? and(sameName, ne(brands.id, exceptId)) : sameName)
    .limit(1)
  if (existing) {
    throw createError({ statusCode: 409, message: `Бренд «${name}» уже есть в каталоге` })
  }
}

export async function insertBrandRelations(tx: Transaction, brandId: string, input: Pick<CreateBrandInput, 'links' | 'images'>) {
  await tx.insert(brandLinks).values(input.links.map((link, index) => ({
    brandId,
    type: link.type,
    url: link.url,
    sortOrder: index
  })))

  await tx.insert(brandImages).values(input.images.map((image, index) => ({
    brandId,
    url: image.url,
    alt: image.alt,
    sortOrder: index
  })))
}
