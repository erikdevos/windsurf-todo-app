<template>
  <div class="card mb-4">
    <div class="card-body">
      <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-sm-between">
        <div class="mb-3 mb-sm-0">
          <h6 class="card-title mb-1">
            <i class="bi bi-cloud-arrow-up-down me-2"></i>
            Backup & Restore
          </h6>
          <small class="text-muted">Export your todos or import from a backup file</small>
        </div>
        
        <div class="d-flex gap-2">
          <button
            @click="exportTodos"
            class="btn btn-outline-primary btn-sm"
            :disabled="todosCount === 0"
          >
            <i class="bi bi-download me-1"></i>
            Export ({{ todosCount }})
          </button>
          
          <div class="position-relative">
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              @change="handleFileSelect"
              class="d-none"
            />
            <button
              @click="triggerFileInput"
              class="btn btn-outline-secondary btn-sm"
            >
              <i class="bi bi-upload me-1"></i>
              Import
            </button>
          </div>
        </div>
      </div>
      
      <!-- Status Messages -->
      <div v-if="statusMessage" class="mt-3">
        <div 
          class="alert alert-dismissible fade show"
          :class="statusType === 'success' ? 'alert-success' : 'alert-danger'"
          role="alert"
        >
          <i :class="statusType === 'success' ? 'bi bi-check-circle' : 'bi bi-exclamation-triangle'" class="me-2"></i>
          {{ statusMessage }}
          <button 
            type="button" 
            class="btn-close" 
            @click="clearStatus"
            aria-label="Close"
          ></button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const todosStore = useTodosStore()
const fileInput = ref<HTMLInputElement>()
const statusMessage = ref('')
const statusType = ref<'success' | 'error'>('success')

const todosCount = computed(() => todosStore.todos.length)

const exportTodos = () => {
  try {
    todosStore.exportTodos()
    showStatus('success', `Successfully exported ${todosCount.value} todos!`)
  } catch (error) {
    showStatus('error', 'Failed to export todos. Please try again.')
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  if (!file.name.endsWith('.json')) {
    showStatus('error', 'Please select a valid JSON file.')
    return
  }
  
  try {
    const result = await todosStore.importTodos(file)
    
    if (result.success) {
      showStatus('success', result.message)
    } else {
      showStatus('error', result.message)
    }
  } catch (error) {
    showStatus('error', 'An unexpected error occurred while importing.')
  }
  
  // Reset file input
  target.value = ''
}

const showStatus = (type: 'success' | 'error', message: string) => {
  statusType.value = type
  statusMessage.value = message
  
  // Auto-hide success messages after 5 seconds
  if (type === 'success') {
    setTimeout(() => {
      clearStatus()
    }, 5000)
  }
}

const clearStatus = () => {
  statusMessage.value = ''
}
</script>
