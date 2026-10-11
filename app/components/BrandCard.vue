<script setup lang="ts">
import type { Brand } from '~~/shared/types/brand'
import { COUNTRY_OPTIONS } from '~~/shared/constants/catalog'

const props = defineProps<{ brand: Brand }>()

const countryNames: Record<string, string> = Object.fromEntries(COUNTRY_OPTIONS.map(c => [c.value, c.label]))

const { isSaved, toggle } = useSavedBrands()
const toggling = ref(false)

async function onToggleSave() {
  toggling.value = true
  try {
    await toggle(props.brand.id)
  } finally {
    toggling.value = false
  }
}
</script>

<template>
  <article class="brand-card">
    <NuxtLink class="brand-card__image" :to="`/brands/${brand.slug}`">
      <img :src="brand.images[0]?.url" :alt="brand.images[0]?.alt || brand.name">
    </NuxtLink>
    <button
      type="button"
      class="brand-card__save"
      :class="{ 'brand-card__save--active': isSaved(brand.id) }"
      :aria-pressed="isSaved(brand.id)"
      :aria-label="isSaved(brand.id) ? 'Убрать из библиотеки' : 'Сохранить бренд'"
      :disabled="toggling"
      @click="onToggleSave"
    >{{ isSaved(brand.id) ? '♥' : '♡' }}</button>
    <div class="brand-card__body">
      <div class="brand-card__meta">
        <span>{{ brand.countries.map(code => countryNames[code] || code).join(', ') }}</span>
      </div>
      <NuxtLink :to="`/brands/${brand.slug}`">
        <h2>{{ brand.name }}</h2>
      </NuxtLink>
      <div class="tag-row">
        <span v-for="tag in brand.categories" :key="tag">{{ tag }}</span>
      </div>
    </div>
  </article>
</template>
