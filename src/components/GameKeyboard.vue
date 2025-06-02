<template>
  <div class="keyboard">
    <div class="keyboard-typing-space">
      <input
        v-model="typingInput"
        @keydown="handleTypingKeydown"
        @input="handleTypingInput"
        type="text"
        :placeholder="inputPlaceholder"
        class="w-full sm:w-60 sm:mb-0 mb-2 text-base sm:text-lg bg-key-bg font-semibold rounded py-2 px-3 focus:outline-none transition-colors"
        :class="inputClasses"
        :disabled="isInputDisabled"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
      />
    </div>
    <div class="keyboard-grid">
      <!-- Left column - Basic hiragana -->
      <div class="keyboard-column">
        <div class="keyboard-row" v-for="(row, index) in leftRows" :key="'left-' + index">
          <KeyboardKey
            v-for="key in row"
            :key="key"
            :letter="key"
            :state="letterStates[key] || 'empty'"
            :class="{ 'key-wide': key === 'ENTER' || key === '⌫' }"
            :disabled="isKeyboardDisabled"
            @click="
              key === 'ENTER'
                ? emit('enter')
                : key === '⌫'
                  ? emit('backspace')
                  : handleKeyPress(key)
            "
          />
        </div>
      </div>

      <!-- Right column - Dakuten/Handakuten -->
      <div class="keyboard-column">
        <div class="keyboard-row" v-for="(row, index) in rightRows" :key="'right-' + index">
          <KeyboardKey
            v-for="key in row"
            :key="key"
            :letter="key"
            :state="letterStates[key] || 'empty'"
            :disabled="isKeyboardDisabled"
            @click="handleKeyPress(key)"
          />
        </div>
      </div>
    </div>
    <!-- Bottom section with special characters -->
    <div class="keyboard-full-width">
      <div class="keyboard-row">
        <KeyboardKey
          v-for="key in special_row"
          :key="key"
          :letter="key === 'ENTER' ? enterKeyText : key"
          :state="letterStates[key] || 'empty'"
          :class="{ 'key-wide': key === 'ENTER' || key === '⌫' }"
          :disabled="isKeyboardDisabled"
          @click="
            key === 'ENTER' ? emit('enter') : key === '⌫' ? emit('backspace') : handleKeyPress(key)
          "
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import KeyboardKey from './KeyboardKey.vue'
import type { LetterState } from '@/types'
import { ref, defineEmits, watch, computed } from 'vue'

interface Props {
  letterStates: Record<string, LetterState>
  gameStatus: 'won' | 'lost' | 'playing'
  isInvalidWord?: boolean
  guesses: string[]
  isSubmitting?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  letterPress: [letter: string]
  enter: []
  backspace: []
}>()

// Basic hiragana (left column)
const left_row1 = ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ']
const left_row2 = ['い', 'き', 'し', 'ち', 'に', 'ひ', 'み', ' ', 'り', ' ']
const left_row3 = ['う', 'く', 'す', 'つ', 'ぬ', 'ふ', 'む', 'ゆ', 'る', ' ']
const left_row4 = ['え', 'け', 'せ', 'て', 'ね', 'へ', 'め', ' ', 'れ', ' ']
const left_row5 = ['お', 'こ', 'そ', 'と', 'の', 'ほ', 'も', 'よ', 'ろ', 'を']

// Dakuten and handakuten (right column)
const right_row1 = ['が', 'ざ', 'だ', 'ば', 'ぱ']
const right_row2 = ['ぎ', 'じ', 'ぢ', 'び', 'ぴ']
const right_row3 = ['ぐ', 'ず', 'づ', 'ぶ', 'ぷ']
const right_row4 = ['げ', 'ぜ', 'で', 'べ', 'ぺ']
const right_row5 = ['ご', 'ぞ', 'ど', 'ぼ', 'ぽ']

// Special characters
const special_row = ['っ', 'ゃ', 'ゅ', 'ょ', 'ん', 'ENTER', '⌫']

// Group rows
const leftRows = [left_row1, left_row2, left_row3, left_row4, left_row5]
const rightRows = [right_row1, right_row2, right_row3, right_row4, right_row5]

const typingInput = ref('')
const lastValidInput = ref('')

// Computed properties for UI state
const isInputDisabled = computed(() => props.gameStatus !== 'playing' || props.isSubmitting)

const isKeyboardDisabled = computed(() => props.gameStatus !== 'playing' || props.isSubmitting)

const inputPlaceholder = computed(() => {
  if (props.isSubmitting) return 'Submitting...'
  if (props.gameStatus !== 'playing') return 'Game ended'
  return 'Type here and press Enter'
})

const inputClasses = computed(() => ({
  'opacity-50 cursor-not-allowed': isInputDisabled.value,
  'animate-pulse': props.isSubmitting,
}))

const enterKeyText = computed(() => (props.isSubmitting ? '...' : 'ENTER'))

watch(
  () => props.guesses.length,
  () => {
    typingInput.value = ''
    lastValidInput.value = ''
  },
)

function handleKeyPress(key: string) {
  if (isKeyboardDisabled.value) return

  if (key === 'ENTER') {
    if (!props.isSubmitting) {
      emit('enter')
    }
  } else if (key === '⌫') {
    emit('backspace')
    const currentValue = typingInput.value
    if (currentValue.length > 0) {
      const newValue = currentValue.slice(0, -1)
      typingInput.value = newValue
      lastValidInput.value = newValue
    }
  } else {
    emit('letterPress', key)
    const newValue = typingInput.value + key
    typingInput.value = newValue
    lastValidInput.value = newValue
  }
}

function handleTypingKeydown(event: KeyboardEvent) {
  if (isInputDisabled.value) {
    event.preventDefault()
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    if (!props.isSubmitting) {
      emit('enter')
    }
  } else if (event.key === 'Backspace') {
    emit('backspace')
  }
}

function handleTypingInput(event: Event) {
  if (isInputDisabled.value) {
    return
  }

  const target = event.target as HTMLInputElement
  const newValue = target.value

  const cleanedNewValue = newValue.split('').filter(isHiragana).join('')

  typingInput.value = cleanedNewValue

  const previousValue = lastValidInput.value

  syncBoardWithInput(previousValue, cleanedNewValue)

  lastValidInput.value = cleanedNewValue
}

function syncBoardWithInput(oldValue: string, newValue: string) {
  for (let i = 0; i < oldValue.length; i++) {
    emit('backspace')
  }

  for (const char of newValue) {
    emit('letterPress', char)
  }
}

function isHiragana(char: string): boolean {
  const code = char.charCodeAt(0)
  return code >= 0x3040 && code <= 0x309f
}
</script>

<style scoped>
.keyboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 750px;
}

.keyboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  width: 100%;
  margin-top: 8px;
  margin-bottom: 8px;
}

@media (min-width: 640px) {
  .keyboard-grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }

  .keyboard-column {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .keyboard-full-width {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .keyboard-row {
    display: flex;
    gap: 4px;
    min-height: 48px;
  }

  .keyboard-column:first-child .keyboard-row {
    justify-content: flex-start;
  }

  .keyboard-column:last-child .keyboard-row {
    justify-content: flex-end;
  }

  .keyboard-full-width .keyboard-row {
    justify-content: flex-end;
  }

  .keyboard-full-width .keyboard-row.justify-center {
    justify-content: center;
  }

  .key-wide {
    flex: 2;
    max-width: 120px;
  }

  .ml-2 {
    margin-left: 8px;
  }

  .keyboard-typing-space {
    margin-bottom: 12px;
  }

  input::placeholder {
    font-size: 0.85em;
  }
}

.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
</style>
