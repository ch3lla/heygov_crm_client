<template>
    <div class="trash-view">
      <MainHeader title="Trash" />
      
      <div class="trash-content">
        <div v-if="contactStore.trashLoading" class="loading-state">
          Loading trash...
        </div>
  
        <div v-else-if="contactStore.trashContacts.length === 0" class="empty-state">
          <div class="empty-icon">🗑️</div>
          <h3>Trash is empty</h3>
          <p>Contacts you delete will appear here.</p>
        </div>
  
        <div v-else>
          <div v-if="contactStore.hasTrashSelected" class="bulk-actions">
            <span class="selected-count">{{ contactStore.trashSelectedCount }} selected</span>
            <div class="action-buttons">
              <button @click="handleBulkRestore" class="btn btn-primary">
                Restore Selected
              </button>
              <button @click="contactStore.clearTrashSelection()" class="btn btn-text">
                Cancel
              </button>
            </div>
          </div>
  
          <div class="trash-list">
            <TrashRow 
              v-for="contact in contactStore.trashContacts" 
              :key="contact.id" 
              :contact="contact" 
            />
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { onMounted } from 'vue';
  import { useContactStore } from '@/stores/contacts';
  import { toast } from '@/utils/toast';
  import MainHeader from '@/components/MainHeader.vue';
  import TrashRow from '@/components/Contacts/TrashRow.vue';
  
  const contactStore = useContactStore()
  
  const handleBulkRestore = async () => {
    const result = await contactStore.bulkRestoreFromTrash()
    if (result.count > 0) {
      toast.success(`Successfully restored ${result.count == 1 ? 'contact' : `${result.count} contacts`}`)
    } else {
      toast.error('Failed to restore contacts')
    }
  }
  
  onMounted(() => {
    contactStore.fetchTrash()
  })
  </script>
  
  <style scoped>
  .trash-view {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f3f4f6;
  }
  
  .trash-content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
  }
  
  .loading-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    color: #6b7280;
  }
  
  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  .bulk-actions {
    background: white;
    padding: 12px 24px;
    border-radius: 8px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    animation: slideDown 0.2s ease-out;
  }
  
  .selected-count {
    font-weight: 500;
    color: #111827;
  }
  
  .action-buttons {
    display: flex;
    gap: 12px;
  }
  
  .trash-list {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  .btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }
  
  .btn-primary {
    background-color: #3b82f6;
    color: white;
  }
  
  .btn-primary:hover {
    background-color: #2563eb;
  }
  
  .btn-text {
    background: transparent;
    color: #6b7280;
  }
  
  .btn-text:hover {
    background-color: #f3f4f6;
    color: #374151;
  }
  
  @keyframes slideDown {
    from {
      transform: translateY(-10px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  </style>