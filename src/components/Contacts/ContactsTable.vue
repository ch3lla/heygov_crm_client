<template>
  <div class="table">
    <template v-if="view === 'grid'">
      <div class="grid-view">
        <ContactCard v-for="c in filteredContacts" :key="c.id" :contact="c" />
      </div>
    </template>

    <template v-else-if="view === 'small'">
      <div style="display:flex;flex-direction:column;gap:8px">
        <ContactRow v-for="c in filteredContacts" :key="c.id" :contact="c" small />
      </div>
    </template>

    <template v-else>
      <div style="display:flex;flex-direction:column;gap:8px">
        <ContactRow v-for="c in filteredContacts" :key="c.id" :contact="c" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ContactCard from './ContactCard.vue'
import ContactRow from './ContactRow.vue'
import { useContactStore } from '@/stores/contacts'
defineProps({ view: { type: String, default: 'list' }})
const store = useContactStore()
const filteredContacts = computed(()=> store.filteredContacts)
</script>
