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
        <button class="menu-btn" @click="isMenuOpen = !isMenuOpen">⋯</button>
        <Transition name="dropdown">
          <div v-if="isMenuOpen" class="context-menu" ref="menuRef">
            <button @click="handleRestore" class="menu-item">
              Restore
            </button>
          </div>
        </Transition>
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

const truncatedNotes = computed(() => {
  if (!props.contact.notes) return ''
  return props.contact.notes.length > 100 
    ? props.contact.notes.substring(0, 100) + '...' 
    : props.contact.notes
})

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
  color: #6b7280;
  transition: all 0.2s;
}

.menu-btn:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.context-menu {
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 4px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  min-width: 160px;
  z-index: 1000;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 16px;
  background: none;
  border: none;
  text-align: left;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f9fafb;
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

