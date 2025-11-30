<template>
  <div class="context-menu-container" ref="menuRef">
    <button @click="toggleMenu" class="menu-trigger">⋯</button>
    
    <Transition name="dropdown">
      <div v-if="isOpen" class="context-menu">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['edit', 'delete'])

const isOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const toggleMenu = () => {
  isOpen.value = !isOpen.value
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

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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
  color: var(--muted);
  transition: color 0.2s ease;
}

.menu-trigger:hover {
  color: var(--text);
}

.context-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  background: var(--panel);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.12);
  padding: 4px;
  min-width: 140px;
  z-index: 1000;
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
  background: var(--soft-blue);
  color: var(--accent);
}

.menu-item.delete:hover {
  background: #fee2e2;
  color: #dc2626;
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

