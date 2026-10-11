import { eq } from 'drizzle-orm'
import { useDatabase } from '../../db/client'
import { brands } from '../../db/schema'
import { hydrateBrand } from '../../utils/brand'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  const db = useDatabase()
  const [row] = await db.select().from(brands).where(eq(brands.slug, slug || '')).limit(1)

  if (!row || row.status !== 'published') {
    throw createError({ statusCode: 404, statusMessage: 'Бренд не найден' })
  }

  return hydrateBrand(db, row)
})
