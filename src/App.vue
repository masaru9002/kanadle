<template>
  <div id="app" class="min-h-screen flex flex-col items-center">
    <GameHeader
      v-if="!loading"
      @stats="showModal = true"
      :target-word="gameState?.targetWord || ''"
    />

    <main class="w-full flex-1 flex flex-col">
      <div class="p-6 w-full flex-1 flex flex-col items-center justify-center">
        <div v-if="loading" class="flex-1 flex items-center justify-center">
          <LoaderAnimation :message="loadingMessage" />
        </div>

        <div v-else-if="initError" class="text-center py-8">
          <div class="text-lg text-red-700 font-semibold mb-4">
            Error: Could not initialize game
          </div>
          <div class="text-sm text-red-600 mb-4">
            {{ initError }}
          </div>
          <button
            @click="retryInitialization"
            class="px-4 py-2 text-white rounded transition-colors"
          >
            Retry
          </button>
        </div>

        <div
          v-else-if="gameState"
          class="game-container w-full flex flex-col items-center justify-center flex-1"
        >
          <GameBoard
            :board="gameState.board"
            :current-row="gameState.currentRow"
            :target-word="gameState.targetWord"
            :guesses="gameState.guesses"
            :should-shake="shakeBoard"
          />

          <Keyboard
            :letter-states="gameState.letterStates"
            :game-status="gameState.gameStatus"
            :is-invalid-word="isInvalidWord"
            :is-submitting="isSubmittingGuess"
            :guesses="gameState.guesses"
            @letter-press="handleLetterPress"
            @enter="handleEnter"
            @backspace="handleBackspace"
          />
        </div>
      </div>
    </main>

    <GameModal
      v-if="gameState"
      :is-visible="showModal"
      :game-status="gameState.gameStatus"
      :target-word="gameState.targetWord"
      :guesses="gameState.guesses"
      :word-meanings="targetWordMeanings"
      @close="showModal = false"
      @play-again="resetGame"
    />
  </div>

  <transition name="fade">
    <div
      v-if="errorMessage"
      class="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 error-message bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded shadow"
    >
      {{ errorMessage }}
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import GameHeader from './components/GameHeader.vue'
import GameBoard from './components/GameBoard.vue'
import Keyboard from './components/GameKeyboard.vue'
import GameModal from './components/GameModal.vue'
import LoaderAnimation from './components/LoaderAnimation.vue'
import { gameService } from './services/gameService'
import { initializeWordService } from './services/wordService'
import type { GameState } from './types'

const loading = ref(true)
const loadingMessage = ref('')
const initError = ref('')
const gameState = ref<GameState | null>(null)
const showModal = ref(false)
const errorMessage = ref('')
const shakeBoard = ref(false)
const isInvalidWord = ref(false)
const isSubmittingGuess = ref(false)

const targetWordMeanings = ref('')

watch(
  () => gameState.value?.targetWord,
  async (newWord: string | undefined) => {
    if (newWord) {
      targetWordMeanings.value = await gameService.getWordMeanings(newWord)
    } else {
      targetWordMeanings.value = ''
    }
  },
)

const initializeApp = async () => {
  loading.value = true
  loadingMessage.value = 'Loading word data...'
  initError.value = ''

  try {
    await initializeWordService()

    const savedGame = await gameService.loadGame()

    if (savedGame) {
      gameState.value = savedGame
    } else {
      gameState.value = await gameService.createDailyGame()
      gameService.saveGame(gameState.value)
    }

    loading.value = false
  } catch (error) {
    console.error('Failed to initialize game:', error)
    try {
      gameState.value = await gameService.createRandomGame()
      gameService.saveGame(gameState.value)
      loading.value = false
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError)
      loading.value = false
      initError.value = 'Could not create any game. Something went wrong with the word data.'
    }
  }
}

const retryInitialization = () => {
  initializeApp()
}

const handleLetterPress = (letter: string) => {
  if (!gameState.value || isSubmittingGuess.value) return

  clearErrorMessage()
  gameState.value = gameService.addLetter(gameState.value, letter)
  saveGame()
}

const handleBackspace = () => {
  if (!gameState.value || isSubmittingGuess.value) return

  clearErrorMessage()
  gameState.value = gameService.removeLetter(gameState.value)
  saveGame()
}

const handleEnter = async () => {
  if (!gameState.value || isSubmittingGuess.value) return

  clearErrorMessage()
  isInvalidWord.value = false

  if (!gameService.canSubmitGuess(gameState.value)) {
    if (gameState.value.currentCol < 4) {
      showError('Please enter 4 letters')
    }
    return
  }

  isSubmittingGuess.value = true

  try {
    const newState = await gameService.submitGuess(gameState.value)

    if ('error' in newState) {
      showError('Invalid word')
      isInvalidWord.value = true
      triggerShake()
      return
    }

    isInvalidWord.value = false
    gameState.value = newState
    saveGame()

    if (gameState.value.gameStatus !== 'playing') {
      setTimeout(() => {
        showModal.value = true
      }, 1500)
    }
  } catch (error) {
    console.error('Error submitting guess:', error)
    showError('Could not verify word')
    triggerShake()
  } finally {
    isSubmittingGuess.value = false
  }
}

const saveGame = () => {
  if (gameState.value) {
    gameService.saveGame(gameState.value)
  }
}

const showError = (message: string) => {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 2000)
}

const clearErrorMessage = () => {
  errorMessage.value = ''
}

const triggerShake = () => {
  shakeBoard.value = true
  setTimeout(() => {
    shakeBoard.value = false
  }, 500)
}

const resetGame = async () => {
  showModal.value = false
  try {
    gameState.value = await gameService.createDailyGame()
    gameService.saveGame(gameState.value)
  } catch (error) {
    console.error('Failed to reset game:', error)
    showError('Could not create a new game')
  }
}

onMounted(() => {
  initializeApp()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
