<script setup lang="ts">
import type { Brand } from '~~/shared/types/brand'

definePageMeta({ middleware: 'admin' })

const route = useRoute()
const { data: brand, error } = await useFetch<Brand>(`/api/admin/brands/${route.params.id}`)

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Бренд не найден' })
}

useSeoMeta({ title: () => brand.value ? `${brand.value.name} — редактирование` : 'Редактирование бренда' })
</script>

<template>
  <BrandForm v-if="brand" :brand="brand" />
</template>
