<script setup lang="ts">
interface Option { value: string, label: string, prefix?: string }

const props = defineProps<{
  options: Option[]
  placeholder: string
  label: string
  icon: string
  searchable?: boolean
}>()
const selected = defineModel<string[]>({ required: true })

const open = ref(false)
const search = ref('')
const root = ref<HTMLElement | null>(null)
const listId = useId()

const selectedOptions = computed(() => props.options.filter(option => selected.value.includes(option.value)))
const summary = computed(() => {
  const [first, ...rest] = selectedOptions.value
  if (!first) return props.placeholder
  const text = [first.prefix, first.label].filter(Boolean).join(' ')
  return rest.length ? `${text} +${rest.length}` : text
})
const visibleOptions = computed(() => {
  const term = search.value.trim().toLowerCase()
  return term ? props.options.filter(option => option.label.toLowerCase().includes(term)) : props.options
})

function toggle(value: string) {
  selected.value = selected.value.includes(value)
    ? selected.value.filter(item => item !== value)
    : [...selected.value, value]
}

function clear() {
  selected.value = []
}

function onDocumentClick(event: MouseEvent) {
  if (open.value && root.value && !root.value.contains(event.target as Node)) open.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value) {
    // Не даём Esc закрыть заодно модальное окно бренда
    event.stopPropagation()
    open.value = false
  }
}

watch(open, (value) => {
  if (!value) search.value = ''
})

onMounted(() => document.addEventListener('click', onDocumentClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <div ref="root" class="multi-select" :class="{ 'multi-select--filled': selected.length, 'multi-select--open': open }" @keydown="onKeydown">
    <button
      type="button"
      class="multi-select__trigger"
      :aria-expanded="open"
      :aria-controls="listId"
      :aria-label="`${label}: ${summary}`"
      @click="open = !open"
    >
      <AppIcon :name="icon" />
      <span class="multi-select__summary">{{ summary }}</span>
      <span v-if="!selected.length" class="multi-select__chevron" aria-hidden="true" />
    </button>
    <button v-if="selected.length" type="button" class="multi-select__clear" :aria-label="`Сбросить: ${label}`" @click="clear">
      <AppIcon name="close" />
    </button>
    <div v-if="open" :id="listId" class="multi-select__panel" role="group" :aria-label="label">
      <label v-if="searchable" class="multi-select__search">
        <AppIcon name="search" />
        <input v-model="search" type="search" placeholder="Найти" :aria-label="`Поиск: ${label}`">
      </label>
      <div class="multi-select__list">
        <label v-for="option in visibleOptions" :key="option.value" class="multi-select__option">
          <input type="checkbox" :checked="selected.includes(option.value)" @change="toggle(option.value)">
          <span v-if="option.prefix" aria-hidden="true">{{ option.prefix }}</span>
          <span>{{ option.label }}</span>
        </label>
        <p v-if="!visibleOptions.length" class="hint multi-select__empty">Ничего не нашлось</p>
      </div>
    </div>
  </div>
</template>
