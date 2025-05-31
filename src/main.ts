import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import { initializeWordService } from '@/services/wordService'

async function initializeJmdict() {
  try {
    const response = await fetch(
      'https://github.com/masaru9002/kanadle/raw/main/public/jmdict-large.json',
    )
    const data = await response.json()

    await initializeWordService(data)
  } catch (error) {
    console.error('Failed to initialize:', error)
  }
}

initializeJmdict()

createApp(App).mount('#app')
