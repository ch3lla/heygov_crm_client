<template>
  <div class="contacts-view">
    <MainHeader />
    
    <div class="contacts-content">
      <ContactsTable :view="contactStore.currentView" />
    </div>

    <!-- Contact Detail Modal -->
    <ContactDetailModal />

    <!-- AI Assistant -->
    <AssistantWidget />
    <AssistantChat />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import MainHeader from '@/components/MainHeader.vue'
import ContactsTable from '@/components/Contacts/ContactsTable.vue'
import ContactDetailModal from '@/components/Contacts/ContactDetailModal.vue'
import AssistantWidget from '@/components/AssistantWidget.vue'
import AssistantChat from '@/components/AssistantChat.vue'
import { useContactStore } from '@/stores/contacts'

const contactStore = useContactStore()

onMounted(() => {
  // Fetch contacts when component mounts
  contactStore.fetchContacts()
})
</script>

<style scoped>
.contacts-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  padding: 16px;
}

.contacts-content {
  flex: 1;
  overflow: auto;
  min-width: 0; /* Prevent overflow */
}

/* Responsive Design */
@media (max-width: 768px) {
  .contacts-view {
    padding: 12px;
    gap: 12px;
  }
}

@media (max-width: 640px) {
  .contacts-view {
    padding: 8px;
    gap: 8px;
  }
}
</style>

