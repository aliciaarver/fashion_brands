<script setup lang="ts">
// Карточка бренда открывается модальным окном поверх каталога; прямые ссылки /brands/<slug> ведут туда же
const route = useRoute()
await navigateTo({ path: '/', query: { brand: String(route.params.slug) } }, { replace: true, redirectCode: 301 })
</script>

<template>
  <div />
</template>
