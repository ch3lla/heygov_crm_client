<template>
  <Transition name="modal">
    <div v-if="contactStore.showContactDetail && contactStore.selectedContact" class="modal-backdrop" @click="contactStore.closeContactDetail()">
      <div class="modal-card" @click.stop>
        <button @click="contactStore.closeContactDetail()" class="close-btn">×</button>
        
        <div class="modal-header">
          <div class="avatar-large">
            {{ initials }}
          </div>
          <h2>
            {{ isEditMode ? 'Edit Contact' : `${contactStore.selectedContact.firstName} ${contactStore.selectedContact.lastName}` }}
          </h2>
          <div v-if="isEditMode" class="edit-badge">Editing</div>
        </div>

        <div class="modal-content">
          <!-- First Name -->
          <div class="detail-group">
            <div class="detail-label">First Name</div>
            <input 
              v-if="isEditMode"
              v-model="editForm.firstName"
              type="text"
              class="edit-input"
              placeholder="First Name"
            />
            <div v-else class="detail-value">
              {{ contactStore.selectedContact.firstName || '-' }}
            </div>
          </div>

          <!-- Last Name -->
          <div class="detail-group">
            <div class="detail-label">Last Name</div>
            <input 
              v-if="isEditMode"
              v-model="editForm.lastName"
              type="text"
              class="edit-input"
              placeholder="Last Name"
            />
            <div v-else class="detail-value">
              {{ contactStore.selectedContact.lastName || '-' }}
            </div>
          </div>

          <!-- Email -->
          <div class="detail-group">
            <div class="detail-label">Email</div>
            <input 
              v-if="isEditMode"
              v-model="editForm.email"
              type="email"
              class="edit-input"
              placeholder="Email"
            />
            <div v-else class="detail-value">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2.667 4.667L8 8.667l5.333-4M2.667 11.333h10.666V4.667H2.667v6.666z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <a
                v-if="contactStore.selectedContact.email"
                :href="`mailto:${contactStore.selectedContact.email}`"
                target="_blank"
                class="no-underline text-gray-800 transition transform hover:scale-105"
              >
                {{ contactStore.selectedContact.email || '-' }}
              </a>
              <span v-else>-</span>
            </div>
          </div>

          <!-- Phone Number -->
          <div class="detail-group">
            <div class="detail-label">Phone Number</div>
            <input 
              v-if="isEditMode"
              v-model="editForm.phoneNumber"
              type="tel"
              class="edit-input"
              placeholder="Phone Number"
            />
            <div v-else class="detail-value">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 3h2l1 3-1.5 1a8 8 0 005 5l1-1.5 3 1v2a1 1 0 01-1 1A10 10 0 012 4a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <a
                v-if="contactStore.selectedContact.phoneNumber"
                :href="`tel:${contactStore.selectedContact.phoneNumber}`"
                target="_blank"
                class="no-underline text-gray-800 transition transform hover:scale-105"
              >
                {{ contactStore.selectedContact.phoneNumber || '-' }}
              </a>
              <span v-else>-</span>
            </div>
          </div>

          <!-- Company -->
          <div class="detail-group full-width">
            <div class="detail-label">Company</div>
            <input 
              v-if="isEditMode"
              v-model="editForm.company"
              type="text"
              class="edit-input"
              placeholder="Company"
            />
            <div v-else class="detail-value">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" stroke-width="1.5"/>
                <line x1="2" y1="6" x2="14" y2="6" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              {{ contactStore.selectedContact.company || '-' }}
            </div>
          </div>

          <!-- Notes -->
          <div class="detail-group full-width">
            <div class="detail-label">Notes</div>
            <textarea 
              v-if="isEditMode"
              v-model="editForm.notes"
              class="edit-textarea"
              placeholder="Add notes..."
              rows="4"
            ></textarea>
            <div v-else class="detail-value notes">
              {{ contactStore.selectedContact.notes || 'No notes added' }}
            </div>
          </div>

          <!-- Only show dates in view mode -->
          <template v-if="!isEditMode">
            <div class="detail-group">
              <div class="detail-label">Created</div>
              <div class="detail-value small-text">
                {{ formatDate(contactStore.selectedContact.createdAt) }}
              </div>
            </div>

            <div class="detail-group">
              <div class="detail-label">Last Updated</div>
              <div class="detail-value small-text">
                {{ formatDate(contactStore.selectedContact.updatedAt) }}
              </div>
            </div>
          </template>
        </div>

        <div class="modal-actions">
          <!-- Edit Mode Buttons -->
          <template v-if="isEditMode">
            <button @click="handleCancel" class="action-btn cancel">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Cancel
            </button>
            <button @click="handleSave" class="action-btn save">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13.333 4L6 11.333 2.667 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Save Changes
            </button>
          </template>

          <!-- View Mode Buttons -->
          <template v-else>
            <button @click="handleEdit" class="action-btn edit">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M11.333 2A1.886 1.886 0 0114 4.667l-9 9-3.667 1 1-3.667 9-9z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Edit Contact
            </button>
            <button @click="handleDelete" class="action-btn delete">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Move to Trash
            </button>
          </template>
        </div>
      </div>

      <!-- Confirm Delete Modal -->
      <ConfirmModal
        v-if="contactStore.selectedContact"
        ref="confirmModal"
        title="Move to Trash"
        :message="`Are you sure you want to move ${contactStore.selectedContact.firstName} ${contactStore.selectedContact.lastName} to trash?`"
        confirm-text="Move to Trash"
        variant="danger"
        @confirm="confirmDelete"
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useContactStore } from '@/stores/contacts'
import { toast } from '@/utils/toast'
import ConfirmModal from '@/components/ConfirmModal.vue'

