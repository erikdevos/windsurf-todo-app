<template>
  <div>
    <div v-if="todos.length === 0" class="empty-state">
      <i class="bi bi-clipboard-check"></i>
      <h3 class="h5 mb-2">No todos yet</h3>
      <p class="mb-0">Add your first todo above to get started!</p>
    </div>
    
    <div v-else>
      <TransitionGroup name="todo" tag="div">
        <TodoItem
          v-for="todo in todos"
          :key="todo.id"
          :todo="todo"
          @toggle="$emit('toggle', $event)"
          @delete="$emit('delete', $event)"
          @edit="$emit('edit', $event, arguments[1])"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '~/stores/todos'

interface Props {
  todos: Todo[]
}

defineProps<Props>()
defineEmits<{
  toggle: [id: string]
  delete: [id: string]
  edit: [id: string, text: string]
}>()
</script>

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
</style>
