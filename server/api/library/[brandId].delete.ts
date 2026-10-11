import { and, eq } from 'drizzle-orm'
import { useDatabase } from '../../db/client'
import { savedBrands } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const brandId = getRouterParam(event, 'brandId') || ''
  const db = useDatabase()

  await db.delete(savedBrands).where(and(eq(savedBrands.userId, user.id), eq(savedBrands.brandId, brandId)))
  return { saved: false }
})
