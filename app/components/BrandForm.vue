<script setup lang="ts">
import type { Brand, BrandLinkType } from '~~/shared/types/brand'
import { CATEGORY_OPTIONS, COUNTRY_OPTIONS, LINK_TYPE_OPTIONS } from '~~/shared/constants/catalog'
import { isVideoPermalink } from '~~/shared/utils/links'

// Без brand — создание нового, с brand — редактирование существующего
const props = defineProps<{ brand?: Brand }>()

function emptyForm() {
  return {
    name: '',
    countries: ['RU'],
    categories: ['Одежда'] as string[],
    links: [{ type: 'website', url: '' }] as { type: BrandLinkType, url: string }[],
    images: [] as { url: string, alt: string }[],
    publish: true
  }
}

function formFromBrand(brand: Brand) {
  return {
    name: brand.name,
    countries: [...brand.countries],
    categories: [...brand.categories],
    links: brand.links.filter(link => !isVideoPermalink(link.url)).map(({ type, url }) => ({ type, url })),
    images: brand.images.map(({ url, alt }) => ({ url, alt })),
    publish: brand.status === 'published'
  }
}

const form = reactive(props.brand ? formFromBrand(props.brand) : emptyForm())

interface VideoCheck {
  status: 'playable' | 'instagram-only' | 'unknown' | 'error'
  reason: 'music' | 'restricted' | null
  username: string | null
  message?: string
}

const videos = ref<{ url: string, check: VideoCheck | null, checking: boolean }[]>(
  (props.brand?.links || []).filter(link => isVideoPermalink(link.url)).map(link => ({ url: link.url, check: null, checking: false }))
)

const isSubmitting = ref(false)
const successMessage = ref('')
const submitError = ref('')

function toggleCategory(category: string) {
  const index = form.categories.indexOf(category)
  if (index === -1) form.categories.push(category)
  else form.categories.splice(index, 1)
}

function addLink() {
  form.links.push({ type: form.links.at(-1)?.type || 'website', url: '' })
}

function removeLink(index: number) {
  form.links.splice(index, 1)
}

function addVideoUrl() {
  videos.value.push({ url: '', check: null, checking: false })
}

function removeVideoUrl(index: number) {
  videos.value.splice(index, 1)
}

async function checkVideo(video: { url: string, check: VideoCheck | null, checking: boolean }) {
  if (!video.url.trim()) return
  video.checking = true
  video.check = null
  try {
    video.check = await $fetch<VideoCheck>('/api/admin/check-video', { method: 'POST', body: { url: video.url.trim() } })
  } catch (error: any) {
    video.check = { status: 'error', reason: null, username: null, message: error?.data?.data?.[0]?.message || error?.data?.message || 'Не удалось проверить видео' }
  } finally {
    video.checking = false
  }
}

function videoCheckText(check: VideoCheck) {
  const author = check.username ? ` Автор: @${check.username}.` : ''
  if (check.status === 'playable') return `Видео будет проигрываться на сайте.${author}`
  if (check.status === 'instagram-only') {
    const reason = check.reason === 'music'
      ? 'в рилсе музыка из библиотеки Instagram'
      : 'автор запретил показ на других сайтах'
    return `Откроется только в Instagram: ${reason}.${author}`
  }
  if (check.status === 'unknown') return 'Instagram не отдал видео — возможно, это фото или пост удалён.'
  return check.message || 'Не удалось проверить видео'
}

const websiteLinks = computed(() => form.links.filter(link => link.type === 'website' && link.url))
const fetchFromUrl = ref('')
const fetchPending = ref(false)
const fetchError = ref('')
const candidateImages = ref<string[]>([])
const MAX_IMAGES = 5
const MIN_IMAGES = 1

watch(websiteLinks, (links) => {
  if (!links.some(link => link.url === fetchFromUrl.value)) {
    fetchFromUrl.value = links[0]?.url || ''
  }
}, { deep: true, immediate: true })

async function fetchSiteImages() {
  if (!fetchFromUrl.value) return
  fetchPending.value = true
  fetchError.value = ''
  candidateImages.value = []
  try {
    const response = await $fetch<{ images: string[] }>('/api/admin/fetch-images', {
      method: 'POST',
      body: { url: fetchFromUrl.value }
    })
    candidateImages.value = response.images
  } catch (error: any) {
    fetchError.value = error?.data?.statusMessage || 'Не удалось получить изображения с сайта'
  } finally {
    fetchPending.value = false
  }
}

