<template>
  <div>
    <div class="table-panel">
      <ContactsTable view="list" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ContactsTable from "@/components/Contacts/ContactsTable.vue"
</script>

<style scoped>
.toolbar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.table-panel {
  margin-top: 12px;
}
.btn {
  background: #0284c7;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  text-decoration: none;
}
</style>
