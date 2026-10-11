import { eq, inArray } from 'drizzle-orm'
import { useDatabase } from '../../db/client'
import { brands, savedBrands } from '../../db/schema'
import { filterBrands, hydrateBrand } from '../../utils/brand'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const query = getQuery(event)
  const db = useDatabase()

  const saved = await db.select({ brandId: savedBrands.brandId }).from(savedBrands).where(eq(savedBrands.userId, user.id))
  const brandIds = saved.map(row => row.brandId)
  if (!brandIds.length) return []

  const rows = await db.select().from(brands).where(inArray(brands.id, brandIds))
  const hydrated = await Promise.all(rows.map(row => hydrateBrand(db, row)))

  return filterBrands(hydrated, query)
})
