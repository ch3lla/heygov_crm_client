<template>
  <div class="contact-row" :class="{ 'small': small }">
    <div class="checkbox-cell">
      <input 
        type="checkbox" 
        :checked="contactStore.trashSelectedIds.has(contact.id)"
        @change="contactStore.toggleTrashSelect(contact.id)"
      />
    </div>
    
    <div class="contact-info">
      <div class="name">{{ contact.firstName }} {{ contact.lastName }}</div>
      <div class="contact-details">
        <span v-if="contact.email" class="email">{{ contact.email }}</span>
        <span v-if="contact.phoneNumber" class="phone">{{ contact.phoneNumber }}</span>
        <span v-if="contact.company" class="company">{{ contact.company }}</span>
      </div>
      <div v-if="contact.notes && !small" class="notes">
        {{ truncatedNotes }}
      </div>
    </div>

    <div class="actions">
      <div class="menu-container" @click.stop>
        <button class="menu-btn" @click="toggleMenu" ref="triggerRef">⋯</button>
        <Teleport to="body">
          <Transition name="dropdown">
            <div 
              v-if="isMenuOpen" 
              class="context-menu" 
              ref="menuRef"
              :style="menuStyle"
            >
              <button @click="handleRestore" class="menu-item">
                Restore
              </button>
            </div>
          </Transition>
        </Teleport>
      </div>
    </div>

    <!-- Confirm Restore Modal -->
    <ConfirmModal
      ref="confirmModal"
      title="Restore Contact"
      :message="`Are you sure you want to restore ${contact.firstName} ${contact.lastName}?`"
      confirm-text="Restore"
      variant="primary"
      @confirm="confirmRestore"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { IContact } from '@/types'
import { useContactStore } from '@/stores/contacts'
import { toast } from '@/utils/toast'
import ConfirmModal from '@/components/ConfirmModal.vue'

const props = defineProps<{ contact: IContact, small?: boolean }>()
const contactStore = useContactStore()
const confirmModal = ref<InstanceType<typeof ConfirmModal> | null>(null)
const isMenuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLButtonElement | null>(null)
const menuPosition = ref({ top: 0, left: 0 })

const menuStyle = computed(() => ({
  top: `${menuPosition.value.top}px`,
  left: `${menuPosition.value.left}px`
}))

const truncatedNotes = computed(() => {
  if (!props.contact.notes) return ''
  return props.contact.notes.length > 100 
    ? props.contact.notes.substring(0, 100) + '...' 
    : props.contact.notes
})

const calculatePosition = () => {
  if (!triggerRef.value) return

  const rect = triggerRef.value.getBoundingClientRect()
  const menuWidth = 140
  const menuHeight = 50
  
  let top = rect.bottom + 4
  let left = rect.right - menuWidth
  
  if (left < 8) {
    left = 8
  }
  
  if (left + menuWidth > window.innerWidth - 8) {
    left = window.innerWidth - menuWidth - 8
  }
  
  if (top + menuHeight > window.innerHeight - 8) {
    top = rect.top - menuHeight - 4
  }
  
  menuPosition.value = { top, left }
}

const toggleMenu = () => {
  if (!isMenuOpen.value) {
    calculatePosition()
  }
  isMenuOpen.value = !isMenuOpen.value
}

const handleRestore = () => {
  isMenuOpen.value = false
  confirmModal.value?.open()
}

const confirmRestore = async () => {
  const contactId = props.contact.id
  const contactName = `${props.contact.firstName} ${props.contact.lastName}`
  
  const success = await contactStore.restoreContact(contactId)
  
  if (success) {
    toast.success(`${contactName} restored successfully!`)
  } else {
    toast.error('Failed to restore contact. Please try again.')
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', () => {
    if (isMenuOpen.value) {
      calculatePosition()
    }
  }, true)
  window.addEventListener('resize', () => {
    if (isMenuOpen.value) {
      calculatePosition()
    }
  })
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.contact-row {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  gap: 16px;
  transition: background-color 0.2s;
}

.contact-row:hover {
  background-color: #f9fafb;
}

.contact-row.small {
  padding: 12px 16px;
}

.checkbox-cell {
  display: flex;
  align-items: center;
}

.checkbox-cell input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.name {
  font-weight: 600;
  font-size: 14px;
  color: #111827;
  margin-bottom: 4px;
}

.contact-details {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #6b7280;
  flex-wrap: wrap;
}

.email, .phone, .company {
  display: inline-flex;
  align-items: center;
}

.notes {
  margin-top: 8px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-container {
  position: relative;
}

.menu-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  color: var(--text-muted);
  transition: all 0.2s;
}

.menu-btn:hover {
  background-color: var(--soft-purple);
  color: var(--primary);
}

.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  padding: 4px;
  z-index: 9999;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  text-align: left;
  font-size: 14px;
  color: var(--text);
  cursor: pointer;
  transition: all 0.15s ease;
  border-radius: 6px;
}

.menu-item:hover {
  background-color: var(--soft-purple);
  color: var(--primary);
}

.menu-item .icon {
  font-size: 16px;
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

