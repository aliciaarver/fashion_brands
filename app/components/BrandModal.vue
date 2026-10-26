<script setup lang="ts">
import type { Brand } from '~~/shared/types/brand'

// Открытый бренд хранится в ?brand=<slug>: ссылкой можно поделиться, а «Назад» в браузере закрывает окно
const route = useRoute()
const router = useRouter()
const slug = computed(() => typeof route.query.brand === 'string' ? route.query.brand : '')

const { data: brand, status } = useAsyncData(
  'brand-modal',
  () => slug.value ? $fetch<Brand>(`/api/brands/${slug.value}`) : Promise.resolve(null),
  { watch: [slug] }
)

useSeoMeta({ title: () => slug.value && brand.value ? `${brand.value.name} — Atelier Index` : 'Atelier Index — каталог fashion-брендов' })

const closeButton = ref<HTMLButtonElement | null>(null)

function close() {
  const { brand: _, ...query } = route.query
  // Если окно открыли кликом по карточке на этой же странице — просто шаг назад по истории
  const back = typeof window !== 'undefined' ? window.history.state?.back : null
  const previous = typeof back === 'string' ? router.resolve(back) : null
  if (previous && previous.path === route.path && !previous.query.brand) router.back()
  else router.replace({ query })
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && slug.value) close()
}

watch(slug, (value) => {
  if (typeof document === 'undefined') return
  document.documentElement.style.overflow = value ? 'hidden' : ''
  if (value) nextTick(() => closeButton.value?.focus())
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  if (slug.value) document.documentElement.style.overflow = 'hidden'
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.documentElement.style.overflow = ''
})
</script>

<template>
  <Transition name="modal">
    <div v-if="slug" class="modal" @click.self="close">
      <div class="modal__panel" role="dialog" aria-modal="true" aria-labelledby="brand-details-title">
        <button ref="closeButton" type="button" class="modal__close" aria-label="Закрыть" @click="close">
          <AppIcon name="close" />
        </button>
        <BrandDetails v-if="brand" :brand="brand" />
        <p v-else-if="status === 'pending'" class="state-message">Загружаем бренд…</p>
        <div v-else class="empty-state">
          <p>Бренд не найден — возможно, его убрали из каталога.</p>
          <button type="button" class="pill-button pill-button--soft" @click="close"><AppIcon name="back" /> К каталогу</button>
        </div>
      </div>
    </div>
  </Transition>
</template>
