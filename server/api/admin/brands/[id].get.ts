import { eq } from 'drizzle-orm'
import { useDatabase } from '../../../db/client'
import { brands } from '../../../db/schema'
import { hydrateBrand } from '../../../utils/brand'

// В отличие от публичного /api/brands/[slug], отдаёт бренд в любом статусе
export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Доступно только администратору' })
  }

  const id = getRouterParam(event, 'id') || ''
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    throw createError({ statusCode: 404, statusMessage: 'Бренд не найден' })
  }
  const db = useDatabase()
  const [row] = await db.select().from(brands).where(eq(brands.id, id)).limit(1)
  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Бренд не найден' })
  }

  return hydrateBrand(db, row)
})
