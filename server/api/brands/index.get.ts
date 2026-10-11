import { asc, eq } from 'drizzle-orm'
import { useDatabase } from '../../db/client'
import { brands } from '../../db/schema'
import { filterBrands, hydrateBrand } from '../../utils/brand'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const db = useDatabase()
  const rows = await db.select().from(brands).where(eq(brands.status, 'published')).orderBy(asc(brands.name))
  const hydrated = await Promise.all(rows.map(row => hydrateBrand(db, row)))

  return filterBrands(hydrated, query)
})
