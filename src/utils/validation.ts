export function isValidHiragana(char: string): boolean {
  // Hiragana Unicode range: U+3040-U+309F
  const code = char.charCodeAt(0)
  return code >= 0x3040 && code <= 0x309f
}

export function isValidHiraganaWord(word: string): boolean {
  if (word.length !== 4) return false
  return Array.from(word).every((char) => isValidHiragana(char))
}

export function normalizeHiragana(text: string): string {
  // Remove any non-hiragana characters and convert to lowercase equivalent
  return text.replace(/[^\u3040-\u309F]/g, '')
}
