export type LetterState = 'correct' | 'present' | 'absent' | 'empty' | 'filled'

export interface GameStats {
  gamesPlayed: number
  gamesWon: number
  currentStreak: number
  maxStreak: number
  winPercentage: number
  lastPlayedDate: string | null
}

export interface GameState {
  board: string[][]
  currentRow: number
  currentCol: number
  gameStatus: 'playing' | 'won' | 'lost'
  targetWord: string
  guesses: string[]
  letterStates: Record<string, LetterState>
}

export interface WordCheckResult {
  isValid: boolean
  exists?: boolean
}

export interface JishoResponse {
  data: Array<{
    japanese: Array<{
      word?: string
      reading: string
    }>
    is_common?: boolean
  }>
}

export interface JMDictKana {
  common: boolean
  text: string
  tags: string[]
  appliesToKanji: string[]
}

export interface JMDictGloss {
  lang: string
  gender: string | null
  type: string | null
  text: string
}

export interface JMDictSense {
  partOfSpeech: string[]
  appliesToKanji: string[]
  appliesToKana: string[]
  related: string[]
  antonym: string[]
  field: string[]
  dialect: string[]
  misc: string[]
  info: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  languageSource: any[]
  gloss: JMDictGloss[]
}

export interface JMDictEntry {
  id: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  kanji: any[]
  kana: JMDictKana[]
  sense: JMDictSense[]
}

export interface JMDictRoot {
  words: JMDictEntry[]
}

export interface ProcessedWord {
  text: string
  common: boolean
  meanings: string[]
  partOfSpeech: string[]
  tags: string[]
}
