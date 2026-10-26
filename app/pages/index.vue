<script setup lang="ts">
import type { Brand } from '~~/shared/types/brand'
import { pluralize } from '~~/shared/utils/plural'
import { catalogFiltersToQuery, emptyCatalogFilters } from '~~/shared/utils/filters'

const filters = ref(emptyCatalogFilters())
const query = computed(() => catalogFiltersToQuery(filters.value))
const { data: brands, status, error } = await useFetch<Brand[]>('/api/brands', { query, watch: [query] })
// Отдельный список без фильтров — для выпадающего списка брендов, чтобы он не сужался после выбора
const { data: allBrands } = await useFetch<Brand[]>('/api/brands')
const brandNames = computed(() => (allBrands.value || []).map(brand => brand.name).sort((a, b) => a.localeCompare(b, 'ru')))

function resetFilters() {
  filters.value = emptyCatalogFilters()
}
</script>

<template>
  <main>
    <h1 class="visually-hidden">Каталог брендов</h1>
    <section class="catalog catalog--top">
      <CatalogFilters v-model="filters" :brand-names="brandNames" />

      <p class="catalog__count">{{ pluralize(brands?.length || 0, ['бренд', 'бренда', 'брендов']) }}</p>
      <p v-if="status === 'pending' && !brands" class="state-message">Загружаем каталог…</p>
      <p v-else-if="error" class="state-message state-message--error">Не удалось загрузить каталог. Проверьте подключение к базе данных.</p>
      <div v-else-if="brands?.length" class="brand-grid" :class="{ 'brand-grid--refreshing': status === 'pending' }" :aria-busy="status === 'pending'">
        <BrandCard v-for="brand in brands" :key="brand.id" :brand="brand" />
      </div>
      <div v-else class="empty-state">
        <p>По этим фильтрам брендов пока нет.</p>
        <button type="button" class="pill-button" @click="resetFilters"><AppIcon name="close" /> Очистить фильтры</button>
      </div>
    </section>
  </main>
</template>
