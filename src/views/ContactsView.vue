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
}

.contacts-content {
  flex: 1;
  overflow: auto;
}
</style>

