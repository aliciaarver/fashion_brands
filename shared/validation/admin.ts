import { z } from 'zod'

export const fetchImagesSchema = z.object({
  url: z.url().refine(value => value.startsWith('http://') || value.startsWith('https://'), 'Нужна ссылка http или https')
})

export type FetchImagesInput = z.infer<typeof fetchImagesSchema>

export const checkVideoSchema = z.object({
  url: z.url().refine(value => /instagram\.com\/(reel|reels|p|tv)\/[\w-]+/i.test(value), 'Нужна ссылка на рилс или пост Instagram')
})

export type CheckVideoInput = z.infer<typeof checkVideoSchema>
