import { useDatabase } from '../../db/client'
import { brands } from '../../db/schema'
import { assertBrandNameFree, insertBrandRelations, slugifyBrandName } from '../../utils/brand'
import { createBrandSchema } from '~~/shared/validation/brand'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Доступно только администратору' })
  }

  const input = createBrandSchema.parse(await readBody(event))
  const db = useDatabase()

  await assertBrandNameFree(db, input.name)
  const slug = `${slugifyBrandName(input.name)}-${Date.now().toString(36)}`

  return db.transaction(async (tx) => {
    const [brand] = await tx.insert(brands).values({
      name: input.name,
      slug,
      countries: input.countries,
      categories: input.categories,
      status: input.publish ? 'published' : 'draft'
    }).returning()

    if (!brand) {
      throw createError({ statusCode: 500, statusMessage: 'Не удалось создать бренд' })
    }

    await insertBrandRelations(tx, brand.id, input)

    setResponseStatus(event, 201)
    return { id: brand.id, slug: brand.slug, status: brand.status }
  })
})
