import { z } from 'zod'

const linkSchema = z.object({
  type: z.enum(['website', 'instagram', 'other']),
  url: z.url().refine(value => value.startsWith('http://') || value.startsWith('https://'), 'Нужна ссылка http или https')
})

const imageSchema = z.object({
  url: z.string().trim().min(1),
  alt: z.string().trim().min(3).max(180)
})

export const createBrandSchema = z.object({
  name: z.string().trim().min(2).max(120),
  countries: z.array(z.string().trim().min(2).max(3)).min(1),
  categories: z.array(z.string().trim().min(2)).min(1),
  links: z.array(linkSchema).min(1),
  images: z.array(imageSchema).min(1).max(5),
  publish: z.boolean().default(false)
})

export type CreateBrandInput = z.infer<typeof createBrandSchema>
