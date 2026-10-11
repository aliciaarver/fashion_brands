import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { useDatabase } from '../../db/client'
import { brands, savedBrands } from '../../db/schema'

const bodySchema = z.object({ brandId: z.string().uuid() })

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const { brandId } = await readValidatedBody(event, bodySchema.parse)
  const db = useDatabase()

  const [brand] = await db.select({ id: brands.id }).from(brands).where(eq(brands.id, brandId)).limit(1)
  if (!brand) {
    throw createError({ statusCode: 404, statusMessage: 'Бренд не найден' })
  }

  const [existing] = await db
    .select({ id: savedBrands.id })
    .from(savedBrands)
    .where(and(eq(savedBrands.userId, user.id), eq(savedBrands.brandId, brandId)))
    .limit(1)

  if (existing) {
    return { saved: true }
  }

  await db.insert(savedBrands).values({ userId: user.id, brandId })
  setResponseStatus(event, 201)
  return { saved: true }
})
