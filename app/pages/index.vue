<script setup lang="ts">
import type { Brand } from '~~/shared/types/brand'
import { CATEGORY_OPTIONS, COUNTRY_OPTIONS } from '~~/shared/constants/catalog'

const filters = reactive({ q: '', country: '', category: '' })
const query = computed(() => Object.fromEntries(Object.entries(filters).filter(([, value]) => value)))
const { data: brands, status, error } = await useFetch<Brand[]>('/api/brands', { query, watch: [query] })

const hasFilters = computed(() => Object.values(filters).some(Boolean))
function resetFilters() {
  Object.assign(filters, { q: '', country: '', category: '' })
}
</script>

<template>
  <main>
    <section class="hero">
      <p class="eyebrow">Независимые бренды со всего мира</p>
      <h1>Сохраняйте не вещи.<br>Сохраняйте ориентиры.</h1>
      <p class="hero__copy">Каталог брендов, к которым хочется вернуться. Без корзины, случайных рекомендаций и бесконечной товарной ленты.</p>
    </section>

    <section class="catalog-layout">
      <aside class="filters" aria-label="Фильтры каталога">
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
          <h2>Каталог</h2>
          <span>{{ brands?.length || 0 }} брендов</span>
        </div>
        <p v-if="status === 'pending'" class="state-message">Загружаем каталог…</p>
        <p v-else-if="error" class="state-message state-message--error">Не удалось загрузить каталог. Проверьте подключение к базе данных.</p>
        <div v-else-if="brands?.length" class="brand-grid">
          <BrandCard v-for="brand in brands" :key="brand.id" :brand="brand" />
        </div>
        <div v-else class="empty-state">
          <p>По этим фильтрам брендов пока нет.</p>
          <button type="button" @click="resetFilters">Очистить фильтры</button>
        </div>
      </div>
    </section>
  </main>
</template>
