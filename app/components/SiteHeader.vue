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
    <NuxtLink class="wordmark" to="/">Atelier Index</NuxtLink>
    <nav aria-label="Основная навигация">
      <NuxtLink class="nav-link" :class="{ active: route.path === '/' }" to="/"><AppIcon name="grid" /><span>Каталог</span></NuxtLink>
      <NuxtLink class="nav-link" :class="{ active: route.path === '/library' }" to="/library"><AppIcon name="heart" /><span>Мои бренды</span></NuxtLink>
      <NuxtLink v-if="user?.role === 'admin'" class="nav-link" :class="{ active: route.path.startsWith('/admin') }" to="/admin/brands/new"><AppIcon name="plus" /><span>Добавить</span></NuxtLink>
      <template v-if="loggedIn">
        <span class="nav-user" :title="user?.displayName"><AppIcon name="user" /><span>{{ user?.displayName }}</span></span>
        <button type="button" class="nav-link" aria-label="Выйти" @click="logout"><AppIcon name="logout" /><span>Выйти</span></button>
      </template>
      <NuxtLink v-else class="pill-button pill-button--accent" to="/login"><AppIcon name="login" /> Войти</NuxtLink>
      <button
        type="button"
        class="theme-toggle"
        :aria-label="theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'"
        @click="toggle"
      ><AppIcon :name="theme === 'dark' ? 'sun' : 'moon'" /></button>
    </nav>
  </header>
</template>
