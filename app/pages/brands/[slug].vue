<script setup lang="ts">
import type { Brand } from '~~/shared/types/brand'
import { LINK_TYPE_LABELS } from '~~/shared/constants/catalog'
import { isVideoPermalink } from '~~/shared/utils/links'

const route = useRoute()
const { data: brand, error } = await useFetch<Brand>(`/api/brands/${route.params.slug}`)

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Бренд не найден' })
}

useSeoMeta({
  title: () => brand.value ? `${brand.value.name} — Atelier Index` : 'Бренд — Atelier Index'
})

const { user } = useUserSession()
const { isSaved, toggle } = useSavedBrands()
const toggling = ref(false)

async function onToggleSave() {
  if (!brand.value) return
  toggling.value = true
  try {
    await toggle(brand.value.id)
  } finally {
    toggling.value = false
  }
}


const videoLinks = computed(() => brand.value?.links.filter(link => link.type === 'instagram' && isVideoPermalink(link.url)) || [])

const displayLinks = computed(() => {
  if (!brand.value) return []
  const countByType: Record<string, number> = {}
  return brand.value.links
    .filter(link => !isVideoPermalink(link.url))
    .map((link) => {
      const count = (countByType[link.type] || 0) + 1
      countByType[link.type] = count
      const base = LINK_TYPE_LABELS[link.type] || link.type
      return { ...link, displayLabel: count > 1 ? `${base} ${count}` : base }
    })
})
</script>

<template>
  <main v-if="brand" class="brand-page">
    <div class="brand-page__back"><NuxtLink to="/">← Вернуться в каталог</NuxtLink></div>
    <section class="brand-page__intro">
      <div>
        <p class="eyebrow">{{ brand.countries.join(' · ') }}</p>
        <h1>{{ brand.name }}</h1>
      </div>
      <div class="brand-page__actions">
        <NuxtLink v-if="user?.role === 'admin'" class="save-button" :to="`/admin/brands/${brand.id}/edit`">Редактировать</NuxtLink>
        <button class="save-button" type="button" :disabled="toggling" @click="onToggleSave">
          {{ isSaved(brand.id) ? '♥ В библиотеке' : '♡ Сохранить' }}
        </button>
      </div>
    </section>
    <section class="brand-gallery">
      <img v-for="image in brand.images" :key="image.id || image.url" :src="image.url" :alt="image.alt">
    </section>
    <section v-if="videoLinks.length" class="brand-videos">
      <p class="eyebrow">Видео</p>
      <div class="brand-videos__grid">
        <InstagramEmbed v-for="link in videoLinks" :key="link.id || link.url" :url="link.url" />
      </div>
    </section>
    <section class="brand-page__details">
      <div class="brand-facts">
        <div><span>Категории</span><p>{{ brand.categories.join(', ') }}</p></div>
        <div class="brand-links">
          <span>Где смотреть</span>
          <a v-for="link in displayLinks" :key="link.id || link.url" :href="link.url" target="_blank" rel="noopener noreferrer">{{ link.displayLabel }} ↗</a>
        </div>
      </div>
    </section>
  </main>
</template>
