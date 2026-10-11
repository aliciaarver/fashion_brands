<script setup lang="ts">
const props = defineProps<{ url: string }>()
const { process } = useInstagramEmbed()

onMounted(() => process())
watch(() => props.url, () => nextTick(() => process()))
</script>

<template>
  <blockquote class="instagram-media" :data-instgrm-permalink="url" data-instgrm-version="14">
    <a :href="url" target="_blank" rel="noopener noreferrer">{{ url }}</a>
  </blockquote>
</template>
