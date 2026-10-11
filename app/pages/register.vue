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
    <p class="eyebrow">Регистрация</p>
    <h1>Создайте личную библиотеку</h1>
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
      <p v-if="errorMessage" class="state-message state-message--error">{{ errorMessage }}</p>
      <button type="submit" :disabled="pending">{{ pending ? 'Создаём…' : 'Зарегистрироваться' }}</button>
    </form>
    <p>Уже есть аккаунт? <NuxtLink :to="{ path: '/login', query: route.query }">Войти</NuxtLink></p>
  </main>
</template>
