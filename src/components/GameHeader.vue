<template>
  <header class="game-header bg-white dark:bg-gray-900 shadow relative w-full">
    <div class="container mx-auto px-4 flex items-center justify-between h-16 relative">
      <div
        class="text-left sm:absolute sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:text-center flex-1 sm:flex-none"
      >
        <h1 class="title text-2xl font-bold text-gray-900 dark:text-gray-100">KANADLE</h1>
        <p class="subtitle text-sm text-gray-500 dark:text-gray-400">
          Wordle, but all Hiragana ( •̀ω •́ )
        </p>
      </div>

      <div class="hidden sm:block flex-1"></div>

      <div class="flex items-center gap-2 ml-2 sm:ml-0">
        <button
          class="header-btn"
          @click="toggleTheme"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          {{ isDark ? '☀️' : '🌙' }}
        </button>

        <button
          class="header-btn"
          @click="showHowToPlay = true"
          title="How to play"
          aria-label="How to play"
        >
          📚
        </button>

        <div class="relative">
          <button
            class="header-btn"
            @click="showHint = !showHint"
            @blur="showHint = false"
            title="Show hint"
            aria-label="Show hint"
          >
            💡
          </button>
          <div v-if="showHint && hint" class="hint-tooltip">Meaning: {{ hint }}</div>
        </div>

        <button
          class="header-btn"
          @click="$emit('stats')"
          title="View stats"
          aria-label="View stats"
        >
          📊
        </button>
      </div>
    </div>

    <div
      v-if="showHowToPlay"
      class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50"
      @click="showHowToPlay = false"
    >
      <div class="bg-white dark:bg-[#121213] rounded-lg max-w-md w-full relative" @click.stop>
        <button
          class="absolute top-2 right-3 text-2xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer"
          @click="showHowToPlay = false"
        >
          &times;
        </button>
        <div class="p-6">
          <h2 class="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
            How to Play
            <div class="text-sm font-normal text-gray-600 dark:text-gray-400">やり方</div>
          </h2>
          <div class="text-left space-y-4">
            <div>
              <p class="text-gray-900 dark:text-gray-100">Guess the word in 12 tries!</p>
              <p class="text-sm text-gray-600 dark:text-gray-400">12回で単語を当てよう！</p>
            </div>
            <ul class="list-disc list-inside space-y-2">
              <li class="flex flex-col">
                <span class="text-gray-900 dark:text-gray-100"
                  >Each guess must be a valid 4-character hiragana word</span
                >
                <span class="text-sm text-gray-600 dark:text-gray-400"
                  >4文字のひらがなの単語を入力してください</span
                >
              </li>
              <li class="flex flex-col">
                <span class="text-gray-900 dark:text-gray-100"
                  >The color of the tiles will change to show how close your guess was:</span
                >
                <span class="text-sm text-gray-600 dark:text-gray-400"
                  >タイルの色が正解のヒントになります：</span
                >
              </li>
            </ul>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 bg-correct flex items-center justify-center text-white font-bold rounded"
                >
                  あ
                </div>
                <div>
                  <div class="text-gray-900 dark:text-gray-100">Correct letter in correct spot</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    正解！位置も文字もばっちり
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 bg-present flex items-center justify-center text-white font-bold rounded"
                >
                  い
                </div>
                <div>
                  <div class="text-gray-900 dark:text-gray-100">Correct letter in wrong spot</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    文字は合ってるけど位置が違う
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 bg-absent flex items-center justify-center text-white font-bold rounded"
                >
                  う
                </div>
                <div>
                  <div class="text-gray-900 dark:text-gray-100">Letter not in the word</div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    この文字は含まれていません
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p class="mt-4 text-gray-900 dark:text-gray-100">
                A new KANADLE will be available each day!
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">毎日新しいKANADLEで遊べます！</p>
            </div>
          </div>
          <div class="border-t border-gray-200 dark:border-gray-600 mt-6 px-6 py-3 rounded-b-lg">
            <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
              Link to
              <a
                href="https://github.com/masaru9002/kanadle"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
              >
                Git Repository
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { gameService } from '@/services/gameService'

interface Props {
  targetWord: string
}

const props = defineProps<Props>()
defineEmits<{
  stats: []
}>()

const showHint = ref(false)
const showHowToPlay = ref(false)
const isDark = ref(false)
const hint = ref<string | null>(null)

const updateHint = async (word: string | undefined) => {
  if (word) {
    const hintText = await gameService.getWordHint(word)
    hint.value = hintText
  } else {
    hint.value = null
  }
}

watch(() => props.targetWord, updateHint, { immediate: true })

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  const html = document.querySelector('html')
  if (html) {
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      html.classList.add('dark')
      isDark.value = true
    } else {
      html.classList.remove('dark')
      isDark.value = false
    }
  }
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  const html = document.querySelector('html')
  if (html) {
    html.classList.toggle('dark')
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }
}
</script>

<style scoped>
.bg-correct {
  background-color: var(--color-correct);
}

.bg-present {
  background-color: var(--color-present);
}

.bg-absent {
  background-color: var(--color-absent);
}

.header-btn {
  font-size: 1.25rem;
  padding: 0.375rem;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition-property: background-color, color;
  transition-duration: 150ms;
  cursor: pointer;
  color: #374151;
}

@media (min-width: 640px) {
  .header-btn {
    font-size: 1.5rem;
    padding: 0.5rem;
  }
}

.header-btn:hover {
  background-color: rgba(58, 58, 60, 0.1);
}

.dark .header-btn {
  color: #e5e7eb;
}

.dark .header-btn:hover {
  background-color: #3a3a3c;
}

.hint-tooltip {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5rem;
  padding: 0.75rem;
  width: 12rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  text-align: left;
  white-space: normal;
  z-index: 20;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  background-color: white;
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.dark .hint-tooltip {
  background-color: #121213;
  border-color: #3a3a3c;
}
</style>
