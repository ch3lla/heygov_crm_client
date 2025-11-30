<template>
  <div style="display:flex;gap:12px">
    <div style="flex:1;display:flex;flex-direction:column;gap:12px">
      <ContactsToolbar v-model:view="view" @filter="openFilter" />
      <ContactsTable :view="view" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ContactsToolbar from "./ContactsToolbar.vue";
import ContactsTable from "./ContactsTable.vue";
const view = ref<'list' | 'grid'>('list');
</script>
