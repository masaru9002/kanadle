<template>
  <header class="game-header bg-white shadow relative w-full">
    <div class="container mx-auto px-4 flex items-center h-16">
      <div class="text-left sm:text-center sm:flex-1">
        <h1 class="title text-2xl font-bold">KANADLE</h1>
        <p class="subtitle text-sm text-gray-500">Wordle, but all Hiragana ( •̀ω •́ )</p>
      </div>
    </div>
    <div
      class="absolute top-1/2 right-4 transform -translate-y-1/2 flex items-center space-x-2 z-10"
    >
      <button
        class="text-xl cursor-pointer sm:text-2xl p-1.5 sm:p-2 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
        @click="showHowToPlay = true"
        title="How to play"
        aria-label="How to play"
      >
        ❔
      </button>
      <div class="relative">
        <button
          class="text-xl cursor-pointer sm:text-2xl p-1.5 sm:p-2 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
          @click="showHint = !showHint"
          @blur="showHint = false"
          title="Show hint"
          aria-label="Show hint"
        >
          💡
        </button>
        <div
          v-if="showHint && hint"
          class="absolute cursor-pointer right-0 top-full mt-2 bg-white shadow-lg rounded-lg p-3 text-sm text-left whitespace-normal w-48 text-gray-800"
        >
          Meaning: {{ hint }}
        </div>
      </div>
      <button
        class="cursor-pointer text-xl sm:text-2xl p-1.5 sm:p-2 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
        @click="$emit('stats')"
        title="View stats"
        aria-label="View stats"
      >
        📊
      </button>
    </div>

    <div
      v-if="showHowToPlay"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      @click="showHowToPlay = false"
    >
      <div class="bg-white rounded-lg max-w-md w-full relative" @click.stop>
        <button
          class="cursor-pointer absolute top-2 right-3 text-2xl text-gray-500 hover:text-gray-700"
          @click="showHowToPlay = false"
        >
          &times;
        </button>
        <div class="p-6">
          <h2 class="text-2xl font-bold mb-4 text-center">
            How to Play
            <div class="text-sm font-normal">やり方</div>
          </h2>
          <div class="text-left space-y-4">
            <div>
              <p>Guess the word in 12 tries!</p>
              <p class="text-sm text-gray-600">12回で単語を当てよう！</p>
            </div>
            <ul class="list-disc list-inside space-y-2">
              <li class="flex flex-col">
                <span>Each guess must be a valid 4-character hiragana word</span>
                <span class="text-sm text-gray-600">4文字のひらがなの単語を入力してください</span>
              </li>
              <li class="flex flex-col">
                <span>The color of the tiles will change to show how close your guess was:</span>
                <span class="text-sm text-gray-600">タイルの色が正解のヒントになります：</span>
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
                  <div>Correct letter in correct spot</div>
                  <div class="text-sm text-gray-600">正解！位置も文字もばっちり</div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 bg-present flex items-center justify-center text-white font-bold rounded"
                >
                  い
                </div>
                <div>
                  <div>Correct letter in wrong spot</div>
                  <div class="text-sm text-gray-600">文字は合ってるけど位置が違う</div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div
                  class="w-8 h-8 bg-absent flex items-center justify-center text-white font-bold rounded"
                >
                  う
                </div>
                <div>
                  <div>Letter not in the word</div>
                  <div class="text-sm text-gray-600">この文字は含まれていません</div>
                </div>
              </div>
            </div>
            <div>
              <p class="mt-4">A new KANADLE will be available each day!</p>
              <p class="text-sm text-gray-600">毎日新しいKANADLEで遊べます！</p>
            </div>
          </div>
          <div class="border-t border-gray-200 mt-6 px-6 py-3 rounded-b-lg">
            <p class="text-xs text-gray-500 text-center">
              Link to
              <a
                href="https://github.com/masaru9002/kanadle"
                target="_blank"
                rel="noopener noreferrer"
                class="text-blue-600 hover:text-blue-800 underline"
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
import { ref, computed, onMounted } from 'vue'
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

const hint = computed(() => {
  return props.targetWord ? gameService.getWordHint(props.targetWord) : null
})

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
</style>
