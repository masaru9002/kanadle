<template>
  <div class="keyboard">
    <div class="keyboard-typing-space">
      <input
        v-model="typingInput"
        @keydown="handleTypingKeydown"
        @input="handleTypingInput"
        type="text"
        placeholder="Type here and press Enter"
        class="border rounded px-2 py-1 text-base focus:outline-none focus:ring"
        :class="{ 'opacity-50 cursor-not-allowed': props.gameStatus !== 'playing' }"
        :disabled="props.gameStatus !== 'playing'"
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
      />
      <button
        @click="clearTypingInput"
        class="border rounded px-3 py-1 hover:bg-gray-100 text-sm sm:text-base"
      >
        Clear
      </button>
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
          :letter="key"
          :state="letterStates[key] || 'empty'"
          :class="{ 'key-wide': key === 'ENTER' || key === '⌫' }"
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
import { ref, defineEmits } from 'vue'

interface Props {
  letterStates: Record<string, LetterState>
  gameStatus: 'won' | 'lost' | 'playing'
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

function isHiragana(char: string): boolean {
  const code = char.charCodeAt(0)
  return code >= 0x3040 && code <= 0x309f
}

function handleKeyPress(key: string) {
  emit('letterPress', key)
}

function handleTypingKeydown(event: KeyboardEvent) {
  if (props.gameStatus !== 'playing') {
    event.preventDefault()
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    submitTypingInput()
    return
  }

  // Prevent non-hiragana characters from being typed (except backspace, delete, arrow keys, etc.)
  if (event.key.length === 1 && !isHiragana(event.key)) {
    event.preventDefault()
  }
}

function handleTypingInput(event: Event) {
  const target = event.target as HTMLInputElement
  // Filter out any non-hiragana characters that might have slipped through
  const filtered = target.value.split('').filter(isHiragana).join('')
  if (filtered !== target.value) {
    typingInput.value = filtered
  }
}

function submitTypingInput() {
  if (!typingInput.value) return

  const chars = typingInput.value.split('')
  chars.forEach((char) => {
    if (isHiragana(char)) {
      emit('letterPress', char)
    }
  })

  typingInput.value = ''
}

function clearTypingInput() {
  typingInput.value = ''
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

  /* Special case for the enter/backspace row */
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
</style>
