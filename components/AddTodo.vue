<template>
  <div class="card mb-4">
    <div class="card-body">
      <form @submit.prevent="addTodo">
        <div class="d-flex gap-3 mb-3">
          <input
            v-model="newTodoText"
            type="text"
            placeholder="What needs to be done?"
            class="form-control"
            :disabled="isAdding"
          />
          <button
            type="submit"
            :disabled="!newTodoText.trim() || isAdding"
            class="btn btn-primary"
          >
            <span v-if="!isAdding">
              <i class="bi bi-plus-circle me-1"></i>
              Add Todo
            </span>
            <span v-else>
              <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Adding...
            </span>
          </button>
        </div>
        <div class="mb-3">
          <textarea
            v-model="description"
            class="form-control"
            placeholder="Add a description (optional)"
            rows="2"
            :disabled="isAdding"
          ></textarea>
        </div>
        <div class="d-flex align-items-center gap-3">
          <div class="form-check">
            <input
              v-model="hasDueDate"
              class="form-check-input"
              type="checkbox"
              id="hasDueDate"
            />
            <label class="form-check-label" for="hasDueDate">
              Set due date
            </label>
          </div>
          <div v-if="hasDueDate" class="flex-grow-1">
            <input
              v-model="dueDate"
              type="date"
              class="form-control"
              :min="today"
            />
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  add: [text: string, description?: string, dueDate?: Date]
}>()

const newTodoText = ref('')
const description = ref('')
const isAdding = ref(false)
const hasDueDate = ref(false)
const dueDate = ref('')

// Get today's date in YYYY-MM-DD format for min attribute
const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const addTodo = async () => {
  if (!newTodoText.value.trim()) return
  
  isAdding.value = true
  
  try {
    const dueDateObj = hasDueDate.value && dueDate.value 
      ? new Date(dueDate.value + 'T00:00:00') 
      : undefined
    
    emit('add', newTodoText.value, description.value, dueDateObj)
    newTodoText.value = ''
    description.value = ''
    hasDueDate.value = false
    dueDate.value = ''
  } finally {
    isAdding.value = false
  }
}

// Focus input on mount
onMounted(() => {
  const input = document.querySelector('input[type="text"]') as HTMLInputElement
  input?.focus()
})
</script>
