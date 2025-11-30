<template>
  <Transition name="slide-up">
    <div v-if="isOpen" class="chat-container">
      <div class="chat-window">
        <!-- Header -->
        <div class="chat-header">
          <div class="header-left">
            <div class="avatar">🤖</div>
            <div class="header-info">
              <h3>AI Assistant</h3>
              <span class="status" :class="{ online: isOnline }">
                {{ isOnline ? 'Online' : 'Offline' }}
              </span>
            </div>
          </div>
          <div class="header-actions">
            <button @click="closeChat" class="icon-btn" title="Close">
              <span>✕</span>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div class="chat-messages" ref="messagesContainer">
          <div v-if="messages.length === 0" class="empty-state">
            <div class="empty-icon">👋</div>
            <p>Hello! How can I help you today?</p>
            <div class="suggestions">
              <button 
                v-for="suggestion in suggestions" 
                :key="suggestion"
                @click="sendMessage(suggestion)"
                class="suggestion-btn"
              >
                {{ suggestion }}
              </button>
            </div>
          </div>

          <div v-else>
            <div 
              v-for="(message, index) in messages" 
              :key="index"
              class="message"
              :class="{ 'user': message.role === 'user', 'assistant': message.role === 'assistant' }"
            >
              <div class="message-avatar">
                {{ message.role === 'user' ? authStore.getInitials() : '🤖' }}
              </div>
              <div class="message-content">
                <div class="message-text markdown-content" v-html="renderMarkdown(message.content)"></div>
                <div class="message-time">{{ formatTime(message.timestamp) }}</div>
              </div>
            </div>

            <!-- Loading indicator -->
            <div v-if="isLoading" class="message assistant">
              <div class="message-avatar">🤖</div>
              <div class="message-content">
                <div class="loading-bubble">
                  <!-- <div class="bubble-text">{{ loadingText }}</div> -->
                  <div class="bubble-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="chat-input">
          <textarea
            v-model="inputMessage"
            @keydown.enter.exact.prevent="handleSend"
            @keydown.enter.shift.exact="inputMessage += '\n'"
            placeholder="Type your message..."
            rows="1"
            ref="textareaRef"
          ></textarea>
          <button 
            @click="handleSend" 
            :disabled="!inputMessage.trim() || isLoading"
            class="send-btn"
            title="Send message"
          >
            <span v-if="!isLoading">➤</span>
            <span v-else class="spinner"></span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import apiClient from '@/api/index'
import { toast } from '@/utils/toast'
import { useAuthStore } from '@/stores/auth'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'
import { useAssistantStore } from '@/stores/assistant'

const authStore = useAuthStore()
const assistantStore = useAssistantStore()

const md = new MarkdownIt({
  html: false,       // Disable HTML tags in source (Security)
  linkify: true,     // Autoconvert URL-like text to links
  breaks: true,      // Convert '\n' in paragraphs into <br>
  typographer: true  // Enable some language-neutral replacement + quotes beautification
});

const renderMarkdown = (text: string) => {
  if (!text) return '';
  return DOMPurify.sanitize(md.render(text || ""));
};

const isOpen = computed(() => assistantStore.isChatOpen);
// Use computed to make messages reactive to store changes
const messages = computed(() => assistantStore.messages)
const inputMessage = ref('')
// Use computed to make isLoading reactive to store changes
const isLoading = computed(() => assistantStore.isLoading)
const isOnline = ref(true)
const messagesContainer = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const suggestions = [
  'Help me organize my contacts',
  'Find duplicate contacts',
  'Export my contacts to CSV',
  'Show contacts added this week'
]

const closeChat = () => {
  // isOpen.value = false
  assistantStore.closeChat()
}

const minimizeChat = () => {
  // isOpen.value = false
  assistantStore.closeChat()
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const formatTime = (date: Date | string) => {
  if (!date) return ''
  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) {
    return ''
  }
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(dateObj)
}

const sendMessage = async (content?: string) => {
  const messageText = content || inputMessage.value.trim()
  if (!messageText || isLoading.value) return

  // Add user message using store
  assistantStore.addMessage('user', messageText)

  inputMessage.value = ''
  scrollToBottom()
  assistantStore.setLoading(true)

  try {
    const response = await apiClient.post('/assistant/query', {
      query: messageText
    })

    console.log(response.data)
    // Add assistant response
    if (response.data.status === 'Success' && (response.data.data?.message?.reply || typeof response.data.data?.message === 'string' && response.data.data?.message)) {
      const replyContent = typeof response.data.data?.message === 'string' 
        ? response.data.data.message 
        : response.data.data.message.reply
      
      assistantStore.addMessage('assistant', replyContent)
    } else {
      throw new Error('Invalid response format')
    }
  } catch (error: any) {
    console.error('Chat error:', error)
    
    // Fallback response if API fails
    assistantStore.addMessage('assistant', "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.")
    
    toast.error('Failed to send message. Please try again.')
  } finally {
    assistantStore.setLoading(false)
    scrollToBottom()
  }
}

