import * as cheerio from 'cheerio'
import { fetchImagesSchema } from '~~/shared/validation/admin'

const BLOCKED_HOSTNAMES = ['localhost', '127.0.0.1', '0.0.0.0', '::1']

function isBlockedHost(hostname: string) {
  const lower = hostname.toLowerCase()
  if (BLOCKED_HOSTNAMES.includes(lower)) return true
  if (/^10\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\.|^169\.254\./.test(lower)) return true
  return false
}

function isSkippableImage(url: string) {
  // /-/empty/ и noroot.png — служебные заглушки Tilda
  return /logo|icon|sprite|favicon|spinner|placeholder|avatar|noroot|\/-\/empty\/|\.svg($|\?)/i.test(url)
}

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Доступно только администратору' })
  }

  const { url } = await readValidatedBody(event, fetchImagesSchema.parse)
  const target = new URL(url)

  if (isBlockedHost(target.hostname)) {
    throw createError({ statusCode: 400, statusMessage: 'Этот адрес недоступен для подбора изображений' })
  }

  let response: Response
  try {
    response = await fetch(target, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AtelierIndexBot/1.0)' },
      signal: AbortSignal.timeout(8000)
    })
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Не удалось загрузить страницу бренда' })
  }

  const contentType = response.headers.get('content-type') || ''
  if (!response.ok || !contentType.includes('text/html')) {
    throw createError({ statusCode: 502, statusMessage: 'Страница не вернула HTML-содержимое' })
  }

  const html = await response.text()
  const $ = cheerio.load(html)
  const found = new Set<string>()

  function addCandidate(raw: string | undefined) {
    if (!raw) return
    const first = raw.split(',')[0]?.trim().split(' ')[0]
    // {{...}} — незаполненные шаблоны конструкторов сайтов (например, галереи Tilda)
    if (!first || first.startsWith('data:') || first.includes('{{')) return
    try {
      const absolute = new URL(first, target).toString()
      if (!isSkippableImage(absolute)) found.add(absolute)
    } catch {
      // ignore malformed URLs
    }
  }

  $('img').each((_, el) => {
    // При ленивой загрузке в src лежит заглушка, а настоящий адрес — в data-атрибутах
    const lazy = $(el).attr('data-original') || $(el).attr('data-src') || $(el).attr('data-lazy-src')
    addCandidate(lazy || $(el).attr('src'))
    addCandidate($(el).attr('srcset'))
  })
  // Фоновые картинки блоков Tilda
  $('[data-original]').not('img').each((_, el) => addCandidate($(el).attr('data-original')))
  // Фоновые картинки из CSS: и в атрибутах style, и в тегах <style> (так их выводит Tilda)
  const backgroundCss = [
    ...$('[style*="background-image"]').map((_, el) => $(el).attr('style') || '').get(),
    ...$('style').map((_, el) => $(el).text()).get()
  ].join('\n')
  for (const match of backgroundCss.matchAll(/background-image:\s*url\(\s*['"]?([^'")]+)['"]?\s*\)/gi)) {
    addCandidate(match[1])
  }
  $('source').each((_, el) => addCandidate($(el).attr('srcset')))
  $('meta[property="og:image"]').each((_, el) => addCandidate($(el).attr('content')))

  return { images: [...found].slice(0, 60) }
})
