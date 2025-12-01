import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '../auth'
import apiClient from '@/api/index'
import router from '@/router'

// Mock dependencies
vi.mock('@/api/index')
vi.mock('@/router', () => ({
  default: {
    push: vi.fn()
  }
}))
vi.mock('@/stores/assistant', () => ({
  useAssistantStore: () => ({
    clearMessages: vi.fn()
  })
}))

describe('Auth Store - High Value Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    sessionStorage.clear()
    vi.clearAllMocks()
  })

  describe('Registration', () => {
    it('successfully registers a new user and navigates to home', async () => {
      const store = useAuthStore()
      const mockToken = 'mock-jwt-token'
      const mockUserData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!'
      }

      // Mock successful registration
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { status: 'Success', data: mockToken }
      })
      
      // Mock user profile fetch
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { 
          data: { 
            id: 1, 
            firstName: 'John', 
            lastName: 'Doe', 
            email: 'john@example.com' 
          } 
        }
      })

      const result = await store.register(mockUserData)

      expect(result.success).toBe(true)
      expect(result.error).toBeNull()
      expect(store.token).toBe(mockToken)
      expect(localStorage.getItem('token')).toBe(mockToken)
      expect(store.user?.firstName).toBe('John')
      expect(router.push).toHaveBeenCalledWith('/')
    })

    it('handles registration failure with error message', async () => {
      const store = useAuthStore()
      const errorMessage = 'Email already exists'
      
      vi.mocked(apiClient.post).mockRejectedValueOnce({
        response: { data: { message: errorMessage } }
      })

      const result = await store.register({
        email: 'existing@example.com',
        password: 'Pass123!',
        confirmPassword: 'Pass123!'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe(errorMessage)
      expect(store.token).toBeNull()
      expect(localStorage.getItem('token')).toBeNull()
    })
  })

  describe('Login', () => {
    it('successfully logs in and persists authentication state', async () => {
      const store = useAuthStore()
      const mockToken = 'mock-jwt-token'
      
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { status: 'Success', data: mockToken }
      })
      
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { 
          data: { 
            id: 1, 
            firstName: 'Jane', 
            lastName: 'Smith', 
            email: 'jane@example.com' 
          } 
        }
      })

      const result = await store.login({
        email: 'jane@example.com',
        password: 'password123'
      })

      expect(result.success).toBe(true)
      expect(store.token).toBe(mockToken)
      expect(store.user?.email).toBe('jane@example.com')
      expect(localStorage.getItem('token')).toBe(mockToken)
      expect(router.push).toHaveBeenCalledWith('/')
    })

    it('handles invalid credentials gracefully', async () => {
      const store = useAuthStore()
      
      vi.mocked(apiClient.post).mockRejectedValueOnce({
        response: { data: { message: 'Invalid credentials' } }
      })

      const result = await store.login({
        email: 'wrong@example.com',
        password: 'wrongpass'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid credentials')
      expect(store.token).toBeNull()
    })
  })

  describe('Logout', () => {
    it('clears all user data and redirects to login', async () => {
      const store = useAuthStore()
      
      // Setup authenticated state
      store.token = 'some-token'
      store.user = { id: 1, firstName: 'John', lastName: 'Doe', email: 'john@example.com' }
      localStorage.setItem('token', 'some-token')
      sessionStorage.setItem('assistant-chat', 'some-data')

      store.logout()

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(localStorage.getItem('token')).toBeNull()
      expect(sessionStorage.getItem('assistant-chat')).toBeNull()
      expect(router.push).toHaveBeenCalledWith('/login')
    })
  })

  describe('User Profile', () => {
    it('fetches and stores user profile correctly', async () => {
      const store = useAuthStore()
      const mockUser = {
        id: 1,
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@example.com',
        phoneNumber: '555-0100'
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockUser }
      })

      await store.fetchUserProfile()

      expect(store.user).toEqual(mockUser)
      expect(store.getFullName()).toBe('Alice Johnson')
      expect(store.getInitials()).toBe('AJ')
    })

    it('logs out user when profile fetch fails (session expired)', async () => {
      const store = useAuthStore()
      store.token = 'expired-token'
      
      vi.mocked(apiClient.get).mockRejectedValueOnce({
        response: { status: 401, data: { message: 'Unauthorized' } }
      })

      await store.fetchUserProfile()

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(router.push).toHaveBeenCalledWith('/login')
    })

    it('updates user profile and maintains state', async () => {
      const store = useAuthStore()
      store.user = {
        id: 1,
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@example.com'
      }

      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { status: 'Success' }
      })

      const updates = { firstName: 'Robert', phoneNumber: '555-0200' }
      const success = await store.updateUserProfile(updates)

      expect(success).toBe(true)
      expect(store.user?.firstName).toBe('Robert')
      expect(store.user?.phoneNumber).toBe('555-0200')
      expect(store.getFullName()).toBe('Robert Smith')
    })
  })

  describe('Edge Cases: User Helpers', () => {
    it('handles missing user data gracefully', () => {
      const store = useAuthStore()
      store.user = null

      expect(store.getInitials()).toBe('??')
      expect(store.getFullName()).toBe('Unknown User')
    })

    it('handles partial user names', () => {
      const store = useAuthStore()
      store.user = {
        id: 1,
        firstName: 'Madonna',
        lastName: '',
        email: 'madonna@example.com'
      }

      expect(store.getInitials()).toBe('M')
      expect(store.getFullName()).toBe('Madonna')
    })
  })
})

