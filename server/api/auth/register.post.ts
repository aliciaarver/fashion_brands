import { eq } from 'drizzle-orm'
import { registerSchema } from '~~/shared/validation/auth'
import { useDatabase } from '../../db/client'
import { users } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, registerSchema.parse)
  const db = useDatabase()

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, body.email)).limit(1)
  if (existing.length) {
    throw createError({ statusCode: 409, statusMessage: 'Этот email уже зарегистрирован' })
  }

  const passwordHash = await hashPassword(body.password)
  const [user] = await db
    .insert(users)
    .values({ email: body.email, passwordHash, displayName: body.displayName })
    .returning()

  if (!user) {
    throw createError({ statusCode: 500, statusMessage: 'Не удалось создать пользователя' })
  }

  await setUserSession(event, {
    user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role }
  })

  return { id: user.id, email: user.email, displayName: user.displayName }
})
