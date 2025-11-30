<template>
  <div class="row" :class="{ selected: isSelected }">
    <input 
      type="checkbox" 
      :checked="isSelected"
      @change="handleSelectToggle"
      @click.stop
      class="checkbox"
    />
    <div class="row-content" @click="handleRowClick">
      <div class="avatar-container">
        <span class="initials">{{ initials }}</span>
      </div>
      
      <div class="info-section">
        <div class="name">{{ contact.firstName }} {{ contact.lastName }}</div>
        <div class="email small">{{ contact.email }}</div>
      </div>

      <div class="company small">{{ contact.company || '-' }}</div>
      <div class="phone small">{{ contact.phoneNumber || '-' }}</div>
      
      <div v-if="contact.notes" class="notes small">{{ truncatedNotes }}</div>
      <div v-else class="notes small">-</div>

      <div class="menu-container" @click.stop>
        <ContactContextMenu @edit="handleEdit" @delete="handleDelete" />
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      ref="confirmModal"
      title="Move to Trash"
      :message="`Are you sure you want to move ${contact.firstName} ${contact.lastName} to trash?`"
      confirm-text="Move to Trash"
      variant="danger"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { IContact } from '@/types'
import { useContactStore } from '@/stores/contacts'
import { toast } from '@/utils/toast'
import ContactContextMenu from './ContactContextMenu.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const props = defineProps<{ contact: IContact, small?: boolean }>()
const contactStore = useContactStore()
const confirmModal = ref<InstanceType<typeof ConfirmModal> | null>(null)

const initials = computed(() => 
  (props.contact.firstName?.[0] || '').toUpperCase() + 
  (props.contact.lastName?.[0] || '').toUpperCase()
)

const truncatedNotes = computed(() => {
  if (!props.contact.notes) return ''
  return props.contact.notes.length > 100 
    ? props.contact.notes.substring(0, 100) + '...'
    : props.contact.notes
})

const isSelected = computed(() => 
  contactStore.selectedIds.has(props.contact.id)
)

const handleSelectToggle = () => {
  contactStore.toggleSelect(props.contact.id)
}

const handleRowClick = () => {
  contactStore.openContactDetail(props.contact)
}

const handleEdit = () => {
  // TODO: Implement edit functionality
  toast.info('Edit functionality coming soon!')
}

const handleDelete = () => {
  confirmModal.value?.open()
}

const confirmDelete = async () => {
  const contactId = props.contact.id
  const contactName = `${props.contact.firstName} ${props.contact.lastName}`
  
  // Delete immediately from UI (optimistic)
  await contactStore.deleteContact(contactId, true)
  
  // Show toast with undo button
  toast.deleteWithUndo(
    `${contactName} moved to trash`,
    () => {
      // Undo: restore contact
      contactStore.undoDelete(contactId)
    },
    5000
  )
  
  // After 5 seconds, actually delete on server
  setTimeout(async () => {
    await contactStore.deleteContact(contactId, false)
  }, 5000)
}
</script>

<style scoped>
.row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  transition: background 0.2s ease;
  border: 2px solid transparent;
}

.row:hover {
  background: var(--row-hover);
}

.row.selected {
  background: var(--soft-blue);
  border-color: var(--accent);
}

.checkbox {
  cursor: pointer;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.row-content {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
  cursor: pointer;
}

.avatar-container {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #f1f6fb;
  flex-shrink: 0;
}

.initials {
  font-weight: 600;
  color: var(--accent);
}

.info-section {
  flex: 0 0 200px;
  min-width: 0;
}

.name {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.email {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.company {
  flex: 0 0 140px;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.phone {
  flex: 0 0 120px;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notes {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--muted);
  font-style: italic;
}

.menu-container {
  flex-shrink: 0;
  width: 40px;
  text-align: right;
}
</style>
