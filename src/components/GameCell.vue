<template>
  <div
    class="cell"
    :class="[cellClasses, { 'cell-flip': shouldReveal }]"
    :style="{ animationDelay: shouldReveal ? `${revealDelay}ms` : '0ms' }"
  >
    {{ letter }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { LetterState } from '@/types'

interface Props {
  letter: string
  state: LetterState
  position: number
  revealDelay: number
  shouldReveal: boolean
}

const props = defineProps<Props>()

const cellClasses = computed(() => {
  const base =
    'w-10 h-10 sm:w-14 sm:h-14 border-2 flex items-center justify-center text-xl sm:text-2xl font-bold'

  switch (props.state) {
    case 'correct':
      return `${base} bg-correct border-correct text-white`
    case 'present':
      return `${base} bg-present border-present text-white`
    case 'absent':
      return `${base} bg-absent border-absent text-white`
    case 'filled':
      return `${base} bg-white dark:bg-[#121213] border-gray-400 dark:border-[#3a3a3c] text-black dark:text-white`
    default:
      return `${base} bg-white dark:bg-[#121213] border-gray-300 dark:border-[#3a3a3c] text-black dark:text-white`
  }
})
</script>

<style scoped>
.cell {
  transition: all 0.2s ease-in-out;
}

.cell:not(.cell-flip) {
  transform: rotateX(0deg);
}

.bg-correct {
  background-color: var(--color-correct);
}

.bg-present {
  background-color: var(--color-present);
}

.bg-absent {
  background-color: var(--color-absent);
}

.border-correct {
  border-color: var(--color-correct);
}

.border-present {
  border-color: var(--color-present);
}

.border-absent {
  border-color: var(--color-absent);
}
</style>
