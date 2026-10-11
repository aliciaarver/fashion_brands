import { checkVideoSchema } from '~~/shared/validation/admin'

// Instagram отдаёт разметку плеера только браузерам
const BROWSER_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Доступно только администратору' })
  }

  const { url } = await readValidatedBody(event, checkVideoSchema.parse)
  const [, kind, code] = url.match(/instagram\.com\/(reel|reels|p|tv)\/([\w-]+)/i) || []
  const embedKind = kind?.toLowerCase() === 'reels' ? 'reel' : kind?.toLowerCase()

  let html: string
  try {
    const response = await fetch(`https://www.instagram.com/${embedKind}/${code}/embed/captioned/`, {
      headers: { 'User-Agent': BROWSER_USER_AGENT },
      signal: AbortSignal.timeout(8000)
    })
    if (!response.ok) throw new Error(String(response.status))
    html = await response.text()
  } catch {
    throw createError({ statusCode: 502, message: 'Не удалось связаться с Instagram, попробуйте ещё раз' })
  }

  // Данные поста лежат в разметке как экранированный JSON: \"key\":\"value\"
  const username = html.match(/\\?"owner\\?":\{\\?"id\\?":\\?"\d+\\?",\\?"username\\?":\\?"([\w.]+)/)?.[1] || null
  const usesOriginalAudio = html.match(/\\?"uses_original_audio\\?":(true|false)/)?.[1]

  if (html.includes('video_url')) {
    return { status: 'playable' as const, reason: null, username }
  }
  if (html.includes('WatchOnInstagram')) {
    return { status: 'instagram-only' as const, reason: usesOriginalAudio === 'false' ? 'music' as const : 'restricted' as const, username }
  }
  return { status: 'unknown' as const, reason: null, username }
})
