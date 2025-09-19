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
        <div class="d-flex flex-column gap-3">
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
              <DatePicker v-model="dueDateObj" />
            </div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <label class="form-check-label" style="min-width: 60px;">
              Priority:
            </label>
            <select 
              v-model="priority" 
              class="form-select form-select-sm"
              style="max-width: 200px;"
            >
              <option value="high">
                <i class="bi bi-exclamation-triangle-fill text-danger me-1"></i> High
              </option>
              <option value="medium">
                <i class="bi bi-exclamation-circle-fill text-warning me-1"></i> Medium
              </option>
              <option value="low">
                <i class="bi bi-info-circle-fill text-info me-1"></i> Low
              </option>
            </select>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  add: [text: string, description?: string, dueDate?: Date, priority?: Priority]
}>()

const newTodoText = ref('')
const description = ref('')
const isAdding = ref(false)
const hasDueDate = ref(false)
const dueDateObj = ref<Date | null>(null)
const priority = ref<Priority>('medium')

const addTodo = async () => {
  if (!newTodoText.value.trim()) return
  
  isAdding.value = true
  
  try {
    const finalDueDate = hasDueDate.value && dueDateObj.value 
      ? dueDateObj.value 
      : undefined
    
    emit('add', newTodoText.value, description.value, finalDueDate, priority.value)
    newTodoText.value = ''
    description.value = ''
    hasDueDate.value = false
    dueDateObj.value = null
    priority.value = 'medium'
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
