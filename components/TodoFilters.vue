<template>
  <div class="card mb-4">
    <div class="card-body">
      <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-sm-between">
        <div class="d-flex align-items-center mb-3 mb-sm-0">
          <button
            v-for="filter in filters"
            :key="filter.value"
            @click="setFilter(filter.value)"
            class="filter-btn"
            :class="{ 'active': currentFilter === filter.value }"
          >
            {{ filter.label }}
            <span v-if="filter.count !== undefined" class="badge bg-secondary ms-1">
              {{ filter.count }}
            </span>
          </button>
        </div>
        
        <div class="d-flex align-items-center">
          <span class="text-muted me-3">{{ activeTodosCount }} active</span>
          <button
            v-if="completedTodosCount > 0"
            @click="clearCompleted"
            class="btn btn-outline-danger btn-sm"
          >
            <i class="bi bi-trash me-1"></i>
            Clear completed ({{ completedTodosCount }})
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentFilter: 'all' | 'active' | 'completed'
  activeTodosCount: number
  completedTodosCount: number
  totalTodosCount: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  setFilter: [filter: 'all' | 'active' | 'completed']
  clearCompleted: []
}>()

const filters = computed(() => [
  { 
    value: 'all' as const, 
    label: 'All', 
    count: props.totalTodosCount 
  },
  { 
    value: 'active' as const, 
    label: 'Active', 
    count: props.activeTodosCount 
  },
  { 
    value: 'completed' as const, 
    label: 'Completed', 
    count: props.completedTodosCount 
  }
])

const setFilter = (filter: 'all' | 'active' | 'completed') => {
  emit('setFilter', filter)
}

const clearCompleted = () => {
  emit('clearCompleted')
}
</script>
