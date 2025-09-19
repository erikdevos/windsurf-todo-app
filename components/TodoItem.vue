<template>
  <div class="todo-item" :class="{ 'todo-completed': todo.completed }">
    <div class="d-flex align-items-center">
      <div class="drag-handle me-2" title="Drag to reorder">
        <i class="bi bi-grip-vertical text-muted"></i>
      </div>
      <input
        type="checkbox"
        :checked="todo.completed"
        @change="toggleTodo"
        class="form-check-input me-3"
      />
      <div class="flex-grow-1" v-if="!isEditing">
        <div class="d-flex align-items-center gap-2">
          <span 
            v-if="todo.priority === 'high'" 
            class="badge bg-danger-subtle text-danger"
            title="High priority"
          >
            <i class="bi bi-exclamation-triangle-fill me-1"></i> High
          </span>
          <span 
            v-else-if="todo.priority === 'medium'" 
            class="badge bg-warning-subtle text-warning"
            title="Medium priority"
          >
            <i class="bi bi-exclamation-circle-fill me-1"></i> Medium
          </span>
          <span 
            v-else-if="todo.priority === 'low'" 
            class="badge bg-info-subtle text-info"
            title="Low priority"
          >
            <i class="bi bi-info-circle-fill me-1"></i> Low
          </span>
          <p 
            class="todo-text mb-1"
            :class="{ 'todo-completed': todo.completed }"
            @dblclick="startEditing"
          >
            {{ todo.text }}
          </p>
        </div>
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
          <div class="d-flex flex-column gap-2">
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
              <div v-if="hasEditDueDate" style="max-width: 300px;">
                <DatePicker v-model="editDueDateObj" />
              </div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <label class="form-check-label" style="min-width: 60px;">
                <small>Priority:</small>
              </label>
              <select 
                v-model="editPriority" 
                class="form-select form-select-sm"
                style="max-width: 140px;"
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
import { computed, nextTick, ref, watch } from 'vue'
import type { Todo, Priority } from '~/stores/todos'

interface Props {
  todo: Todo
}

const props = defineProps<Props>()
const emit = defineEmits<{
  toggle: [id: string]
  delete: [id: string]
  edit: [id: string, text: string, description?: string, dueDate?: Date, priority?: Priority]
}>()

const isEditing = ref(false)
const editText = ref('')
const editDescription = ref('')
const editInput = ref<HTMLInputElement>()
const hasEditDueDate = ref(false)
const editDueDateObj = ref<Date | null>(null)
const editPriority = ref<Priority>('medium')

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
  editDueDateObj.value = props.todo.dueDate ? new Date(props.todo.dueDate) : null
  hasEditDueDate.value = !!props.todo.dueDate
  editPriority.value = props.todo.priority || 'medium'
  
  nextTick(() => {
    const input = editInput.value as HTMLInputElement | null
    input?.focus()
  })
}

const saveEdit = () => {
  if (editText.value.trim()) {
    emit('edit', 
      props.todo.id, 
      editText.value, 
      editDescription.value || undefined, 
      hasEditDueDate.value ? editDueDateObj.value || undefined : undefined,
      editPriority.value
    )
    isEditing.value = false
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editText.value = props.todo.text
  editDescription.value = props.todo.description || ''
  hasEditDueDate.value = !!props.todo.dueDate
  editDueDateObj.value = props.todo.dueDate ? new Date(props.todo.dueDate) : null
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
