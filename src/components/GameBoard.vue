<template>
  <div class="w-fit mx-auto">
    <div class="grid grid-cols-2 gap-4 sm:gap-8">
      <!-- Left column (first 6 rows) -->
      <div
        class="grid gap-1 sm:gap-2 grid-rows-6 grid-cols-4 w-fit"
        :class="{ shake: props.shouldShake && props.currentRow < 6 }"
      >
        <template v-for="i in 24" :key="'left-' + i">
          <GameCell
            :letter="board[Math.floor((i - 1) / 4)]?.[(i - 1) % 4] || ''"
            :state="
              getCellState(
                Math.floor((i - 1) / 4),
                (i - 1) % 4,
                board[Math.floor((i - 1) / 4)]?.[(i - 1) % 4] || '',
              )
            "
            :position="(i - 1) % 4"
            :reveal-delay="((i - 1) % 4) * 100"
            :should-reveal="shouldRevealRow(Math.floor((i - 1) / 4))"
          />
        </template>
      </div>

      <!-- Right column (last 6 rows) -->
      <div
        class="grid gap-1 sm:gap-2 grid-rows-6 grid-cols-4 w-fit"
        :class="{ shake: props.shouldShake && props.currentRow >= 6 }"
      >
        <template v-for="i in 24" :key="'right-' + i">
          <GameCell
            :letter="board[Math.floor((i - 1) / 4) + 6]?.[(i - 1) % 4] || ''"
            :state="
              getCellState(
                Math.floor((i - 1) / 4) + 6,
                (i - 1) % 4,
                board[Math.floor((i - 1) / 4) + 6]?.[(i - 1) % 4] || '',
              )
            "
            :position="(i - 1) % 4"
            :reveal-delay="((i - 1) % 4) * 100"
            :should-reveal="shouldRevealRow(Math.floor((i - 1) / 4) + 6)"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import GameCell from './GameCell.vue'
import type { LetterState } from '@/types'
import { gameService } from '@/services/gameService'

interface Props {
  board: string[][]
  currentRow: number
  targetWord: string
  guesses: string[]
  shouldShake: boolean
}

const props = defineProps<Props>()

const shouldRevealRow = (rowIndex: number): boolean => {
  return rowIndex < props.guesses.length
}

const getCellState = (rowIndex: number, colIndex: number, letter: string): LetterState => {
  if (!letter) return 'empty'

  if (rowIndex === props.currentRow && props.guesses.length === rowIndex) {
    return 'filled'
  }

  if (rowIndex < props.guesses.length) {
    const guess = props.guesses[rowIndex]
    return gameService.getLetterState(guess, props.targetWord, colIndex)
  }

  return 'filled'
}
</script>

<style scoped>
.shake {
  animation: shake 0.5s;
}

@keyframes shake {
  0% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-5px);
  }
  40% {
    transform: translateX(5px);
  }
  60% {
    transform: translateX(-5px);
  }
  80% {
    transform: translateX(5px);
  }
  100% {
    transform: translateX(0);
  }
}
</style>
