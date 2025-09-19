import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTodosStore, type Priority } from '../todos'

// Simple localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

// Mock URL.createObjectURL
const mockCreateObjectURL = vi.fn()

// Mock document.createElement for download link
const mockLink = {
  click: vi.fn(),
  href: '',
  download: ''
}

beforeEach(() => {
  // Setup localStorage mock
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true
  })

  // Reset localStorage
  localStorageMock.clear()

  // Mock URL.createObjectURL
  global.URL.createObjectURL = mockCreateObjectURL
  mockCreateObjectURL.mockReturnValue('blob:mock-url')

  // Mock document.createElement for download links
  vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
    if (tagName === 'a') {
      return mockLink as unknown as HTMLElement
    }
    return document.createElement(tagName)
  })

  // Mock document.body methods
  document.body.appendChild = vi.fn()
  document.body.removeChild = vi.fn()

  // Reset all mocks before each test
  vi.clearAllMocks()
  setActivePinia(createPinia())
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Todos Store', () => {
  describe('Priority Feature', () => {
    it('should add todos with different priorities', () => {
      const store = useTodosStore()
      
      // Add todos with different priorities
      store.addTodo('High priority', undefined, undefined, 'high')
      store.addTodo('Medium priority', undefined, undefined, 'medium')
      store.addTodo('Low priority', undefined, undefined, 'low')
      
      // Verify todos were added with correct priorities
      // The todos are added to the beginning of the array, so the order is reversed
      expect(store.todos[2].priority).toBe('high')
      expect(store.todos[1].priority).toBe('medium')
      expect(store.todos[0].priority).toBe('low')
      
      // Verify priority counts
      expect(store.highPriorityCount).toBe(1)
      expect(store.mediumPriorityCount).toBe(1)
      expect(store.lowPriorityCount).toBe(1)
    })
    
    it('should filter todos by priority', () => {
      const store = useTodosStore()
      
      // Add test todos
      store.addTodo('High priority', undefined, undefined, 'high')
      store.addTodo('Medium priority', undefined, undefined, 'medium')
      store.addTodo('Low priority', undefined, undefined, 'low')
      
      // Test high priority filter
      store.setFilter('high-priority')
      expect(store.filteredTodos).toHaveLength(1)
      expect(store.filteredTodos[0].priority).toBe('high')
      
      // Test medium priority filter
      store.setFilter('medium-priority')
      expect(store.filteredTodos).toHaveLength(1)
      expect(store.filteredTodos[0].priority).toBe('medium')
      
      // Test low priority filter
      store.setFilter('low-priority')
      expect(store.filteredTodos).toHaveLength(1)
      expect(store.filteredTodos[0].priority).toBe('low')
    })
    
    it('should update priority when editing a todo', () => {
      const store = useTodosStore()
      const todoId = store.addTodo('Test todo')
      const todo = store.todos.find(t => t.id === todoId)!
      
      // Update priority
      store.editTodo(todo.id, 'Updated todo', undefined, undefined, 'high')
      
      // Verify priority was updated
      const updatedTodo = store.todos.find(t => t.id === todo.id)
      expect(updatedTodo?.priority).toBe('high')
      expect(store.highPriorityCount).toBe(1)
    })
  })

  describe('Export Functionality', () => {
    it('should export todos to a JSON file', () => {
      const store = useTodosStore()
      
      // Add test todos with priorities
      store.addTodo('Test todo 1', undefined, undefined, 'high')
      store.addTodo('Test todo 2', undefined, undefined, 'low')
      
      // Mock the Blob constructor
      const mockBlob = {}
      global.Blob = vi.fn().mockImplementation(() => mockBlob)
      
      // Call export
      store.exportTodos()
      
      // Verify Blob was created with correct data including priorities
      expect(Blob).toHaveBeenCalledWith(
        [JSON.stringify(store.todos, null, 2)],
        { type: 'application/json' }
      )
      
      // Verify download link was created and clicked
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob)
      expect(mockLink.href).toBe('blob:mock-url')
      expect(mockLink.download).toMatch(/^todos-backup-\d{4}-\d{2}-\d{2}\.json$/)
      expect(mockLink.click).toHaveBeenCalled()
    })
  })

  describe('Import Functionality', () => {
    it('should import todos from a valid JSON file', async () => {
      const store = useTodosStore()
      
      // Create test data with priorities
      const testTodos = [
        {
          id: '1',
          text: 'Imported high priority',
          completed: false,
          priority: 'high' as const,
          createdAt: new Date().toISOString(),
          order: 0
        },
        {
          id: '2',
          text: 'Imported medium priority',
          completed: true,
          priority: 'medium' as const,
          createdAt: new Date().toISOString(),
          order: 1
        },
        {
          id: '3',
          text: 'Imported low priority',
          completed: false,
          priority: 'low' as const,
          createdAt: new Date().toISOString(),
          order: 2
        }
      ]
      
      // Create a mock file
      const mockFile = new File([JSON.stringify(testTodos)], 'test-todos.json', { type: 'application/json' })
      
      // Call import
      const result = await store.importTodos(mockFile)
      
      // Verify the result with priorities
      expect(result.success).toBe(true)
      expect(store.todos).toHaveLength(3)
      expect(store.todos[0].text).toBe('Imported high priority')
      expect(store.todos[0].priority).toBe('high')
      expect(store.todos[1].text).toBe('Imported medium priority')
      expect(store.todos[1].priority).toBe('medium')
      expect(store.todos[2].text).toBe('Imported low priority')
      expect(store.todos[2].priority).toBe('low')
      
      // Verify priority counts
      expect(store.highPriorityCount).toBe(1)
      expect(store.mediumPriorityCount).toBe(0) // Because it's completed
      expect(store.lowPriorityCount).toBe(1)
    })
    
    it('should handle invalid JSON files', async () => {
      const store = useTodosStore()
      
      // Create a mock file with invalid JSON
      const mockFile = new File(['not a valid JSON'], 'invalid.json', { type: 'application/json' })
      
      // Call import
      const result = await store.importTodos(mockFile)
      
      expect(result.success).toBe(false)
      expect(result.message).toContain('Error parsing JSON file')
    })
    
    it('should handle files with invalid todo items', async () => {
      const store = useTodosStore()
      
      const invalidTodos = [
        { id: '1' }, // Missing required fields
        { text: 'Invalid todo' }, // Missing id and other required fields
        { 
          id: '2', 
          text: 'Valid but with invalid priority', 
          priority: 'invalid-priority', // Invalid priority
          completed: false,
          createdAt: new Date().toISOString(),
          order: 0
        }
      ]
      
      // Create a mock file with invalid todos
      const mockFile = new File([JSON.stringify(invalidTodos)], 'invalid-todos.json', { type: 'application/json' })
      
      // Call import
      const result = await store.importTodos(mockFile)
      
      expect(result.success).toBe(false)
      expect(result.message).toContain('No valid todos found')
    })
    
    it('should handle todos with missing priority (default to medium)', async () => {
      const store = useTodosStore()
      
      const todosWithMissingPriority = [
        {
          id: '1',
          text: 'Todo with missing priority',
          completed: false,
          createdAt: new Date().toISOString(),
          order: 0
        }
      ]
      
      // Create a mock file with a todo missing priority
      const mockFile = new File(
        [JSON.stringify(todosWithMissingPriority)], 
        'missing-priority.json', 
        { type: 'application/json' }
      )
      
      // Call import
      const result = await store.importTodos(mockFile)
      
      // Verify the todo was imported with default medium priority
      expect(result.success).toBe(true)
      expect(store.todos).toHaveLength(1)
      expect(store.todos[0].priority).toBe('medium')
    })
  })
})
