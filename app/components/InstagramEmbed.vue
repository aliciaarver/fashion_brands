<script setup lang="ts">
const props = defineProps<{ url: string }>()
const { process } = useInstagramEmbed()

// embed.js заменяет blockquote своим iframe. Если blockquote принадлежит Vue, при следующем
// обновлении Vue ищет уже удалённый узел и падает (parentNode/insertBefore of null).
// Поэтому Vue владеет только пустой обёрткой, а разметку для Instagram создаём вручную.
const host = ref<HTMLDivElement | null>(null)

function render() {
  if (!host.value) return
  const quote = document.createElement('blockquote')
  quote.className = 'instagram-media'
  quote.dataset.instgrmPermalink = props.url
  quote.dataset.instgrmVersion = '14'
  const link = document.createElement('a')
  link.href = props.url
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  link.textContent = 'Смотреть в Instagram'
  quote.append(link)
  host.value.replaceChildren(quote)
  process()
}

onMounted(render)
watch(() => props.url, render)
</script>

<template>
  <div ref="host" class="instagram-embed" />
</template>
