import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTodosStore } from '../todos'

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
  describe('Export Functionality', () => {
    it('should export todos to a JSON file', () => {
      const store = useTodosStore()
      
      // Add test todos
      store.addTodo('Test todo 1')
      store.addTodo('Test todo 2')
      
      // Mock the Blob constructor
      const mockBlob = {}
      global.Blob = vi.fn().mockImplementation(() => mockBlob)
      
      // Call export
      store.exportTodos()
      
      // Verify Blob was created with correct data
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
      
      // Create test data
      const testTodos = [
        {
          id: '1',
          text: 'Imported todo 1',
          completed: false,
          createdAt: new Date().toISOString(),
          order: 0
        },
        {
          id: '2',
          text: 'Imported todo 2',
          completed: true,
          createdAt: new Date().toISOString(),
          order: 1
        }
      ]
      
      // Create a mock file
      const mockFile = new File([JSON.stringify(testTodos)], 'test-todos.json', { type: 'application/json' })
      
      // Call import
      const result = await store.importTodos(mockFile)
      
      // Verify the result
      expect(result.success).toBe(true)
      expect(store.todos).toHaveLength(2)
      expect(store.todos[0].text).toBe('Imported todo 1')
      expect(store.todos[1].text).toBe('Imported todo 2')
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
        { text: 'Invalid todo' } // Missing id and other required fields
      ]
      
      // Create a mock file with invalid todos
      const mockFile = new File([JSON.stringify(invalidTodos)], 'invalid-todos.json', { type: 'application/json' })
      
      // Call import
      const result = await store.importTodos(mockFile)
      
      expect(result.success).toBe(false)
      expect(result.message).toContain('No valid todos found')
    })
  })
})
