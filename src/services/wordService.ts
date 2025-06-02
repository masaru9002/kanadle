/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ProcessedWord } from '@/types'
import { isValidHiraganaWord } from '@/utils/validation'
import { toRomaji } from 'wanakana'
import axios, { type AxiosInstance, AxiosError } from 'axios'

interface DailyWordResponse {
  word: string
  meanings: string[]
  common: boolean
}

interface ValidateWordResponse {
  valid: boolean
  meanings?: string[]
  common?: boolean
}

type WordDetailsResponse = ProcessedWord

interface StatsResponse {
  totalWords: number
  commonWords: number
  initialized: boolean
  note?: string
}

class WordService {
  private client: AxiosInstance
  private cache: Map<string, ProcessedWord> = new Map()
  private isInitialized = false
  private dailyWordResponse: DailyWordResponse | null = null

  constructor(baseUrl: string = 'https://kanadleapi.vercel.app') {
    const cleanBaseUrl = baseUrl.replace(/\/$/, '')

    this.client = axios.create({
      baseURL: cleanBaseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    })

    this.client.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error),
    )

    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => Promise.reject(error),
    )
  }

  private handleError(error: AxiosError, context: string): Error {
    if (error.response) {
      const status = error.response.status
      const message = error.response.data || error.response.statusText
      return new Error(`${context}: HTTP ${status} - ${message}`)
    } else if (error.request) {
      return new Error(`${context}: No response from server`)
    } else {
      return new Error(`${context}: ${error.message}`)
    }
  }

  async initialize(): Promise<void> {
    try {
      const response = await this.client.get<{ status: string; initialized: boolean }>(
        '/api/health',
      )

      if (response.data.status === 'OK' && response.data.initialized) {
        this.isInitialized = true
      } else {
        throw new Error('Backend not properly initialized')
      }
    } catch (error) {
      const err = this.handleError(error as AxiosError, 'Failed to initialize WordService')
      throw err
    }
  }

  isReady(): boolean {
    return this.isInitialized
  }

  async getDailyWord(): Promise<string> {
    if (!this.isReady()) {
      throw new Error('WordService not initialized')
    }

    try {
      const response = await this.client.get<DailyWordResponse>('/api/daily-word')
      this.dailyWordResponse = response.data

      this.cache.set(response.data.word, {
        text: response.data.word,
        meanings: response.data.meanings,
        common: response.data.common,
        partOfSpeech: [],
        tags: [],
      })

      console.log('the answers in the console lol, but pls dont look at it thanks')
      return response.data.word
    } catch (error) {
      throw this.handleError(error as AxiosError, 'Failed to get daily word')
    }
  }

  async isValidWord(word: string): Promise<boolean> {
    if (!this.isReady()) {
      throw new Error('WordService not initialized')
    }

    if (!isValidHiraganaWord(word) || word.length !== 4) {
      return false
    }

    try {
      const response = await this.client.post<ValidateWordResponse>('/api/validate-word', {
        word,
      })

      if (response.data.valid && response.data.meanings) {
        this.cache.set(word, {
          text: word,
          meanings: response.data.meanings,
          common: response.data.common || false,
          partOfSpeech: [],
          tags: [],
        })
      }

      return response.data.valid
    } catch (error) {
      return false
    }
  }

  async getRandomWord(): Promise<string> {
    if (!this.isReady()) {
      throw new Error('WordService not initialized')
    }

    try {
      const response = await this.client.get<DailyWordResponse>('/api/random-word')

      this.cache.set(response.data.word, {
        text: response.data.word,
        meanings: response.data.meanings,
        common: response.data.common,
        partOfSpeech: [],
        tags: [],
      })

      return response.data.word
    } catch (error) {
      throw this.handleError(error as AxiosError, 'Failed to get random word')
    }
  }

  async getWordDetails(word: string): Promise<ProcessedWord | null> {
    if (!this.isReady()) {
      return null
    }

    if (this.cache.has(word)) {
      return this.cache.get(word)!
    }

    if (this.dailyWordResponse && this.dailyWordResponse.word === word) {
      const processedWord: ProcessedWord = {
        text: word,
        meanings: this.dailyWordResponse.meanings,
        common: this.dailyWordResponse.common,
        partOfSpeech: [],
        tags: [],
      }
      this.cache.set(word, processedWord)
      return processedWord
    }

    try {
      const response = await this.client.get<WordDetailsResponse>(
        `/api/word/${encodeURIComponent(word)}`,
      )

      this.cache.set(word, response.data)
      return response.data
    } catch (error) {
      return null
    }
  }

  async getWordMeanings(word: string): Promise<string> {
    const details = await this.getWordDetails(word)
    if (!details) return ''

    const romaji = toRomaji(word).toLowerCase()
    const safeMeanings = details.meanings.filter(
      (meaning) => !meaning.toLowerCase().includes(romaji),
    )

    return safeMeanings.join('; ')
  }

  async getAllWords(): Promise<string[]> {
    return []
  }

  async getCommonWords(): Promise<string[]> {
    return []
  }

  async getWordsByPartOfSpeech(pos: string): Promise<string[]> {
    return []
  }

  async getStats(): Promise<{
    totalWords: number
    commonWords: number
    nounsCount: number
    verbsCount: number
    adjectivesCount: number
  }> {
    if (!this.isReady()) {
      return {
        totalWords: 0,
        commonWords: 0,
        nounsCount: 0,
        verbsCount: 0,
        adjectivesCount: 0,
      }
    }

    try {
      const response = await this.client.get<StatsResponse>('/api/stats')

      return {
        totalWords: response.data.totalWords,
        commonWords: response.data.commonWords,
        nounsCount: 0,
        verbsCount: 0,
        adjectivesCount: 0,
      }
    } catch (error) {
      return {
        totalWords: 0,
        commonWords: 0,
        nounsCount: 0,
        verbsCount: 0,
        adjectivesCount: 0,
      }
    }
  }

  async searchByPattern(pattern: string): Promise<string[]> {
    return []
  }

  async getWordHint(word: string): Promise<string | null> {
    const hint = await this.getWordMeanings(word)
    return hint || null
  }

  clearCache(): void {
    this.cache.clear()
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get<{ status: string; initialized: boolean }>(
        '/api/health',
      )
      return response.data.status === 'OK' && response.data.initialized
    } catch (error) {
      return false
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.client.get('/api/health')
      return {
        success: true,
        message: `Connected successfully! Status: ${response.data.status}, Initialized: ${response.data.initialized}`,
      }
    } catch (error) {
      const axiosError = error as AxiosError
      if (axiosError.code === 'ECONNREFUSED') {
        return {
          success: false,
          message: 'Connection refused',
        }
      } else if (axiosError.response) {
        return {
          success: false,
          message: `Server responded with error: ${axiosError.response.status} ${axiosError.response.statusText}`,
        }
      } else {
        return {
          success: false,
          message: `Network error: ${axiosError.message}`,
        }
      }
    }
  }
}

export const wordService = new WordService()

export async function initializeWordService(): Promise<void> {
  try {
    await wordService.initialize()
  } catch (error) {
    throw error
  }
}

export async function testWordServiceConnection(): Promise<void> {
  const result = await wordService.testConnection()
  if (!result.success) {
    throw new Error(result.message)
  }
}
