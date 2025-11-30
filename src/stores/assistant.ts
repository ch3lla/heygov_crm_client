import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export const useAssistantStore = defineStore('assistant', () => {
  // State
  const messages = ref<ChatMessage[]>([])
  const isChatOpen = ref(false)
  const isLoading = ref(false)

  // Computed
  const messageCount = computed(() => messages.value.length)
  const hasMessages = computed(() => messages.value.length > 0)
  const recentMessages = computed(() => messages.value.slice(-10)) // Last 10 messages for context

  // Actions
  const addMessage = (role: 'user' | 'assistant', content: string) => {
    messages.value.push({
      role,
      content,
      timestamp: new Date()
    })
  }

  const clearMessages = () => {
    messages.value = []
  }

  const openChat = () => {
    isChatOpen.value = true
  }

  const closeChat = () => {
    isChatOpen.value = false
  }

  const toggleChat = () => {
    isChatOpen.value = !isChatOpen.value
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  return {
    // State
    messages,
    isChatOpen,
    isLoading,
    
    // Computed
    messageCount,
    hasMessages,
    recentMessages,
    
    // Actions
    addMessage,
    clearMessages,
    openChat,
    closeChat,
    toggleChat,
    setLoading
  }
}, {
  persist: {
    key: 'assistant-chat',
    storage: sessionStorage // Use sessionStorage for session-only persistence
  }
})

