import { eq } from 'drizzle-orm'
import { useDatabase } from '../../../db/client'
import { brandImages, brandLinks, brands } from '../../../db/schema'
import { assertBrandNameFree, insertBrandRelations } from '../../../utils/brand'
import { createBrandSchema } from '~~/shared/validation/brand'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Доступно только администратору' })
  }

  const id = getRouterParam(event, 'id') || ''
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    throw createError({ statusCode: 404, statusMessage: 'Бренд не найден' })
  }
  const input = createBrandSchema.parse(await readBody(event))
  const db = useDatabase()
  await assertBrandNameFree(db, input.name, id)

  return db.transaction(async (tx) => {
    // slug не меняем при переименовании, чтобы старые ссылки на карточку продолжали работать
    const [brand] = await tx.update(brands).set({
      name: input.name,
      countries: input.countries,
      categories: input.categories,
      status: input.publish ? 'published' : 'draft',
      updatedAt: new Date()
    }).where(eq(brands.id, id)).returning()

    if (!brand) {
      throw createError({ statusCode: 404, statusMessage: 'Бренд не найден' })
    }

    await tx.delete(brandLinks).where(eq(brandLinks.brandId, id))
    await tx.delete(brandImages).where(eq(brandImages.brandId, id))
    await insertBrandRelations(tx, id, input)

    return { id: brand.id, slug: brand.slug, status: brand.status }
  })
})
