import { defineStore } from 'pinia'

export interface Todo {
  id: string
  text: string
  description?: string
  completed: boolean
  createdAt: Date
  dueDate?: Date
  order: number
}

export const useTodosStore = defineStore('todos', {
  state: () => ({
    todos: [] as Todo[],
    filter: 'all' as 'all' | 'active' | 'completed' | 'overdue'
  }),

  getters: {
    filteredTodos: (state) => {
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
          default:
            return state.todos
        }
      })()
      
      return filtered.sort((a, b) => a.order - b.order)
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
    }
  },

  actions: {
    addTodo(text: string, description?: string, dueDate?: Date) {
      const maxOrder = this.todos.length > 0 ? Math.max(...this.todos.map(t => t.order)) : -1
      const newTodo: Todo = {
        id: Date.now().toString(),
        text,
        description,
        completed: false,
        createdAt: new Date(),
        dueDate,
        order: maxOrder + 1
      }
      
      this.todos.push(newTodo)
      this.saveToLocalStorage()
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

    editTodo(id: string, newText: string, newDescription?: string, newDueDate?: Date) {
      const todo = this.todos.find(t => t.id === id)
      if (todo) {
        todo.text = newText.trim()
        todo.description = newDescription?.trim() || undefined
        if (newDueDate !== undefined) {
          todo.dueDate = newDueDate
        }
        this.saveToLocalStorage()
      }
    },

    clearCompleted() {
      this.todos = this.todos.filter(todo => !todo.completed)
      this.saveToLocalStorage()
    },

    setFilter(filter: 'all' | 'active' | 'completed' | 'overdue') {
      this.filter = filter
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
              order: todo.order !== undefined ? todo.order : index
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

    importTodos(file: File): Promise<{ success: boolean; message: string; count?: number }> {
      return new Promise((resolve) => {
        const reader = new FileReader()
        
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string
            const importedTodos = JSON.parse(content)
            
            // Validate the imported data
            if (!Array.isArray(importedTodos)) {
              resolve({ success: false, message: 'Invalid file format. Expected an array of todos.' })
              return
            }
            
            // Validate each todo item
            const validTodos = importedTodos.filter((todo: any) => {
              return todo && 
                     typeof todo.id === 'string' && 
                     typeof todo.text === 'string' && 
                     typeof todo.completed === 'boolean' &&
                     todo.createdAt
            })
            
            if (validTodos.length === 0) {
              resolve({ success: false, message: 'No valid todos found in the file.' })
              return
            }
            
            // Convert dates and merge with existing todos
            const maxOrder = this.todos.length > 0 ? Math.max(...this.todos.map(t => t.order)) : -1
            const processedTodos = validTodos.map((todo: any, index: number) => ({
              ...todo,
              createdAt: new Date(todo.createdAt),
              dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
              order: todo.order !== undefined ? todo.order : maxOrder + 1 + index
            }))
            
            // Add imported todos to existing ones (avoiding duplicates by ID)
            const existingIds = new Set(this.todos.map(t => t.id))
            const newTodos = processedTodos.filter((todo: Todo) => !existingIds.has(todo.id))
            
            this.todos = [...this.todos, ...newTodos]
            this.saveToLocalStorage()
            
            resolve({ 
              success: true, 
              message: `Successfully imported ${newTodos.length} todos.`,
              count: newTodos.length
            })
            
          } catch (error) {
            resolve({ success: false, message: 'Error parsing JSON file. Please check the file format.' })
          }
        }
        
        reader.onerror = () => {
          resolve({ success: false, message: 'Error reading the file.' })
        }
        
        reader.readAsText(file)
      })
    }
  }
})
