<script setup lang="ts">
import { CATEGORY_ICONS, CATEGORY_OPTIONS, COUNTRY_OPTIONS } from '~~/shared/constants/catalog'
import { type CatalogFilterState, emptyCatalogFilters } from '~~/shared/utils/filters'

const filters = defineModel<CatalogFilterState>({ required: true })
const props = defineProps<{ brandNames: string[] }>()

const brandOptions = computed(() => props.brandNames.map(name => ({ value: name, label: name })))
const countryOptions = COUNTRY_OPTIONS.map(country => ({ value: country.value, label: country.label, prefix: country.flag }))

const hasFilters = computed(() => filters.value.brands.length > 0 || filters.value.countries.length > 0 || Boolean(filters.value.category))

function update(patch: Partial<CatalogFilterState>) {
  filters.value = { ...filters.value, ...patch }
}

function setCategory(value: string) {
  update({ category: filters.value.category === value ? '' : value })
}
</script>

<template>
  <div class="catalog-filters" role="search">
    <div class="catalog-filters__top">
      <MultiSelect
        :model-value="filters.brands"
        :options="brandOptions"
        label="Бренды"
        placeholder="Все бренды"
        icon="search"
        searchable
        @update:model-value="update({ brands: $event })"
      />
      <MultiSelect
        :model-value="filters.countries"
        :options="countryOptions"
        label="Страны"
        placeholder="Все страны"
        icon="pin"
        @update:model-value="update({ countries: $event })"
      />
      <button v-if="hasFilters" type="button" class="chip chip--ghost" @click="filters = emptyCatalogFilters()">
        <AppIcon name="close" /> Сбросить всё
      </button>
    </div>
    <div class="chip-row" aria-label="Категория">
      <button type="button" class="chip" :class="{ 'chip--active': !filters.category }" @click="update({ category: '' })">
        <AppIcon name="grid" /> Все
      </button>
      <button
        v-for="category in CATEGORY_OPTIONS"
        :key="category"
        type="button"
        class="chip"
        :class="{ 'chip--active': filters.category === category }"
        :aria-pressed="filters.category === category"
        @click="setCategory(category)"
      >
        <AppIcon :name="CATEGORY_ICONS[category] || 'tag'" /> {{ category }}
      </button>
    </div>
  </div>
</template>
