<script setup lang="ts">
const route = useRoute()
const { fetch: refreshSession } = useUserSession()
const { completePendingSave } = useSavedBrands()

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const pending = ref(false)

async function submit() {
  errorMessage.value = ''
  pending.value = true
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: { email: email.value, password: password.value } })
    await refreshSession()
    await completePendingSave()
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/library'
    await navigateTo(redirect)
  } catch {
    errorMessage.value = 'Неверный email или пароль'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <span class="auth-page__icon"><AppIcon name="heart" /></span>
    <h1>С возвращением</h1>
    <p class="auth-page__lead">Войдите, чтобы видеть свои сохранённые бренды.</p>
    <form class="auth-form" @submit.prevent="submit">
      <label>
        Email
        <input v-model="email" type="email" required autocomplete="email">
      </label>
      <label>
        Пароль
        <input v-model="password" type="password" required autocomplete="current-password">
      </label>
      <p v-if="errorMessage" class="notice notice--error">{{ errorMessage }}</p>
      <button class="pill-button pill-button--accent pill-button--large" type="submit" :disabled="pending">{{ pending ? 'Входим…' : 'Войти' }}</button>
    </form>
    <p class="auth-page__switch">Нет аккаунта? <NuxtLink :to="{ path: '/register', query: route.query }">Зарегистрироваться</NuxtLink></p>
  </main>
</template>