function isImageSelected(url: string) {
  return form.images.some(image => image.url === url)
}

function toggleCandidate(url: string) {
  const index = form.images.findIndex(image => image.url === url)
  if (index !== -1) form.images.splice(index, 1)
  else if (form.images.length < MAX_IMAGES) form.images.push({ url, alt: `${form.name || 'Бренд'} — фото ${form.images.length + 1}` })
}

function removeImage(index: number) {
  form.images.splice(index, 1)
}

function resetForm() {
  Object.assign(form, emptyForm())
  videos.value = []
  candidateImages.value = []
  fetchError.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function saveChanges(id: string, links: { type: BrandLinkType, url: string }[]) {
  isSubmitting.value = true
  try {
    const saved = await $fetch<{ slug: string, status: string }>(`/api/admin/brands/${id}`, {
      method: 'PUT',
      body: { ...form, links }
    })
    if (saved.status === 'published') {
      await navigateTo(`/brands/${saved.slug}`)
    } else {
      successMessage.value = 'Изменения сохранены. Бренд снят с публикации и в каталоге не виден.'
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  } catch (error: any) {
    submitError.value = error?.data?.message || 'Проверьте обязательные поля и подключение к базе данных.'
  } finally {
    isSubmitting.value = false
  }
}

async function submit() {
  submitError.value = ''
  successMessage.value = ''
  if (form.images.length < MIN_IMAGES) {
    submitError.value = 'Выберите хотя бы одно изображение.'
    return
  }
  const links = [
    ...form.links,
    ...videos.value.filter(video => video.url.trim()).map(video => ({ type: 'instagram' as BrandLinkType, url: video.url }))
  ]
  if (props.brand) {
    await saveChanges(props.brand.id, links)
    return
  }
  // Вкладку открываем сразу по клику, иначе браузер заблокирует её как всплывающее окно
  const brandTab = form.publish ? window.open('', '_blank') : null
  isSubmitting.value = true
  try {
    const created = await $fetch<{ slug: string, status: string }>('/api/brands' as string, {
      method: 'POST',
      body: { ...form, links }
    })
    if (brandTab) {
      brandTab.opener = null
      brandTab.location.href = `/brands/${created.slug}`
    }
    successMessage.value = created.status === 'published'
      ? `Бренд «${form.name}» сохранён${brandTab ? ' и открыт в новой вкладке' : ''}.`
      : `Черновик «${form.name}» сохранён.`
    resetForm()
  } catch (error: any) {
    brandTab?.close()
    submitError.value = error?.data?.message || 'Проверьте обязательные поля и подключение к базе данных.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="admin-page">
    <header class="admin-page__header">
      <div>
        <p class="eyebrow">Редактор каталога</p>
        <h1>{{ brand ? brand.name : 'Новый бренд' }}</h1>
        <p>{{ brand ? 'Редактирование карточки бренда.' : 'Создайте черновик или сразу опубликуйте заполненную карточку.' }}</p>
        <p v-if="successMessage" class="form-success" role="status">{{ successMessage }}</p>
      </div>
      <NuxtLink :to="brand?.status === 'published' ? `/brands/${brand.slug}` : '/'">Закрыть</NuxtLink>
    </header>

    <form class="brand-form" @submit.prevent="submit">
      <section class="form-section">
        <div class="form-section__title"><span>01</span><div><h2>Основное</h2><p>Название бренда.</p></div></div>
        <div class="form-fields">
          <label>Название бренда<input v-model="form.name" required minlength="2" placeholder="Например, Nami Form"></label>
        </div>
      </section>

      <section class="form-section">
        <div class="form-section__title"><span>02</span><div><h2>Классификация</h2><p>Страна происхождения и категории товаров. У бренда может быть несколько категорий.</p></div></div>
        <div class="form-fields">
          <label>Страна<select v-model="form.countries[0]"><option v-for="country in COUNTRY_OPTIONS" :key="country.value" :value="country.value">{{ country.label }}</option></select></label>
          <div class="category-picker">
            <span class="category-picker__label">Категории</span>
            <div class="category-picker__options">
              <label v-for="category in CATEGORY_OPTIONS" :key="category" class="category-chip">
                <input type="checkbox" :checked="form.categories.includes(category)" @change="toggleCategory(category)">
                <span>{{ category }}</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section class="form-section">
        <div class="form-section__title"><span>03</span><div><h2>Ссылки</h2><p>Официальные сайты, профили Instagram, другие ресурсы (маркетплейсы и т.п.). Каждого типа можно добавить сколько угодно.</p></div></div>
        <div class="form-fields">
          <div v-for="(link, index) in form.links" :key="index" class="link-editor">
            <select v-model="link.type" aria-label="Тип ссылки">
              <option v-for="option in LINK_TYPE_OPTIONS" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
            <input v-model="link.url" required type="url" :placeholder="link.type === 'instagram' ? 'https://www.instagram.com/...' : 'https://'" aria-label="Адрес ссылки">
            <button type="button" aria-label="Удалить ссылку" @click="removeLink(index)">×</button>
          </div>
          <button class="text-button" type="button" @click="addLink">+ Добавить ссылку</button>
        </div>
      </section>

      <section class="form-section">
        <div class="form-section__title"><span>04</span><div><h2>Видео</h2><p>Ссылки на Reels/посты Instagram с видео бренда. Жмёте «+» — появляется поле, вставляете ссылку.</p></div></div>
        <div class="form-fields">
          <div v-for="(video, index) in videos" :key="index" class="video-link">
            <div class="video-link-editor">
              <input v-model="video.url" required type="url" placeholder="https://www.instagram.com/reel/..." @input="video.check = null">
              <button class="text-button" type="button" :disabled="video.checking || !video.url.trim()" @click="checkVideo(video)">{{ video.checking ? 'Проверяем…' : 'Проверить' }}</button>
              <button type="button" aria-label="Удалить ссылку на видео" @click="removeVideoUrl(index)">×</button>
            </div>
            <p v-if="video.check" :class="video.check.status === 'playable' ? 'form-success' : 'form-error'" class="video-link__status">{{ videoCheckText(video.check) }}</p>
          </div>
          <button class="text-button" type="button" @click="addVideoUrl">+ Добавить ссылку на видео</button>
        </div>
      </section>

      <section class="form-section">
        <div class="form-section__title"><span>05</span><div><h2>Изображения</h2><p>Подтяните изображения с сайта бренда, который вы указали в ссылках выше. Нужно от 1 до 5 изображений.</p></div></div>
        <div class="form-fields">
          <div class="site-fetch">
            <template v-if="websiteLinks.length">
              <label v-if="websiteLinks.length > 1">С какого сайта подбирать
                <select v-model="fetchFromUrl"><option v-for="link in websiteLinks" :key="link.url" :value="link.url">{{ link.url }}</option></select>
              </label>
              <button class="text-button" type="button" :disabled="fetchPending" @click="fetchSiteImages">
                {{ fetchPending ? 'Загружаем…' : `Подтянуть картинки с сайта (${fetchFromUrl})` }}
              </button>
            </template>
            <p v-else class="hint">Чтобы подобрать картинки автоматически, добавьте ссылку на сайт бренда в разделе «Ссылки» выше.</p>
            <p v-if="fetchError" class="form-error">{{ fetchError }}</p>
          </div>

          <div v-if="candidateImages.length" class="image-picker">
            <div class="image-picker__grid">
              <label v-for="src in candidateImages" :key="src" class="image-picker__item">
                <input type="checkbox" :checked="isImageSelected(src)" :disabled="!isImageSelected(src) && form.images.length >= MAX_IMAGES" @change="toggleCandidate(src)">
                <img :src="src" loading="lazy" alt="">
              </label>
            </div>
            <p class="hint">Выбрано {{ form.images.length }} из {{ MAX_IMAGES }}.</p>
          </div>

          <div v-if="form.images.length" class="selected-images">
            <div v-for="(image, index) in form.images" :key="index" class="image-editor">
              <img :src="image.url" loading="lazy" alt="">
              <input v-model="image.alt" required minlength="3" placeholder="Описание изображения (alt)">
              <button type="button" aria-label="Удалить изображение" @click="removeImage(index)">×</button>
            </div>
          </div>
        </div>
      </section>

      <footer class="form-actions">
        <label class="publish-toggle"><input v-model="form.publish" type="checkbox"><span>{{ brand ? 'Опубликован' : 'Опубликовать сразу' }}</span></label>
        <div>
          <p v-if="submitError" class="form-error">{{ submitError }}</p>
          <button class="primary-button" type="submit" :disabled="isSubmitting">{{ isSubmitting ? 'Сохраняем…' : brand ? 'Сохранить изменения' : 'Сохранить бренд' }}</button>
        </div>
      </footer>
    </form>
  </main>
</template>
