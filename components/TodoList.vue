<template>
  <div>
    <div v-if="todos.length === 0" class="empty-state">
      <i class="bi bi-clipboard-check"></i>
      <h3 class="h5 mb-2">No todos yet</h3>
      <p class="mb-0">Add your first todo above to get started!</p>
    </div>
    
    <div v-else ref="todoContainer" class="sortable-container">
      <TodoItem
        v-for="todo in todos"
        :key="todo.id"
        :todo="todo"
        @toggle="$emit('toggle', $event)"
        @delete="$emit('delete', $event)"
        @edit="$emit('edit', $event, arguments[1])"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Sortable from 'sortablejs'
import type { Todo } from '~/stores/todos'

interface Props {
  todos: Todo[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  toggle: [id: string]
  delete: [id: string]
  edit: [id: string, text: string]
  reorder: [todos: Todo[]]
}>()

const todoContainer = ref<HTMLElement>()

// Initialize sortable functionality
onMounted(() => {
  if (todoContainer.value) {
    Sortable.create(todoContainer.value, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      chosenClass: 'sortable-chosen',
      dragClass: 'sortable-drag',
      handle: '.drag-handle',
      forceFallback: true,
      fallbackClass: 'sortable-fallback',
      onEnd: (evt) => {
        if (evt.oldIndex !== undefined && evt.newIndex !== undefined && evt.oldIndex !== evt.newIndex) {
          // Create new array with reordered todos
          const newTodos = [...props.todos]
          const [movedItem] = newTodos.splice(evt.oldIndex, 1)
          newTodos.splice(evt.newIndex, 0, movedItem)
          
          emit('reorder', newTodos)
        }
      }
    })
  }
})</script>

<style scoped>
.todo-enter-active,
.todo-leave-active {
  transition: all 0.3s ease;
}

.todo-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.todo-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

.todo-move {
  transition: transform 0.3s ease;
}

/* Sortable styles */
.sortable-ghost {
  opacity: 0.4;
  background: #f8f9fa;
  border: 2px dashed #007bff;
  border-radius: 8px;
  transform: rotate(2deg);
}

.sortable-chosen {
  opacity: 0.8;
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  border: 1px solid #007bff;
  border-radius: 8px;
}

.sortable-drag {
  opacity: 0.9;
  transform: rotate(-1deg);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.sortable-fallback {
  opacity: 0.8;
  background: #ffffff;
  border: 2px solid #007bff;
  border-radius: 8px;
  box-shadow: 0 8px 25px rgba(0, 123, 255, 0.2);
  transform: rotate(2deg) scale(1.03 );
}

/* Drop zone indicator */
.sortable-container :global(.todo-item:hover) {
  background-color: rgba(0, 123, 255, 0.05);
  border-radius: 8px;
  transition: background-color 0.2s ease;
}
</style>
