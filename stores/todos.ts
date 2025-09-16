import { defineStore } from 'pinia'

export interface Todo {
  id: string
  text: string
  description?: string
  completed: boolean
  createdAt: Date
  dueDate?: Date
}

export const useTodosStore = defineStore('todos', {
  state: () => ({
    todos: [] as Todo[],
    filter: 'all' as 'all' | 'active' | 'completed'
  }),

  getters: {
    filteredTodos: (state) => {
      switch (state.filter) {
        case 'active':
          return state.todos.filter(todo => !todo.completed)
        case 'completed':
          return state.todos.filter(todo => todo.completed)
        default:
          return state.todos
      }
    },
    
    activeTodosCount: (state) => {
      return state.todos.filter(todo => !todo.completed).length
    },
    
    completedTodosCount: (state) => {
      return state.todos.filter(todo => todo.completed).length
    }
  },

  actions: {
    addTodo(text: string, description?: string, dueDate?: Date) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        text: text.trim(),
        description: description?.trim() || undefined,
        completed: false,
        createdAt: new Date(),
        dueDate: dueDate
      }
      this.todos.unshift(newTodo)
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

    setFilter(filter: 'all' | 'active' | 'completed') {
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
            this.todos = parsed.map((todo: any) => ({
              ...todo,
              createdAt: new Date(todo.createdAt),
              dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
            }))
          } catch (error) {
            console.error('Error loading todos from localStorage:', error)
          }
        }
      }
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
            const processedTodos = validTodos.map((todo: any) => ({
              ...todo,
              createdAt: new Date(todo.createdAt),
              dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
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
