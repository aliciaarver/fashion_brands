import { eq } from 'drizzle-orm'
import { loginSchema } from '~~/shared/validation/auth'
import { useDatabase } from '../../db/client'
import { users } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, loginSchema.parse)
  const db = useDatabase()

  const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1)
  if (!user || !(await verifyPassword(user.passwordHash, body.password))) {
    throw createError({ statusCode: 401, statusMessage: 'Неверный email или пароль' })
  }

  await setUserSession(event, {
    user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role }
  })

  return { id: user.id, email: user.email, displayName: user.displayName }
})
