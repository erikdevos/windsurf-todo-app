<template>
  <div class="todo-item" :class="{ 'todo-completed': todo.completed }">
    <div class="d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center flex-grow-1">
        <input
          type="checkbox"
          :checked="todo.completed"
          @change="toggleTodo"
          class="form-check-input me-3"
        />
        <div class="flex-grow-1" v-if="!isEditing">
          <p 
            class="todo-text mb-1"
            :class="{ 'todo-completed': todo.completed }"
            @dblclick="startEditing"
          >
            {{ todo.text }}
          </p>
          <p 
            v-if="todo.description" 
            class="todo-description mb-2 text-muted"
            :class="{ 'todo-completed': todo.completed }"
            @dblclick="startEditing"
          >
            {{ todo.description }}
          </p>
          <div class="d-flex align-items-center gap-2">
            <small class="text-muted">
              Created: {{ formatDate(todo.createdAt) }}
            </small>
            <span v-if="todo.dueDate" class="badge" :class="dueDateBadgeClass">
              <i class="bi bi-calendar-event me-1"></i>
              Due: {{ formatDueDate(todo.dueDate) }}
            </span>
          </div>
        </div>
        <div class="flex-grow-1" v-else>
          <div class="mb-2">
            <input
              ref="editInput"
              v-model="editText"
              @blur="saveEdit"
              @keyup.enter="saveEdit"
              @keyup.escape="cancelEdit"
              class="form-control"
              placeholder="Todo text"
            />
          </div>
          <div class="mb-2">
            <textarea
              v-model="editDescription"
              class="form-control"
              placeholder="Description (optional)"
              rows="2"
            ></textarea>
          </div>
          <div class="d-flex align-items-center gap-2">
            <div class="form-check">
              <input
                v-model="hasEditDueDate"
                class="form-check-input"
                type="checkbox"
                :id="`editDueDate-${todo.id}`"
              />
              <label class="form-check-label" :for="`editDueDate-${todo.id}`">
                <small>Due date</small>
              </label>
            </div>
            <input
              v-if="hasEditDueDate"
              v-model="editDueDate"
              type="date"
              class="form-control form-control-sm"
              style="max-width: 150px;"
            />
          </div>
        </div>
      </div>
      <div class="d-flex align-items-center">
        <button
          @click="startEditing"
          class="btn-icon me-2"
          title="Edit todo"
        >
          <i class="bi bi-pencil"></i>
        </button>
        <button
          @click="deleteTodo"
          class="btn-icon btn-delete"
          title="Delete todo"
        >
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '~/stores/todos'

interface Props {
  todo: Todo
}

const props = defineProps<Props>()
const emit = defineEmits<{
  toggle: [id: string]
  delete: [id: string]
  edit: [id: string, text: string, description?: string, dueDate?: Date]
}>()

const isEditing = ref(false)
const editText = ref('')
const editDescription = ref('')
const editInput = ref<HTMLInputElement>()
const hasEditDueDate = ref(false)
const editDueDate = ref('')

const toggleTodo = () => {
  emit('toggle', props.todo.id)
}

const deleteTodo = () => {
  emit('delete', props.todo.id)
}

const startEditing = () => {
  if (props.todo.completed) return
  isEditing.value = true
  editText.value = props.todo.text
  editDescription.value = props.todo.description || ''
  hasEditDueDate.value = !!props.todo.dueDate
  editDueDate.value = props.todo.dueDate 
    ? props.todo.dueDate.toISOString().split('T')[0] 
    : ''
  nextTick(() => {
    editInput.value?.focus()
    editInput.value?.select()
  })
}

const saveEdit = () => {
  if (editText.value.trim()) {
    const dueDateObj = hasEditDueDate.value && editDueDate.value 
      ? new Date(editDueDate.value + 'T00:00:00') 
      : undefined
    emit('edit', props.todo.id, editText.value, editDescription.value, dueDateObj)
  }
  isEditing.value = false
}

const cancelEdit = () => {
  isEditing.value = false
  editText.value = props.todo.text
  editDescription.value = props.todo.description || ''
  hasEditDueDate.value = !!props.todo.dueDate
  editDueDate.value = props.todo.dueDate 
    ? props.todo.dueDate.toISOString().split('T')[0] 
    : ''
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const formatDueDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

const dueDateBadgeClass = computed(() => {
  if (!props.todo.dueDate) return ''
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const dueDate = new Date(props.todo.dueDate)
  dueDate.setHours(0, 0, 0, 0)
  
  const diffTime = dueDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return 'bg-danger' // Overdue
  } else if (diffDays === 0) {
    return 'bg-warning text-dark' // Due today
  } else if (diffDays <= 3) {
    return 'bg-warning text-dark' // Due soon
  } else {
    return 'bg-secondary' // Future
  }
})
</script>
