import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import { initializeWordService } from '@/services/wordService'

async function initializeJmdict() {
  try {
    await initializeWordService(
      'https://cdn.jsdelivr.net/gh/masaru9002/kanadle@main/public/jmdict-large.json',
    )
  } catch (error) {
    console.error('Failed to initialize:', error)
  }
}

initializeJmdict()

createApp(App).mount('#app')
