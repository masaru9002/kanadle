<template>
  <button class="key" :class="keyClasses" @click="$emit('click')">
    {{ letter }}
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LetterState } from '@/types'

interface Props {
  letter: string
  state: LetterState
}

const props = defineProps<Props>()

defineEmits<{
  click: []
}>()

const keyClasses = computed(() => {
  const base = 'cursor-pointer text-xs sm:text-sm font-semibold hover:opacity-80 transition-colors'

  switch (props.state) {
    case 'correct':
      return `${base} bg-correct text-white`
    case 'present':
      return `${base} bg-present text-white`
    case 'absent':
      return `${base} bg-absent text-white`
    default:
      return `${base} bg-key-bg dark:bg-[#818384] text-black dark:text-white hover:bg-gray-300 dark:hover:bg-[#717273]`
  }
})
</script>

<style scoped>
.key {
  padding-left: 0.25rem;
  padding-right: 0.25rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  margin-left: 0.125rem;
  margin-right: 0.125rem;
  border-radius: 0.25rem;
  min-width: 1.75rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 640px) {
  .key {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
    min-width: 2.5rem;
    height: 3rem;
  }
}

.key.key-wide {
  min-width: 3rem;
}

@media (min-width: 640px) {
  .key.key-wide {
    min-width: 4rem;
  }
}
</style>
