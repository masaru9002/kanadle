import type { ProcessedWord, JMDictRoot } from '@/types'
import { isValidHiraganaWord } from '@/utils/validation'
import { toRomaji } from 'wanakana'

class WordService {
  private processedWords: Map<string, ProcessedWord> = new Map()
  private fourLetterWords: string[] = []
  private isInitialized = false

  async initialize(jmdictData: JMDictRoot): Promise<void> {
    for (const entry of jmdictData.words) {
      for (const kanaEntry of entry.kana) {
        const kanaText = kanaEntry.text

        if (kanaText.length === 4 && isValidHiraganaWord(kanaText)) {
          const meanings: string[] = []
          const partOfSpeech: string[] = []

          for (const sense of entry.sense) {
            for (const gloss of sense.gloss) {
              if (gloss.lang === 'eng' && gloss.text) {
                meanings.push(gloss.text)
              }
            }

            partOfSpeech.push(...sense.partOfSpeech)
          }

          if (meanings.length > 0) {
            const processedWord: ProcessedWord = {
              text: kanaText,
              common: kanaEntry.common,
              meanings: [...new Set(meanings)],
              partOfSpeech: [...new Set(partOfSpeech)],
              tags: kanaEntry.tags,
            }

            this.processedWords.set(kanaText, processedWord)
            this.fourLetterWords.push(kanaText)
          }
        }
      }
    }

    this.fourLetterWords = [...new Set(this.fourLetterWords)]
    this.isInitialized = true
  }

  isReady(): boolean {
    return this.isInitialized && this.fourLetterWords.length > 0
  }

  async getDailyWord(): Promise<string> {
    if (!this.isReady()) {
      throw new Error('WordService not initialized. Call initialize() first.')
    }

    const now = new Date()
    const start = new Date(now.getFullYear(), 0, 0)
    const diff = now.getTime() - start.getTime()
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))

    // Use the year as part of the seed to change the order each year
    const seed = dayOfYear + now.getFullYear() * 365

    const wordPool = this.fourLetterWords

    // Use a shuffle algorithm based on the seed
    const prime1 = 31
    const prime2 = 486187739
    const m = wordPool.length
    const index = Math.abs((seed * prime1 + prime2) % m)

    return wordPool[index]
  }

  async isValidWord(word: string): Promise<boolean> {
    if (!this.isReady()) {
      throw new Error('WordService not initialized. Call initialize() first.')
    }

    if (!isValidHiraganaWord(word) || word.length !== 4) {
      return false
    }

    return this.processedWords.has(word)
  }

  async getRandomWord(): Promise<string> {
    if (!this.isReady()) {
      throw new Error('WordService not initialized. Call initialize() first.')
    }

    const wordPool = this.fourLetterWords
    return wordPool[Math.floor(Math.random() * wordPool.length)]
  }

  getWordDetails(word: string): ProcessedWord | null {
    if (!this.isReady()) {
      return null
    }

    return this.processedWords.get(word) || null
  }
  getWordMeanings(word: string): string {
    const details = this.getWordDetails(word)
    if (!details) return ''

    const romaji = toRomaji(word).toLowerCase()
    const safeMeanings = details.meanings.filter(
      (meaning) => !meaning.toLowerCase().includes(romaji),
    )

    return safeMeanings.join('; ')
  }

  getAllWords(): string[] {
    return [...this.fourLetterWords]
  }

  getCommonWords(): string[] {
    return this.fourLetterWords.filter((word) => this.processedWords.get(word)?.common === true)
  }

  getWordsByPartOfSpeech(pos: string): string[] {
    return this.fourLetterWords.filter((word) => {
      const details = this.processedWords.get(word)
      return details?.partOfSpeech.some((p) => p.includes(pos))
    })
  }

  getStats(): {
    totalWords: number
    commonWords: number
    nounsCount: number
    verbsCount: number
    adjectivesCount: number
  } {
    if (!this.isReady()) {
      return {
        totalWords: 0,
        commonWords: 0,
        nounsCount: 0,
        verbsCount: 0,
        adjectivesCount: 0,
      }
    }

    const commonWords = this.getCommonWords().length
    const nouns = this.getWordsByPartOfSpeech('n').length
    const verbs = this.getWordsByPartOfSpeech('v').length
    const adjectives = this.getWordsByPartOfSpeech('adj').length

    return {
      totalWords: this.fourLetterWords.length,
      commonWords,
      nounsCount: nouns,
      verbsCount: verbs,
      adjectivesCount: adjectives,
    }
  }

  searchByPattern(pattern: string): string[] {
    if (!this.isReady()) {
      return []
    }

    const regex = new RegExp(pattern)
    return this.fourLetterWords.filter((word) => regex.test(word))
  }

  getWordHint(word: string): string | null {
    const hint = this.getWordMeanings(word)
    return hint
  }
}

export const wordService = new WordService()

export async function initializeWordService(jmdictPath: string): Promise<void> {
  try {
    const response = await fetch(jmdictPath)
    if (!response.ok) {
      throw new Error(`Failed to load JMDict: ${response.status} ${response.statusText}`)
    }

    const jmdictData: JMDictRoot = await response.json()

    await wordService.initialize(jmdictData)
  } catch (error) {
    throw error
  }
}
