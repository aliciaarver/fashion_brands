export type BrandLinkType = 'website' | 'instagram' | 'other'
export type BrandStatus = 'draft' | 'published' | 'archived'

export interface BrandLink {
  id?: string
  type: BrandLinkType
  url: string
  sortOrder?: number
}

export interface BrandImage {
  id?: string
  url: string
  alt: string
  sortOrder?: number
}

export interface Brand {
  id: string
  name: string
  slug: string
  countries: string[]
  categories: string[]
  status: BrandStatus
  links: BrandLink[]
  images: BrandImage[]
  createdAt: string
}

export interface BrandFilters {
  q?: string
  country?: string
  category?: string
}
