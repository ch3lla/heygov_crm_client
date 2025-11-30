<template>
  <div class="assistant-widget">
    <Transition name="pulse">
      <button 
        v-if="!isChatOpen"
        @click="openChat" 
        class="widget-button"
        title="Open AI Assistant"
      >
        <span class="icon">💬</span>
        <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
      </button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAssistantStore } from '@/stores/assistant'

const assistantStore = useAssistantStore()
const unreadCount = ref(0)

const isChatOpen = computed(() => assistantStore.isChatOpen)

const openChat = () => {
  assistantStore.openChat()
}
</script>

<style scoped>
.assistant-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.widget-button {
  position: relative;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: float 3s ease-in-out infinite;
}

.widget-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.widget-button:active {
  transform: scale(0.95);
}

.icon {
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Pulse animation on enter */
.pulse-enter-active {
  animation: pulseIn 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.pulse-leave-active {
  animation: pulseOut 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes pulseIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes pulseOut {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0);
    opacity: 0;
  }
}
</style>

