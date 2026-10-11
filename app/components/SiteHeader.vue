<script setup lang="ts">
const route = useRoute()
const { user, loggedIn, clear } = useUserSession()
const { theme, toggle } = useTheme()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/')
}
</script>

<template>
  <header class="site-header">
    <NuxtLink class="wordmark" to="/">
      ATELIER INDEX
    </NuxtLink>
    <nav aria-label="Основная навигация">
      <NuxtLink :class="{ active: route.path === '/' }" to="/">Каталог</NuxtLink>
      <NuxtLink to="/library">Библиотека</NuxtLink>
      <NuxtLink v-if="user?.role === 'admin'" :class="{ active: route.path.startsWith('/admin') }" to="/admin/brands/new">Добавить бренд</NuxtLink>
      <template v-if="loggedIn">
        <span class="nav-user">{{ user?.displayName }}</span>
        <button type="button" class="nav-link-button" @click="logout">Выйти</button>
      </template>
      <NuxtLink v-else to="/login">Войти</NuxtLink>
      <button
        type="button"
        class="theme-toggle"
        :aria-label="theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'"
        @click="toggle"
      >{{ theme === 'dark' ? '☀' : '☾' }}</button>
    </nav>
  </header>
</template>
