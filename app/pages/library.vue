<script setup lang="ts">
import type { Brand } from '~~/shared/types/brand'
import { pluralize } from '~~/shared/utils/plural'
import { catalogFiltersToQuery, emptyCatalogFilters } from '~~/shared/utils/filters'

definePageMeta({ middleware: 'auth' })

const filters = ref(emptyCatalogFilters())
const query = computed(() => catalogFiltersToQuery(filters.value))
const { data: brands, status, error, refresh } = await useFetch<Brand[]>('/api/library', { query, watch: [query] })
// Отдельный список без фильтров — для выпадающего списка брендов, чтобы он не сужался после выбора
const { data: allBrands, refresh: refreshAll } = await useFetch<Brand[]>('/api/library')
const brandNames = computed(() => (allBrands.value || []).map(brand => brand.name).sort((a, b) => a.localeCompare(b, 'ru')))

const route = useRoute()
// Сердечко в модальном окне могло убрать бренд — после закрытия окна обновляем список
watch(() => route.query.brand, (value, previous) => {
  if (previous && !value) Promise.all([refresh(), refreshAll()])
})

const { unsave } = useSavedBrands()
async function removeBrand(brandId: string) {
  await unsave(brandId)
  await Promise.all([refresh(), refreshAll()])
}
</script>

<template>
  <main>
    <section class="hero hero--compact">
      <h1>Мои <em>бренды</em></h1>
      <p class="hero__copy">Всё, что вы сохранили, — в одном месте.</p>
    </section>

    <section class="catalog">
      <CatalogFilters v-model="filters" :brand-names="brandNames" />

      <p class="catalog__count">{{ pluralize(brands?.length || 0, ['бренд', 'бренда', 'брендов']) }}</p>
      <p v-if="status === 'pending' && !brands" class="state-message">Загружаем ваши бренды…</p>
      <p v-else-if="error" class="state-message state-message--error">Не удалось загрузить сохранённые бренды.</p>
      <div v-else-if="brands?.length" class="brand-grid" :class="{ 'brand-grid--refreshing': status === 'pending' }" :aria-busy="status === 'pending'">
        <div v-for="brand in brands" :key="brand.id" class="library-item">
          <BrandCard :brand="brand" />
          <button type="button" class="pill-button pill-button--soft library-item__remove" @click="removeBrand(brand.id)">
            <AppIcon name="trash" /> Убрать
          </button>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>Вы пока ничего не сохранили. Загляните в каталог и нажмите на сердечко у понравившихся брендов.</p>
        <NuxtLink class="pill-button pill-button--accent" to="/"><AppIcon name="grid" /> Перейти в каталог</NuxtLink>
      </div>
    </section>
  </main>
</template>
