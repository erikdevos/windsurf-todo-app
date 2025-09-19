import { defineStore } from 'pinia'

export type Priority = 'low' | 'medium' | 'high'

export interface Todo {
  id: string
  text: string
  description?: string
  completed: boolean
  createdAt: Date
  dueDate?: Date
  order: number
  priority: Priority
}

export const useTodosStore = defineStore('todos', {
  state: () => ({
    todos: [] as Todo[],
    filter: 'all' as 'all' | 'active' | 'completed' | 'overdue' | 'high-priority' | 'medium-priority' | 'low-priority',
    searchQuery: ''
  }),

  getters: {
    filteredTodos: (state) => {
      // First apply the current filter
      const filtered = (() => {
        switch (state.filter) {
          case 'active':
            return state.todos.filter(todo => !todo.completed)
          case 'completed':
            return state.todos.filter(todo => todo.completed)
          case 'overdue':
            return state.todos.filter(todo => {
              if (!todo.dueDate || todo.completed) return false
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              const dueDate = new Date(todo.dueDate)
              dueDate.setHours(0, 0, 0, 0)
              return dueDate < today
            })
          case 'high-priority':
            return state.todos.filter(todo => todo.priority === 'high' && !todo.completed)
          case 'medium-priority':
            return state.todos.filter(todo => todo.priority === 'medium' && !todo.completed)
          case 'low-priority':
            return state.todos.filter(todo => todo.priority === 'low' && !todo.completed)
          default:
            return state.todos
        }
      })()
      
      // Then apply search query if it exists
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase()
        return filtered
          .filter(todo => 
            todo.text.toLowerCase().includes(query) || 
            (todo.description && todo.description.toLowerCase().includes(query))
          )
          .sort((a, b) => {
            // Sort by priority first (high to low), then by order
            const priorityOrder = { high: 3, medium: 2, low: 1 }
            return priorityOrder[b.priority] - priorityOrder[a.priority] || a.order - b.order
          })
      }
      
      // Default sort by priority (high to low) then by order
      return filtered.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority] || a.order - b.order
      })
    },
    
    activeTodosCount: (state) => {
      return state.todos.filter(todo => !todo.completed).length
    },
    
    completedTodosCount: (state) => {
      return state.todos.filter(todo => todo.completed).length
    },

    overdueTodosCount: (state) => {
      return state.todos.filter(todo => {
        if (!todo.dueDate || todo.completed) return false
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const dueDate = new Date(todo.dueDate)
        dueDate.setHours(0, 0, 0, 0)
        return dueDate < today
      }).length
    },
    
    highPriorityCount: (state) => {
      return state.todos.filter(todo => todo.priority === 'high' && !todo.completed).length
    },
    
    mediumPriorityCount: (state) => {
      return state.todos.filter(todo => todo.priority === 'medium' && !todo.completed).length
    },
    
    lowPriorityCount: (state) => {
      return state.todos.filter(todo => todo.priority === 'low' && !todo.completed).length
    }
  },

  actions: {
    addTodo(text: string, description?: string, dueDate?: Date, priority: Priority = 'medium') {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text,
        description,
        completed: false,
        createdAt: new Date(),
        dueDate,
        order: this.todos.length,
        priority
      }
      this.todos.unshift(newTodo)
      this.saveToLocalStorage()
      return newTodo.id
    },

    toggleTodo(id: string) {
      const todo = this.todos.find(t => t.id === id)
      if (todo) {
        todo.completed = !todo.completed
        this.saveToLocalStorage()
      }
    },

    deleteTodo(id: string) {
      const index = this.todos.findIndex(t => t.id === id)
      if (index > -1) {
        this.todos.splice(index, 1)
        this.saveToLocalStorage()
      }
    },

    editTodo(id: string, newText: string, newDescription?: string, newDueDate?: Date, newPriority?: Priority) {
      const todo = this.todos.find(t => t.id === id)
      if (todo) {
        todo.text = newText
        if (newDescription !== undefined) {
          todo.description = newDescription
        }
        if (newDueDate !== undefined) {
          todo.dueDate = newDueDate
        }
        if (newPriority !== undefined) {
          todo.priority = newPriority
        }
        this.saveToLocalStorage()
      }
    },

    clearCompleted() {
      this.todos = this.todos.filter(todo => !todo.completed)
      this.saveToLocalStorage()
    },

    setFilter(filter: 'all' | 'active' | 'completed' | 'overdue' | 'high-priority' | 'medium-priority' | 'low-priority') {
      this.filter = filter
    },

    setSearchQuery(query: string) {
      this.searchQuery = query
    },

    saveToLocalStorage() {
      if (typeof window !== 'undefined') {
        localStorage.setItem('todos', JSON.stringify(this.todos))
      }
    },

    loadFromLocalStorage() {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('todos')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            this.todos = parsed.map((todo: any, index: number) => ({
              ...todo,
              createdAt: new Date(todo.createdAt),
              dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
              order: todo.order !== undefined ? todo.order : index,
              priority: todo.priority || 'medium' // Default to medium for existing todos
            }))
          } catch (error) {
            console.error('Error loading todos from localStorage:', error)
          }
        }
      }
    },

    reorderTodos(newOrder: Todo[]) {
      // Update the order property for each todo based on its new position
      newOrder.forEach((todo, index) => {
        todo.order = index
      })
      this.todos = newOrder
      this.saveToLocalStorage()
    },

    exportTodos() {
      const dataStr = JSON.stringify(this.todos, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `todos-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    },

    async importTodos(file: File): Promise<{ success: boolean; message: string; count?: number }> {
      try {
        const text = await file.text()
        let todos: any[]
        
        try {
          todos = JSON.parse(text)
          if (!Array.isArray(todos)) {
            return { success: false, message: 'Invalid file format: expected an array of todos' }
          }
        } catch (error) {
          return { success: false, message: 'Error parsing JSON file' }
        }

        // Validate and filter todos
        const validTodos = todos.filter(todo => {
          // Check if the todo has all required fields with correct types
          const hasRequiredFields = (
            typeof todo === 'object' &&
            todo !== null &&
            'id' in todo &&
            'text' in todo &&
            'completed' in todo &&
            'createdAt' in todo &&
            'order' in todo
          )
          
          // Check if priority is valid if it exists
          const hasValidPriority = !('priority' in todo) || 
            ['high', 'medium', 'low'].includes(todo.priority)
            
          return hasRequiredFields && hasValidPriority
        }).map(todo => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
          dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
          priority: todo.priority && ['high', 'medium', 'low'].includes(todo.priority) 
            ? todo.priority 
            : 'medium' as const
        }))

        if (validTodos.length === 0) {
          return { success: false, message: 'No valid todos found in the file' }
        }

        // Add the valid todos
        this.todos = [...validTodos, ...this.todos]
        this.saveToLocalStorage()

        return { 
          success: true, 
          message: `Successfully imported ${validTodos.length} todo(s)`,
          count: validTodos.length
        }
      } catch (error) {
        console.error('Error importing todos:', error)
        return { 
          success: false, 
          message: error instanceof Error ? error.message : 'An error occurred while importing todos' 
        }
      }
    }
  }
})
