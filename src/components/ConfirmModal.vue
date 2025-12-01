<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-backdrop" @click.self="handleCancel">
        <div class="confirm-modal" @click.stop>
          <div class="modal-icon" :class="variant">
            <svg v-if="variant === 'danger'" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M5 6v12a2 2 0 002 2h10a2 2 0 002-2V6m-4 0V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>

          <div class="modal-content">
            <h3>{{ title }}</h3>
            <p>{{ message }}</p>
          </div>

          <div class="modal-actions">
            <button @click="handleCancel" class="btn-cancel">Cancel</button>
            <button @click="handleConfirm" class="btn-confirm" :class="variant">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

interface Props {
  title?: string
  message: string
  confirmText?: string
  variant?: 'danger' | 'primary'
}

withDefaults(defineProps<Props>(), {
  title: 'Confirm Action',
  confirmText: 'Confirm',
  variant: 'primary'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const isOpen = ref(false)

// Handle escape key
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isOpen.value) {
    handleCancel()
  }
}

// Prevent body scroll when modal is open
watch(isOpen, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
    // Close any open context menus by dispatching a click event
    document.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    // Add escape key listener
    document.addEventListener('keydown', handleEscape)
  } else {
    document.body.style.overflow = ''
    // Remove escape key listener
    document.removeEventListener('keydown', handleEscape)
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (isOpen.value) {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', handleEscape)
  }
})

const open = () => {
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

const handleConfirm = () => {
  emit('confirm')
  close()
}

const handleCancel = () => {
  emit('cancel')
  close()
}

defineExpose({ open, close })
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 20px;
  backdrop-filter: blur(2px);
}

.confirm-modal {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 420px;
  padding: 32px;
}

.modal-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.modal-icon.danger {
  background: #fee2e2;
  color: #dc2626;
}

.modal-icon.primary {
  background: var(--soft-blue);
  color: var(--accent);
}

.modal-content {
  text-align: center;
  margin-bottom: 24px;
}

.modal-content h3 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.modal-content p {
  margin: 0;
  font-size: 15px;
  color: #6b7280;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel,
.btn-confirm {
  flex: 1;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-cancel:hover {
  background: #e5e7eb;
  color: #4b5563;
}

.btn-confirm.primary {
  background: var(--accent);
  color: white;
}

.btn-confirm.primary:hover {
  background: #2d8ae0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(58, 160, 255, 0.3);
}

.btn-confirm.danger {
  background: #dc2626;
  color: white;
}

.btn-confirm.danger:hover {
  background: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .confirm-modal,
.modal-leave-active .confirm-modal {
  transition: transform 0.2s ease;
}

.modal-enter-from .confirm-modal,
.modal-leave-to .confirm-modal {
  transform: scale(0.95);
}
</style>

