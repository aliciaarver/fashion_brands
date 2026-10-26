import type { BrandLinkType } from '../types/brand'

export const COUNTRY_OPTIONS = [
  { value: 'RU', label: 'Россия', flag: '🇷🇺' },
  { value: 'JP', label: 'Япония', flag: '🇯🇵' },
  { value: 'KR', label: 'Южная Корея', flag: '🇰🇷' },
  { value: 'GE', label: 'Грузия', flag: '🇬🇪' },
  { value: 'FR', label: 'Франция', flag: '🇫🇷' },
  { value: 'ES', label: 'Испания', flag: '🇪🇸' },
  { value: 'GB', label: 'Великобритания', flag: '🇬🇧' },
  { value: 'BY', label: 'Беларусь', flag: '🇧🇾' },
  { value: 'KZ', label: 'Казахстан', flag: '🇰🇿' },
  { value: 'CN', label: 'Китай', flag: '🇨🇳' },
  { value: 'VN', label: 'Вьетнам', flag: '🇻🇳' },
  { value: 'TH', label: 'Таиланд', flag: '🇹🇭' },
  { value: 'AE', label: 'ОАЭ', flag: '🇦🇪' },
  { value: 'US', label: 'США', flag: '🇺🇸' },
  { value: 'BR', label: 'Бразилия', flag: '🇧🇷' },
  { value: 'IT', label: 'Италия', flag: '🇮🇹' },
  { value: 'DE', label: 'Германия', flag: '🇩🇪' },
  { value: 'SE', label: 'Швеция', flag: '🇸🇪' }
]

export const CATEGORY_OPTIONS = [
  'Одежда',
  'Обувь',
  'Аксессуары',
  'Сумки',
  'Нижнее белье'
]

// Имена иконок из AppIcon для категорий и типов ссылок
export const CATEGORY_ICONS: Record<string, string> = {
  'Одежда': 'shirt',
  'Обувь': 'shoe',
  'Аксессуары': 'gem',
  'Сумки': 'bag',
  'Нижнее белье': 'sparkles'
}

export const LINK_TYPE_ICONS: Record<BrandLinkType, string> = {
  website: 'globe',
  instagram: 'instagram',
  other: 'link'
}

export function countryLabel(code: string) {
  const country = COUNTRY_OPTIONS.find(option => option.value === code)
  return country ? `${country.flag} ${country.label}` : code
}

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
