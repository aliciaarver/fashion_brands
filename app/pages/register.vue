<script setup lang="ts">
const route = useRoute()
const { fetch: refreshSession } = useUserSession()
const { completePendingSave } = useSavedBrands()

const email = ref('')
const password = ref('')
const displayName = ref('')
const errorMessage = ref('')
const pending = ref(false)

async function submit() {
  errorMessage.value = ''
  pending.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: { email: email.value, password: password.value, displayName: displayName.value }
    })
    await refreshSession()
    await completePendingSave()
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/library'
    await navigateTo(redirect)
  } catch (error: unknown) {
    const statusMessage = (error as { data?: { statusMessage?: string } })?.data?.statusMessage
    errorMessage.value = statusMessage || 'Не удалось зарегистрироваться'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <span class="auth-page__icon"><AppIcon name="sparkles" /></span>
    <h1>Создайте аккаунт</h1>
    <p class="auth-page__lead">Сохраняйте понравившиеся бренды и возвращайтесь к ним в любой момент.</p>
    <form class="auth-form" @submit.prevent="submit">
      <label>
        Имя
        <input v-model="displayName" type="text" required autocomplete="name">
      </label>
      <label>
        Email
        <input v-model="email" type="email" required autocomplete="email">
      </label>
      <label>
        Пароль
        <input v-model="password" type="password" required minlength="8" autocomplete="new-password">
      </label>
      <p v-if="errorMessage" class="notice notice--error">{{ errorMessage }}</p>
      <button class="pill-button pill-button--accent pill-button--large" type="submit" :disabled="pending">{{ pending ? 'Создаём…' : 'Зарегистрироваться' }}</button>
    </form>
    <p class="auth-page__switch">Уже есть аккаунт? <NuxtLink :to="{ path: '/login', query: route.query }">Войти</NuxtLink></p>
  </main>
</template>
