<script setup lang="ts">
import type { Brand } from '~~/shared/types/brand'
import { CATEGORY_OPTIONS, COUNTRY_OPTIONS } from '~~/shared/constants/catalog'

definePageMeta({ middleware: 'auth' })

const filters = reactive({ q: '', country: '', category: '' })
const query = computed(() => Object.fromEntries(Object.entries(filters).filter(([, value]) => value)))
const { data: brands, status, error, refresh } = await useFetch<Brand[]>('/api/library', { query, watch: [query] })

const hasFilters = computed(() => Object.values(filters).some(Boolean))
function resetFilters() {
  Object.assign(filters, { q: '', country: '', category: '' })
}

const { unsave } = useSavedBrands()
async function removeBrand(brandId: string) {
  await unsave(brandId)
  await refresh()
}
</script>

<template>
  <main class="catalog-layout" style="padding-top: 48px;">
    <aside class="filters" aria-label="Фильтры библиотеки">
      <div class="filters__heading">
        <span>Фильтры</span>
        <button v-if="hasFilters" type="button" @click="resetFilters">Сбросить</button>
      </div>
      <label>
        Поиск
        <input v-model="filters.q" type="search" placeholder="Название бренда">
      </label>
      <label>
        Страна
        <select v-model="filters.country">
          <option value="">Все страны</option>
          <option v-for="country in COUNTRY_OPTIONS" :key="country.value" :value="country.value">{{ country.label }}</option>
        </select>
      </label>
      <label>
        Категория
        <select v-model="filters.category">
          <option value="">Все категории</option>
          <option v-for="category in CATEGORY_OPTIONS" :key="category" :value="category">{{ category }}</option>
        </select>
      </label>
    </aside>

    <div class="catalog-results">
      <div class="catalog-results__head">
        <h2>Моя библиотека</h2>
        <span>{{ brands?.length || 0 }} брендов</span>
      </div>
      <p v-if="status === 'pending'" class="state-message">Загружаем библиотеку…</p>
      <p v-else-if="error" class="state-message state-message--error">Не удалось загрузить библиотеку.</p>
      <div v-else-if="brands?.length" class="brand-grid">
        <div v-for="brand in brands" :key="brand.id" class="library-item">
          <BrandCard :brand="brand" />
          <button type="button" class="library-item__remove" @click="removeBrand(brand.id)">Убрать из библиотеки</button>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>Вы пока ничего не сохранили. Загляните в каталог и добавьте первые бренды.</p>
        <NuxtLink class="primary-link" to="/">Перейти в каталог →</NuxtLink>
      </div>
    </div>
  </main>
</template>
