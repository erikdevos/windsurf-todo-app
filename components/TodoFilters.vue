<template>
  <div class="card mb-4">
    <div class="card-body">
      <!-- Search Input -->
      <div class="mb-3">
        <div class="input-group">
          <span class="input-group-text">
            <i class="bi bi-search"></i>
          </span>
          <input
            v-model="searchQuery"
            @input="handleSearch"
            type="search"
            class="form-control"
            placeholder="Search todos..."
            aria-label="Search todos"
          />
          <button 
            v-if="searchQuery" 
            @click="clearSearch"
            class="btn btn-outline-secondary" 
            type="button"
            title="Clear search"
          >
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>
      
      <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-sm-between">
        <div class="d-flex align-items-center mb-3 mb-sm-0">
          <div class="d-flex flex-wrap gap-1">
            <div v-for="filter in filters" :key="filter.value" class="d-flex">
              <button
                @click="setFilter(filter.value)"
                class="filter-btn"
                :class="[
                  { 'active': currentFilter === filter.value },
                  filter.class
                ]"
                :data-filter="filter.value"
                :title="filter.label"
              >
                <i v-if="filter.icon" :class="['bi', filter.icon, filter.class]"></i>
                <span>{{ filter.label }}</span>
                <span v-if="filter.count !== undefined" class="badge">
                  {{ filter.count }}
                </span>
              </button>
            </div>
          </div>
        </div>
        
        <div class="d-flex align-items-center">
          <span class="text-muted me-3">{{ activeTodosCount }} todo(s)</span>
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
type FilterType = 'all' | 'active' | 'completed' | 'overdue' | 'high-priority' | 'medium-priority' | 'low-priority'

interface Props {
  currentFilter: FilterType
  activeTodosCount: number
  completedTodosCount: number
  totalTodosCount: number
  overdueTodosCount: number
  highPriorityCount: number
  mediumPriorityCount: number
  lowPriorityCount: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  setFilter: [filter: FilterType]
  clearCompleted: []
  search: [query: string]
}>()

const searchQuery = ref('')

const handleSearch = () => {
  emit('search', searchQuery.value.trim())
}

const clearSearch = () => {
  searchQuery.value = ''
  emit('search', '')
}

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
    value: 'high-priority' as const, 
    label: 'High', 
    count: props.highPriorityCount,
    icon: 'exclamation-triangle-fill',
    class: 'text-danger'
  },
  { 
    value: 'medium-priority' as const, 
    label: 'Medium', 
    count: props.mediumPriorityCount,
    icon: 'exclamation-circle-fill',
    class: 'text-warning'
  },
  { 
    value: 'low-priority' as const, 
    label: 'Low', 
    count: props.lowPriorityCount,
    icon: 'info-circle-fill',
    class: 'text-info'
  },
  { 
    value: 'completed' as const, 
    label: 'Completed', 
    count: props.completedTodosCount 
  },
  { 
    value: 'overdue' as const, 
    label: 'Overdue', 
    count: props.overdueTodosCount 
  }
])

const setFilter = (filter: FilterType) => {
  emit('setFilter', filter)
}

const clearCompleted = () => {
  emit('clearCompleted')
}
</script>
