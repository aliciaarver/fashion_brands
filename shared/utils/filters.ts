export interface CatalogFilterState {
  brands: string[]
  countries: string[]
  category: string
}

export function emptyCatalogFilters(): CatalogFilterState {
  return { brands: [], countries: [], category: '' }
}

// Параметры для /api/brands и /api/library: массивы уходят повторяющимися ключами (?country=RU&country=GE)
export function catalogFiltersToQuery(filters: CatalogFilterState) {
  const query: Record<string, string | string[]> = {}
  if (filters.brands.length) query.brand = filters.brands
  if (filters.countries.length) query.country = filters.countries
  if (filters.category) query.category = filters.category
  return query
}
