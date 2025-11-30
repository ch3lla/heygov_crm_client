<template>
  <div>
    <div class="toolbar-row">
      <h2>Contacts — Grid</h2>
      <div style="margin-left: auto">
        <router-link class="btn" to="/contacts/add">+ Add Contact</router-link>
      </div>
    </div>

    <div class="grid-panel">
      <ContactsTable view="grid" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ContactsTable from '@/components/Contacts/ContactsTable.vue'
</script>

<style scoped>
.grid-panel {
  margin-top: 16px;
}
.toolbar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.btn {
  background: #0284c7;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  text-decoration: none;
}
</style>
