<template>
  <div class="context-menu-container" ref="menuRef">
    <button @click="toggleMenu" class="menu-trigger" ref="triggerRef">⋯</button>
    
    <Teleport to="body">
      <Transition name="dropdown">
        <div 
          v-if="isOpen" 
          class="context-menu"
          :style="menuStyle"
        >
          <button @click="handleEdit" class="menu-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M11.333 2A1.886 1.886 0 0114 4.667l-9 9-3.667 1 1-3.667 9-9z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Edit
          </button>
          <button @click="handleDelete" class="menu-item delete">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Delete
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['edit', 'delete'])

const isOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const menuPosition = ref({ top: 0, left: 0 })

const menuStyle = computed(() => ({
  top: `${menuPosition.value.top}px`,
  left: `${menuPosition.value.left}px`
}))

const calculatePosition = () => {
  if (!triggerRef.value) return

  const rect = triggerRef.value.getBoundingClientRect()
  const menuWidth = 140 // min-width from CSS
  const menuHeight = 80 // approximate height
  
  // Calculate position
  let top = rect.bottom + 4
  let left = rect.right - menuWidth
  
  // Adjust if menu would go off-screen
  if (left < 8) {
    left = 8
  }
  
  if (left + menuWidth > window.innerWidth - 8) {
    left = window.innerWidth - menuWidth - 8
  }
  
  if (top + menuHeight > window.innerHeight - 8) {
    // Open upwards instead
    top = rect.top - menuHeight - 4
  }
  
  menuPosition.value = { top, left }
}

// Custom event to close all other context menus
const CLOSE_OTHER_MENUS_EVENT = 'close-other-context-menus'

const toggleMenu = () => {
  if (!isOpen.value) {
    // Close all other menus first
    window.dispatchEvent(new CustomEvent(CLOSE_OTHER_MENUS_EVENT, { 
      detail: { source: menuRef.value } 
    }))
    calculatePosition()
    isOpen.value = true
  } else {
    isOpen.value = false
  }
}

const handleEdit = () => {
  emit('edit')
  isOpen.value = false
}

const handleDelete = () => {
  emit('delete')
  isOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

const handleCloseOtherMenus = (event: CustomEvent) => {
  // Close this menu if it's not the one that triggered the event
  if (event.detail?.source !== menuRef.value && isOpen.value) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener(CLOSE_OTHER_MENUS_EVENT, handleCloseOtherMenus as EventListener)
  window.addEventListener('scroll', () => {
    if (isOpen.value) {
      calculatePosition()
    }
  }, true)
  window.addEventListener('resize', () => {
    if (isOpen.value) {
      calculatePosition()
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener(CLOSE_OTHER_MENUS_EVENT, handleCloseOtherMenus as EventListener)
})
</script>

<style scoped>
.context-menu-container {
  position: relative;
}

.menu-trigger {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  font-size: 18px;
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.menu-trigger:hover {
  color: var(--text);
}

.context-menu {
  position: fixed;
  background: var(--panel);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 4px;
  min-width: 140px;
  z-index: 9999;
}

.menu-item {
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-item:hover {
  background: var(--soft-purple);
  color: var(--primary);
}

.menu-item.delete:hover {
  background: #fee2e2;
  color: var(--error);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

