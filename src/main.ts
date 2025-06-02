import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

import { initializeWordService } from '@/services/wordService'

async function initializeJmdict() {
  try {
    await initializeWordService()
  } catch (error) {
    console.error('Failed to initialize:', error)
  }
}

initializeJmdict()

createApp(App).mount('#app')