const contactStore = useContactStore()
const confirmModal = ref<InstanceType<typeof ConfirmModal> | null>(null)
const isEditMode = ref(false)

// Form data for editing
const editForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  company: '',
  notes: ''
})

// Watch for contact changes to reset form
watch(() => contactStore.selectedContact, (newContact) => {
  if (newContact) {
    editForm.value = {
      firstName: newContact.firstName || '',
      lastName: newContact.lastName || '',
      email: newContact.email || '',
      phoneNumber: newContact.phoneNumber || '',
      company: newContact.company || '',
      notes: newContact.notes || ''
    }
    // Set edit mode based on store flag
    isEditMode.value = contactStore.openInEditMode
  }
}, { immediate: true })

const initials = computed(() => {
  if (!contactStore.selectedContact) return ''
  return (
    (contactStore.selectedContact.firstName?.[0] || '').toUpperCase() +
    (contactStore.selectedContact.lastName?.[0] || '').toUpperCase()
  )
})

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleEdit = () => {
  isEditMode.value = true
}

const handleCancel = () => {
  // Reset form to original values
  if (contactStore.selectedContact) {
    editForm.value = {
      firstName: contactStore.selectedContact.firstName || '',
      lastName: contactStore.selectedContact.lastName || '',
      email: contactStore.selectedContact.email || '',
      phoneNumber: contactStore.selectedContact.phoneNumber || '',
      company: contactStore.selectedContact.company || '',
      notes: contactStore.selectedContact.notes || ''
    }
  }
  isEditMode.value = false
}

const handleSave = async () => {
  if (!contactStore.selectedContact) return
  
  // Validate required fields
  if (!editForm.value.firstName.trim() && !editForm.value.email.trim()) {
    toast.error('Either First Name or Email is required')
    return
  }
  
  const success = await contactStore.updateContact(contactStore.selectedContact.id, editForm.value)
  
  if (success) {
    toast.success('Contact updated successfully!')
    isEditMode.value = false
    // Update the selected contact in the store
    if (contactStore.selectedContact) {
      contactStore.selectedContact = {
        ...contactStore.selectedContact,
        ...editForm.value
      }
    }
  } else {
    toast.error('Failed to update contact')
  }
}

const handleDelete = () => {
  confirmModal.value?.open()
}

const confirmDelete = async () => {
  if (!contactStore.selectedContact) return
  
  const contactId = contactStore.selectedContact.id
  const contactName = `${contactStore.selectedContact.firstName} ${contactStore.selectedContact.lastName}`
  
  contactStore.closeContactDetail()
  
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
  z-index: 2000;
  padding: 20px;
}

.modal-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 32px;
  color: var(--muted);
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--soft-blue);
  color: var(--text);
}

.modal-header {
  text-align: center;
  padding: 40px 40px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--bg-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 28px;
  margin: 0 auto 16px;
  box-shadow: 0 4px 12px rgba(58, 160, 255, 0.3);
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  color: var(--text);
}

.edit-badge {
  display: inline-block;
  margin-top: 8px;
  padding: 4px 12px;
  background: #fef3c7;
  color: #92400e;
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.modal-content {
  padding: 24px 40px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-group.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 15px;
  color: var(--text);
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-value svg {
  color: var(--muted);
  flex-shrink: 0;
}

.detail-value.notes {
  white-space: pre-wrap;
  line-height: 1.6;
  padding: 12px;
  background: var(--bg);
  border-radius: 8px;
}

.detail-value.small-text {
  font-size: 13px;
  color: var(--muted);
}

.edit-input,
.edit-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 15px;
  color: var(--text);
  font-family: inherit;
  transition: all 0.2s ease;
}

.edit-input:focus,
.edit-textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(58, 160, 255, 0.1);
}

.edit-textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.6;
}

.modal-actions {
  padding: 24px 40px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-btn.edit {
  background: var(--accent);
  color: white;
  border: none;
}

.action-btn.edit:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(58, 160, 255, 0.3);
}

.action-btn.delete {
  background: transparent;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.action-btn.delete:hover {
  background: #fee2e2;
  border-color: #fca5a5;
}

.action-btn.save {
  background: #10b981;
  color: white;
  border: none;
}

.action-btn.save:hover {
  background: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.action-btn.cancel {
  background: transparent;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.action-btn.cancel:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: transform 0.2s ease;
}

.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
  transform: scale(0.9);
}

@media (max-width: 640px) {
  .modal-content {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>

