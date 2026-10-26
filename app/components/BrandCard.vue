<script setup lang="ts">
import type { Brand } from '~~/shared/types/brand'
import { CATEGORY_ICONS, countryLabel } from '~~/shared/constants/catalog'

const props = defineProps<{ brand: Brand }>()

const route = useRoute()
// Карточка открывается модальным окном поверх текущей страницы
const brandLink = computed(() => ({ query: { ...route.query, brand: props.brand.slug } }))

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
    <NuxtLink class="brand-card__image" :to="brandLink">
      <img :src="brand.images[0]?.url" :alt="brand.images[0]?.alt || brand.name" loading="lazy">
    </NuxtLink>
    <button
      type="button"
      class="brand-card__save"
      :class="{ 'brand-card__save--active': isSaved(brand.id) }"
      :aria-pressed="isSaved(brand.id)"
      :aria-label="isSaved(brand.id) ? 'Убрать из моих брендов' : 'Сохранить бренд'"
      :disabled="toggling"
      @click="onToggleSave"
    ><AppIcon name="heart" :filled="isSaved(brand.id)" /></button>
    <div class="brand-card__body">
      <p class="brand-card__meta">{{ brand.countries.map(countryLabel).join(', ') }}</p>
      <NuxtLink :to="brandLink">
        <h2>{{ brand.name }}</h2>
      </NuxtLink>
      <div class="tag-row">
        <span v-for="tag in brand.categories" :key="tag" class="tag"><AppIcon :name="CATEGORY_ICONS[tag] || 'tag'" /> {{ tag }}</span>
      </div>
    </div>
  </article>
</template>
