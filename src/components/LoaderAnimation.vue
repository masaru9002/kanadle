<template>
  <div class="loader-container">
    <div class="loader"></div>
    <div v-if="message" class="loader-message text-gray-600 dark:text-gray-400">
      {{ message }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message?: string
}>()
</script>

<style scoped>
.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loader-message {
  font-size: 0.875rem;
}

.loader {
  width: 40px;
  aspect-ratio: 1;
  animation:
    l3-1 2s infinite linear,
    l3-2 3s infinite steps(1) -0.5s;
}

@keyframes l3-1 {
  0% {
    transform: perspective(150px) rotateX(0deg) rotateY(0deg);
  }
  50% {
    transform: perspective(150px) rotateX(180deg) rotateY(0deg);
  }
  100% {
    transform: perspective(150px) rotateX(180deg) rotateY(180deg);
  }
}

@keyframes l3-2 {
  0% {
    background: var(--color-absent);
  }
  33% {
    background: var(--color-present);
  }
  66% {
    background: var(--color-correct);
  }
}
</style>
