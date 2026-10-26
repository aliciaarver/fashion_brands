<script setup lang="ts">
import type { Brand } from '~~/shared/types/brand'
import { CATEGORY_ICONS, LINK_TYPE_ICONS, LINK_TYPE_LABELS, countryLabel } from '~~/shared/constants/catalog'
import { isVideoPermalink } from '~~/shared/utils/links'

const props = defineProps<{ brand: Brand }>()

const { user } = useUserSession()
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

const videoLinks = computed(() => props.brand.links.filter(link => link.type === 'instagram' && isVideoPermalink(link.url)))

const displayLinks = computed(() => {
  const countByType: Record<string, number> = {}
  return props.brand.links
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
  <div class="brand-details">
    <section class="brand-page__intro">
      <div>
        <p class="brand-page__country">{{ brand.countries.map(countryLabel).join(' · ') }}</p>
        <h2 id="brand-details-title" class="brand-details__title">{{ brand.name }}</h2>
        <div class="tag-row">
          <span v-for="tag in brand.categories" :key="tag" class="tag"><AppIcon :name="CATEGORY_ICONS[tag] || 'tag'" /> {{ tag }}</span>
        </div>
      </div>
      <div class="brand-page__actions">
        <NuxtLink v-if="user?.role === 'admin'" class="pill-button pill-button--soft" :to="`/admin/brands/${brand.id}/edit`"><AppIcon name="edit" /> Редактировать</NuxtLink>
        <button class="pill-button" :class="isSaved(brand.id) ? 'pill-button--soft' : 'pill-button--accent'" type="button" :disabled="toggling" @click="onToggleSave">
          <AppIcon name="heart" :filled="isSaved(brand.id)" /> {{ isSaved(brand.id) ? 'В моих брендах' : 'Сохранить' }}
        </button>
      </div>
    </section>
    <section class="brand-gallery" :class="`brand-gallery--${Math.min(brand.images.length, 3)}`">
      <img v-for="image in brand.images" :key="image.id || image.url" :src="image.url" :alt="image.alt">
    </section>
    <section v-if="displayLinks.length" class="brand-section">
      <h3 class="section-title"><AppIcon name="link" /> Где смотреть</h3>
      <div class="brand-links">
        <a v-for="link in displayLinks" :key="link.id || link.url" class="pill-button pill-button--soft" :href="link.url" target="_blank" rel="noopener noreferrer">
          <AppIcon :name="LINK_TYPE_ICONS[link.type] || 'link'" /> {{ link.displayLabel }} <AppIcon name="external" class="icon--small" />
        </a>
      </div>
    </section>
    <section v-if="videoLinks.length" class="brand-section">
      <h3 class="section-title"><AppIcon name="play" /> Видео</h3>
      <div class="brand-videos__grid">
        <InstagramEmbed v-for="link in videoLinks" :key="link.id || link.url" :url="link.url" />
      </div>
    </section>
  </div>
</template>
