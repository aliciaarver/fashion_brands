<script setup lang="ts">
const { loggedIn } = useUserSession()
const { refresh } = useSavedBrands()
const { init } = useTheme()

watch(loggedIn, () => refresh(), { immediate: true })
onMounted(() => init())
</script>

<template>
  <div class="app-shell">
    <NuxtRouteAnnouncer />
    <SiteHeader />
    <NuxtPage />
    <BrandModal />
  </div>
</template>
