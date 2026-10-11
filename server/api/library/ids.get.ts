import { eq } from 'drizzle-orm'
import { useDatabase } from '../../db/client'
import { savedBrands } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const { user } = await getUserSession(event)
  if (!user) return []

  const db = useDatabase()
  const rows = await db.select({ brandId: savedBrands.brandId }).from(savedBrands).where(eq(savedBrands.userId, user.id))
  return rows.map(row => row.brandId)
})
