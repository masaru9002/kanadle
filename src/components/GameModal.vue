<template>
  <div v-if="isVisible" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <button class="modal-close" @click="$emit('close')">×</button>

      <div class="modal-body">
        <h2 class="modal-title">
          {{
            gameStatus === 'won'
              ? '🎉 Congratulations!'
              : gameStatus === 'lost'
                ? '😭 Sorry...'
                : '📊 Game Stats'
          }}
        </h2>

        <p class="modal-message">
          <span v-if="gameStatus === 'won'">You guessed it in {{ guessCount }} tries!</span>
          <span v-else-if="gameStatus === 'lost'">The correct answer was "{{ targetWord }}".</span>
          <span v-else>Keep going! Here are your current stats.</span>
        </p>

        <div class="modal-stats">
          <div class="stat-item">
            <div class="stat-number">{{ guessCount }}/12</div>
            <div class="stat-label">Current</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.gamesPlayed }}</div>
            <div class="stat-label">Played</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.winPercentage }}%</div>
            <div class="stat-label">Win %</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.currentStreak }}</div>
            <div class="stat-label">Streak</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ stats.maxStreak }}</div>
            <div class="stat-label">Max Streak</div>
          </div>
        </div>

        <div class="modal-actions">
          <div class="share-container">
            <button class="btn btn-secondary" @click="shareResult">Share Result</button>
            <span class="tooltip" :class="{ 'tooltip-visible': showCopyTooltip }"
              >Copied to clipboard!</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { gameService } from '@/services/gameService'
import type { GameStats } from '@/types'

interface Props {
  isVisible: boolean
  gameStatus: 'won' | 'lost' | 'playing'
  targetWord: string
  guesses: string[]
}

const props = defineProps<Props>()

defineEmits<{
  close: []
  playAgain: []
}>()

const stats = ref<GameStats>(gameService.getGameStats())

watch(
  () => props.isVisible,
  (visible) => {
    if (visible) {
      stats.value = gameService.getGameStats()
    }
  },
)

const guessCount = computed(() => props.guesses.length)

const showCopyTooltip = ref(false)

const shareResult = () => {
  const result = `Kanadle ${new Date().toLocaleDateString()} - ${
    props.gameStatus === 'won' ? guessCount.value : 'X'
  }/12\n${props.guesses
    .map((guess) =>
      Array.from(guess)
        .map((letter, i) => {
          const state = gameService.getLetterState(guess, props.targetWord, i)
          return state === 'correct' ? '🟩' : state === 'present' ? '🟨' : '⬛'
        })
        .join(''),
    )
    .join('\n')}`

  navigator.clipboard
    .writeText(result)
    .then(() => {
      showCopyTooltip.value = true
      setTimeout(() => {
        showCopyTooltip.value = false
      }, 2000)
    })
    .catch(console.error)
}
</script>

<style scoped>
.modal-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
  text-align: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: #4a90e2;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
}

.share-container {
  position: relative;
  display: inline-block;
}

.tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 4px;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.2s,
    visibility 0.2s;
}

.tooltip-visible {
  opacity: 1;
  visibility: visible;
}
</style>
