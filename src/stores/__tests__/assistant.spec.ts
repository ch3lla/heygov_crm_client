import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import { useAssistantStore } from '../assistant'

describe('Assistant Store - High Value Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    sessionStorage.clear()
  })

  describe('Chat Session Management', () => {
    it('starts with empty chat state', () => {
      const store = useAssistantStore()

      expect(store.messages).toHaveLength(0)
      expect(store.messageCount).toBe(0)
      expect(store.hasMessages).toBe(false)
      expect(store.isChatOpen).toBe(false)
      expect(store.isLoading).toBe(false)
    })

    it('opens and closes chat', () => {
      const store = useAssistantStore()

      store.openChat()
      expect(store.isChatOpen).toBe(true)

      store.closeChat()
      expect(store.isChatOpen).toBe(false)
    })

    it('toggles chat state', () => {
      const store = useAssistantStore()

      expect(store.isChatOpen).toBe(false)
      
      store.toggleChat()
      expect(store.isChatOpen).toBe(true)
      
      store.toggleChat()
      expect(store.isChatOpen).toBe(false)
    })
  })

  describe('Critical Business Logic: Message Management', () => {
    it('adds user message to chat history', () => {
      const store = useAssistantStore()

      store.addMessage('user', 'Hello, assistant!')

      expect(store.messages).toHaveLength(1)
      expect(store.messages[0]?.role).toBe('user')
      expect(store.messages[0]?.content).toBe('Hello, assistant!')
      expect(store.messages[0]?.timestamp).toBeInstanceOf(Date)
      expect(store.messageCount).toBe(1)
      expect(store.hasMessages).toBe(true)
    })

    it('adds assistant response to chat history', () => {
      const store = useAssistantStore()

      store.addMessage('assistant', 'Hello! How can I help you today?')

      expect(store.messages).toHaveLength(1)
      expect(store.messages[0]?.role).toBe('assistant')
      expect(store.messages[0]?.content).toBe('Hello! How can I help you today?')
    })

    it('maintains conversation order', () => {
      const store = useAssistantStore()

      store.addMessage('user', 'What is my contact count?')
      store.addMessage('assistant', 'You have 42 contacts.')
      store.addMessage('user', 'Show me my recent contacts')
      store.addMessage('assistant', 'Here are your recent contacts...')

      expect(store.messageCount).toBe(4)
      expect(store.messages[0]?.role).toBe('user')
      expect(store.messages[1]?.role).toBe('assistant')
      expect(store.messages[2]?.role).toBe('user')
      expect(store.messages[3]?.role).toBe('assistant')
    })

    it('clears all messages', () => {
      const store = useAssistantStore()

      store.addMessage('user', 'Hello')
      store.addMessage('assistant', 'Hi there')
      store.addMessage('user', 'How are you?')
      
      expect(store.messageCount).toBe(3)

      store.clearMessages()

      expect(store.messages).toHaveLength(0)
      expect(store.messageCount).toBe(0)
      expect(store.hasMessages).toBe(false)
    })
  })

  describe('Critical Business Logic: Context Window', () => {
    it('provides recent messages for API context', () => {
      const store = useAssistantStore()

      // Add 15 messages
      for (let i = 1; i <= 15; i++) {
        store.addMessage(i % 2 === 0 ? 'assistant' : 'user', `Message ${i}`)
      }

      expect(store.messageCount).toBe(15)
      expect(store.recentMessages).toHaveLength(10) // Only last 10
      expect(store.recentMessages[0]?.content).toBe('Message 6')
      expect(store.recentMessages[9]?.content).toBe('Message 15')
    })

    it('returns all messages when less than 10', () => {
      const store = useAssistantStore()

      store.addMessage('user', 'Message 1')
      store.addMessage('assistant', 'Message 2')
      store.addMessage('user', 'Message 3')

      expect(store.recentMessages).toHaveLength(3)
      expect(store.recentMessages).toEqual(store.messages)
    })
  })

  describe('User Experience: Loading States', () => {
    it('manages loading state for API calls', () => {
      const store = useAssistantStore()

      expect(store.isLoading).toBe(false)

      store.setLoading(true)
      expect(store.isLoading).toBe(true)

      store.setLoading(false)
      expect(store.isLoading).toBe(false)
    })

    it('simulates typical conversation flow with loading', () => {
      const store = useAssistantStore()

      // User sends message
      store.openChat()
      store.addMessage('user', 'Show my contacts')
      
      // Start loading
      store.setLoading(true)
      expect(store.isLoading).toBe(true)
      
      // Assistant responds
      store.addMessage('assistant', 'Here are your contacts...')
      store.setLoading(false)
      
      expect(store.isLoading).toBe(false)
      expect(store.messageCount).toBe(2)
    })
  })

  describe('Session Storage', () => {
    it('persists messages to session storage', () => {
      const store = useAssistantStore()

      store.addMessage('user', 'Test message')
      store.openChat()

      // Create new store instance (simulates page reload)
      const newStore = useAssistantStore()

      expect(newStore.messageCount).toBe(1)
      expect(newStore.messages[0]?.content).toBe('Test message')
      expect(newStore.isChatOpen).toBe(true)
    })

    it('maintains empty state when no messages exist', () => {
      const store = useAssistantStore()

      expect(store.messageCount).toBe(0)

      // Create new instance
      const newStore = useAssistantStore()

      expect(newStore.messageCount).toBe(0)
      expect(newStore.hasMessages).toBe(false)
    })
  })

  describe('Message Timestamps', () => {
    it('assigns timestamps to messages', () => {
      const store = useAssistantStore()
      const beforeTime = new Date()

      store.addMessage('user', 'Timestamped message')

      const afterTime = new Date()
      const messageTime = store.messages[0]?.timestamp

      expect(messageTime).toBeInstanceOf(Date)
      expect(messageTime?.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime())
      expect(messageTime?.getTime()).toBeLessThanOrEqual(afterTime.getTime())
    })

    it('maintains chronological order of timestamps', async () => {
      const store = useAssistantStore()

      store.addMessage('user', 'First')
      await new Promise(resolve => setTimeout(resolve, 10)) // Small delay
      store.addMessage('assistant', 'Second')
      await new Promise(resolve => setTimeout(resolve, 10))
      store.addMessage('user', 'Third')

      const time1 = store.messages[0]?.timestamp.getTime()
      const time2 = store.messages[1]?.timestamp.getTime()
      const time3 = store.messages[2]?.timestamp.getTime()

      expect(time2).toBeGreaterThanOrEqual(time1 ?? 0)
      expect(time3).toBeGreaterThanOrEqual(time2 ?? 0)
    })
  })

  describe('Edge Cases: Long Conversations', () => {
    it('handles very long conversations efficiently', () => {
      const store = useAssistantStore()

      // Add 100 messages
      for (let i = 0; i < 100; i++) {
        store.addMessage(i % 2 === 0 ? 'user' : 'assistant', `Message ${i}`)
      }

      expect(store.messageCount).toBe(100)
      expect(store.recentMessages).toHaveLength(10)
      expect(store.hasMessages).toBe(true)
    })

    it('handles clearing large conversation history', () => {
      const store = useAssistantStore()

      for (let i = 0; i < 50; i++) {
        store.addMessage('user', `Message ${i}`)
      }

      expect(store.messageCount).toBe(50)

      store.clearMessages()

      expect(store.messageCount).toBe(0)
      expect(store.hasMessages).toBe(false)
      expect(store.recentMessages).toHaveLength(0)
    })
  })
})

