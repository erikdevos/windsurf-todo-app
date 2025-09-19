<template>
  <button
    class="theme-toggle"
    @click="toggleTheme"
    :title="`Switch to ${isDark ? 'light' : 'dark'} mode`"
    :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
  >
    <i
      :class="isDark ? 'bi bi-sun-fill' : 'bi bi-moon-fill'"
    ></i>
  </button>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useColorMode } from '@vueuse/core'

// Use VueUse's useColorMode for automatic system detection and manual override
const colorMode = useColorMode({
  attribute: 'class',
  modes: {
    dark: 'dark-mode',
    light: ''
  },
  storageKey: 'theme-preference'
})

// Computed property to check if current mode is dark
const isDark = computed(() => colorMode.value === 'dark')

// Toggle function
const toggleTheme = () => {
  colorMode.value = isDark.value ? 'light' : 'dark'
}

// Watch for system preference changes and update accordingly
onMounted(() => {
  // Set initial mode based on system preference if no stored preference
  if (!process.client) return
  
  const stored = localStorage.getItem('theme-preference')
  if (!stored) {
    // No stored preference, use system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    colorMode.value = prefersDark ? 'dark' : 'light'
  }
  
  // Listen for system preference changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = (e: MediaQueryListEvent) => {
    // Only auto-switch if user hasn't manually set a preference
    const stored = localStorage.getItem('theme-preference')
    if (!stored) {
      colorMode.value = e.matches ? 'dark' : 'light'
    }
  }
  
  mediaQuery.addEventListener('change', handleChange)
  
  // Cleanup
  onUnmounted(() => {
    mediaQuery.removeEventListener('change', handleChange)
  })
})
</script>

<style scoped>
/* Component-specific styles are in main.css under .theme-toggle */
</style>
