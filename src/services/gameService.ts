import type { GameState, LetterState, GameStats } from '@/types'
import { isValidHiragana } from '@/utils/validation'
import { wordService } from './wordService'

class GameService {
  private gameState: GameState | null = null
  private gameDate: string | null = null
  private readonly STORAGE_KEY = 'kanadle_game_state'
  private readonly STATS_KEY = 'kanadle_statistics'

  private getEmptyStats(): GameStats {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      maxStreak: 0,
      winPercentage: 0,
      lastPlayedDate: null,
    }
  }

  private loadStatsFromStorage(): GameStats {
    try {
      const stats = localStorage.getItem(this.STATS_KEY)
      return stats ? JSON.parse(stats) : this.getEmptyStats()
    } catch {
      return this.getEmptyStats()
    }
  }

  private saveStatsToStorage(stats: GameStats): void {
    localStorage.setItem(this.STATS_KEY, JSON.stringify(stats))
  }

  private updateStats(won: boolean): void {
    const stats = this.loadStatsFromStorage()
    const today = new Date().toDateString()

    if (stats.lastPlayedDate) {
      const lastPlayed = new Date(stats.lastPlayedDate)
      const isNextDay = new Date(today).getDate() - lastPlayed.getDate() === 1
      if (!isNextDay) {
        stats.currentStreak = won ? 1 : 0
      } else if (won) {
        stats.currentStreak++
      } else {
        stats.currentStreak = 0
      }
    } else {
      stats.currentStreak = won ? 1 : 0
    }

    stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak)
    stats.gamesPlayed++
    if (won) stats.gamesWon++
    stats.winPercentage = Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    stats.lastPlayedDate = today

    this.saveStatsToStorage(stats)
  }

  isReady(): boolean {
    return wordService.isReady()
  }

  async createInitialState(targetWord?: string): Promise<GameState> {
    if (!this.isReady()) {
      throw new Error('GameService not ready. WordService must be initialized first.')
    }

    const word = targetWord || (await wordService.getDailyWord())

    return {
      board: Array(12)
        .fill(null)
        .map(() => Array(4).fill('')),
      currentRow: 0,
      currentCol: 0,
      gameStatus: 'playing',
      targetWord: word,
      guesses: [],
      letterStates: {},
    }
  }

  async createDailyGame(): Promise<GameState> {
    if (!this.isReady()) {
      throw new Error('GameService not ready. WordService must be initialized first.')
    }

    const dailyWord = await wordService.getDailyWord()
    return this.createInitialState(dailyWord)
  }

  async createRandomGame(): Promise<GameState> {
    if (!this.isReady()) {
      throw new Error('GameService not ready. WordService must be initialized first.')
    }

    const randomWord = await wordService.getRandomWord()
    return this.createInitialState(randomWord)
  }

  async loadGame(): Promise<GameState | null> {
    try {
      const savedState = localStorage.getItem(this.STORAGE_KEY)
      if (savedState) {
        const parsed = JSON.parse(savedState)
        const savedTargetWord = parsed.state.targetWord

        const currentDailyWord = await wordService.getDailyWord()

        if (savedTargetWord === currentDailyWord) {
          this.gameState = parsed.state
          this.gameDate = parsed.date
          return { ...(this.gameState as GameState) }
        } else {
          this.clearGame()
          return null
        }
      }
    } catch (error) {
      console.error('Failed to load game state from localStorage', error)
    }

    this.gameState = null
    this.gameDate = null
    return null
  }

  saveGame(state: GameState): void {
    this.gameState = { ...state }
    this.gameDate = new Date().toDateString()

    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify({
        state: this.gameState,
        date: this.gameDate,
      }),
    )
  }

  clearGame(): void {
    this.gameState = null
    this.gameDate = null
    localStorage.removeItem(this.STORAGE_KEY)
  }

  canAddLetter(state: GameState): boolean {
    return state.gameStatus === 'playing' && state.currentCol < 4 && state.currentRow < 12
  }

  canRemoveLetter(state: GameState): boolean {
    return state.gameStatus === 'playing' && state.currentCol > 0
  }

  canSubmitGuess(state: GameState): boolean {
    return state.gameStatus === 'playing' && state.currentCol === 4 && state.currentRow < 12
  }

  addLetter(state: GameState, letter: string): GameState {
    if (!this.canAddLetter(state) || !isValidHiragana(letter)) {
      return state
    }

    const newBoard = state.board.map((row) => [...row])
    newBoard[state.currentRow][state.currentCol] = letter

    const newState = {
      ...state,
      board: newBoard,
      currentCol: state.currentCol + 1,
    }

    this.saveGame(newState)
    return newState
  }

  removeLetter(state: GameState): GameState {
    if (!this.canRemoveLetter(state)) {
      return state
    }

    const newBoard = state.board.map((row) => [...row])
    newBoard[state.currentRow][state.currentCol - 1] = ''

    const newState = {
      ...state,
      board: newBoard,
      currentCol: state.currentCol - 1,
    }

    this.saveGame(newState)
    return newState
  }

  async submitGuess(state: GameState): Promise<GameState> {
    if (!this.canSubmitGuess(state)) {
      return state
    }

    const guess = state.board[state.currentRow].join('')

    const isValid = await wordService.isValidWord(guess)
    if (!isValid) {
      return { ...state, error: 'Invalid word' } as GameState & { error: string }
    }

    const newGuesses = [...state.guesses, guess]
    const newLetterStates = { ...state.letterStates }
    this.updateLetterStates(guess, state.targetWord, newLetterStates)

    const won = guess === state.targetWord
    const lost = !won && state.currentRow === 11

    const newGameStatus = won ? 'won' : lost ? 'lost' : 'playing'

    const newState: GameState = {
      ...state,
      guesses: newGuesses,
      letterStates: newLetterStates,
      currentRow: state.currentRow + 1,
      currentCol: 0,
      gameStatus: newGameStatus,
    }

    if (newGameStatus === 'won' || newGameStatus === 'lost') {
      this.updateStats(newGameStatus === 'won')
    }

    this.saveGame(newState)

    return newState
  }

  private updateLetterStates(
    guess: string,
    target: string,
    letterStates: Record<string, LetterState>,
  ): void {
    const targetArray = Array.from(target)
    const guessArray = Array.from(guess)

    const targetLetterCounts = new Map<string, number>()

    const exactMatches = new Array(4).fill(false)
    for (let i = 0; i < 4; i++) {
      const letter = targetArray[i]
      targetLetterCounts.set(letter, (targetLetterCounts.get(letter) || 0) + 1)
    }

    for (let i = 0; i < 4; i++) {
      const letter = guessArray[i]
      if (letter === targetArray[i]) {
        letterStates[letter] = 'correct'
        exactMatches[i] = true
        targetLetterCounts.set(letter, targetLetterCounts.get(letter)! - 1)
      }
    }

    for (let i = 0; i < 4; i++) {
      if (exactMatches[i]) continue

      const letter = guessArray[i]
      const availableCount = targetLetterCounts.get(letter) || 0

      if (availableCount > 0) {
        letterStates[letter] = letterStates[letter] === 'correct' ? 'correct' : 'present'
        targetLetterCounts.set(letter, availableCount - 1)
      } else {
        if (!letterStates[letter]) {
          letterStates[letter] = 'absent'
        }
      }
    }
  }

  getLetterState(guess: string, target: string, position: number): LetterState {
    const guessArray = Array.from(guess)
    const targetArray = Array.from(target)

    const targetLetterCounts = new Map<string, number>()

    for (let i = 0; i < 4; i++) {
      const letter = targetArray[i]
      targetLetterCounts.set(letter, (targetLetterCounts.get(letter) || 0) + 1)
    }

    for (let i = 0; i < 4; i++) {
      const letter = guessArray[i]
      if (letter === targetArray[i]) {
        targetLetterCounts.set(letter, targetLetterCounts.get(letter)! - 1)
      }
    }

    const currentLetter = guessArray[position]

    if (currentLetter === targetArray[position]) {
      return 'correct'
    }

    let availableCount = targetLetterCounts.get(currentLetter) || 0

    for (let i = 0; i < position; i++) {
      if (guessArray[i] === currentLetter && guessArray[i] !== targetArray[i]) {
        availableCount--
      }
    }

    if (availableCount > 0) {
      return 'present'
    }

    return 'absent'
  }

  async getWordMeanings(word: string): Promise<string> {
    return await wordService.getWordMeanings(word)
  }

  async getWordHint(word: string): Promise<string | null> {
    return await wordService.getWordHint(word)
  }

  getWordDetails(word: string) {
    return wordService.getWordDetails(word)
  }

  getGameStats(): GameStats {
    return this.loadStatsFromStorage()
  }

  getWordStats() {
    return wordService.getStats()
  }
}

export const gameService = new GameService()
