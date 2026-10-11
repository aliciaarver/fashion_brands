import type { BrandLinkType } from '../types/brand'

export const COUNTRY_OPTIONS = [
  { value: 'RU', label: 'Россия' },
  { value: 'JP', label: 'Япония' },
  { value: 'KR', label: 'Южная Корея' },
  { value: 'GE', label: 'Грузия' },
  { value: 'FR', label: 'Франция' },
  { value: 'ES', label: 'Испания' },
  { value: 'GB', label: 'Великобритания' }
]

export const CATEGORY_OPTIONS = [
  'Одежда',
  'Обувь',
  'Аксессуары',
  'Сумки',
  'Нижнее белье'
]

export const LINK_TYPE_LABELS: Record<string, string> = {
  website: 'Сайт',
  instagram: 'Instagram',
  other: 'Другая ссылка'
}

export const LINK_TYPE_OPTIONS: { value: BrandLinkType, label: string }[] = [
  { value: 'website', label: 'Официальный сайт' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'other', label: 'Другой сайт' }
]
