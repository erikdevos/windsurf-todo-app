<template>
  <div class="min-vh-100">
    <div class="container py-5" style="max-width: 800px;">
      <!-- Header -->
      <div class="app-header">
        <h1 class="app-title display-4">Todo App</h1>
        <p class="app-subtitle">Stay organized and get things done</p>
      </div>

      <!-- Add Todo Form -->
      <AddTodo @add="addTodo" />

      <!-- Import/Export -->
      <ImportExport />

      <!-- Filters -->
      <TodoFilters
        v-if="todosStore.todos.length > 0"
        :current-filter="todosStore.filter"
        :active-todos-count="todosStore.activeTodosCount"
        :completed-todos-count="todosStore.completedTodosCount"
        :overdue-todos-count="todosStore.overdueTodosCount"
        :total-todos-count="todosStore.todos.length"
        @set-filter="setFilter"
        @clear-completed="clearCompleted"
      />

      <!-- Todo List -->
      <TodoList
        :todos="todosStore.filteredTodos"
        @toggle="toggleTodo"
        @delete="deleteTodo"
        @edit="editTodo"
        @reorder="reorderTodos"
      />

      <!-- Footer -->
      <div class="text-center mt-5">
        <small class="text-muted">
          Double-click to edit a todo • Built with Nuxt.js & Vue 3
        </small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Todo } from '~/stores/todos'

const todosStore = useTodosStore()

// Load todos from localStorage on client side
onMounted(() => {
  todosStore.loadFromLocalStorage()
})

// Todo actions
const addTodo = (text: string, description?: string, dueDate?: Date) => {
  todosStore.addTodo(text, description, dueDate)
}

const toggleTodo = (id: string) => {
  todosStore.toggleTodo(id)
}

const deleteTodo = (id: string) => {
  todosStore.deleteTodo(id)
}

const editTodo = (id: string, text: string, description?: string, dueDate?: Date) => {
  todosStore.editTodo(id, text, description, dueDate)
}

const reorderTodos = (newOrder: Todo[]) => {
  todosStore.reorderTodos(newOrder)
}

const setFilter = (filter: 'all' | 'active' | 'completed' | 'overdue') => {
  todosStore.setFilter(filter)
}

const clearCompleted = () => {
  todosStore.clearCompleted()
}

// SEO
useHead({
  title: 'Todo App - Stay Organized',
  meta: [
    { name: 'description', content: 'A simple and elegant todo application to help you stay organized and productive.' }
  ]
})
</script>