const handleSend = () => {
  sendMessage()
}

// Auto-resize textarea
watch(inputMessage, () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    textareaRef.value.style.height = Math.min(textareaRef.value.scrollHeight, 120) + 'px'
  }
})

// Focus input when chat opens
watch(isOpen, (newVal) => {
  if (newVal) {
    nextTick(() => {
      textareaRef.value?.focus()
    })
  }
})
</script>

<style scoped>
.chat-container {
  position: fixed;
  bottom: 100px;
  right: 24px;
  z-index: 1000;
  width: 400px;
  max-width: calc(100vw - 48px);
  height: 600px;
  max-height: calc(100vh - 140px);
}

.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
}

/* Header */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.header-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.status {
  font-size: 12px;
  opacity: 0.9;
}

.status::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef4444;
  margin-right: 6px;
}

.status.online::before {
  background: #22c55e;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Messages */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.suggestions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
  width: 100%;
  max-width: 300px;
}

.suggestion-btn {
  padding: 12px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.suggestion-btn:hover {
  background: #f3f4f6;
  border-color: #667eea;
  color: #667eea;
}

.message {
  display: flex;
  gap: 12px;
  animation: fadeIn 0.3s ease-out;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.message.user .message-avatar {
  background: #667eea;
}

.message-content {
  max-width: 75%;
}

.message.user .message-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.message-text {
  padding: 8px 12px;
  border-radius: 12px;
  background: white;
  color: #111827;
  font-size: 14px;
  line-height: 1.5;
  word-wrap: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message.user .message-text {
  background: #667eea;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-text {
  border-bottom-left-radius: 4px;
}

/* Markdown content styling */
.markdown-content {
  line-height: 1.6;
}

.markdown-content p {
  margin: 0 0 8px 0;
}

.markdown-content p:last-child {
  margin-bottom: 0;
}

.markdown-content strong {
  font-weight: 600;
}

.markdown-content em {
  font-style: italic;
}

.markdown-content code {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  font-size: 13px;
}

.message.user .markdown-content code {
  background: rgba(255, 255, 255, 0.2);
}

.markdown-content pre {
  background: rgba(0, 0, 0, 0.05);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  margin: 8px 0;
}

.markdown-content pre code {
  background: none;
  padding: 0;
}

.markdown-content ul,
.markdown-content ol {
  margin: 8px 0;
  padding-left: 24px;
}

.markdown-content li {
  margin: 4px 0;
}

.markdown-content a {
  color: #667eea;
  text-decoration: underline;
}

.message.user .markdown-content a {
  color: white;
  text-decoration: underline;
}

.markdown-content blockquote {
  border-left: 3px solid #667eea;
  padding-left: 12px;
  margin: 8px 0;
  color: #6b7280;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3 {
  margin: 12px 0 8px 0;
  font-weight: 600;
}

.markdown-content h1 {
  font-size: 18px;
}

.markdown-content h2 {
  font-size: 16px;
}

.markdown-content h3 {
  font-size: 14px;
}

.message-time {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
  padding: 0 4px;
}

/* Loading bubble */
.loading-bubble {
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  border-bottom-left-radius: 4px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: float-bubble 2s ease-in-out infinite;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.bubble-text {
  color: white;
  font-size: 14px;
  font-weight: 500;
  animation: fade-text 1.6s ease-in-out infinite;
}

.bubble-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.bubble-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
  animation: bounce-dot 1.4s infinite;
}

.bubble-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.bubble-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes float-bubble {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-5px);
  }
}

@keyframes fade-text {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes bounce-dot {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

/* Input */
.chat-input {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #e5e7eb;
  align-items: flex-end;
}

.chat-input textarea {
  flex: 1;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  max-height: 120px;
  line-height: 1.5;
}

.chat-input textarea:focus {
  outline: none;
  border-color: #667eea;
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #667eea;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-2px);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* Scrollbar */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Mobile responsive */
@media (max-width: 640px) {
  .chat-container {
    bottom: 90px;
    right: 12px;
    left: 12px;
    width: auto;
    max-width: none;
  }
}
</style>

