<template>
  <div class="table">
    <!-- Empty State -->
    <div v-if="filteredContacts.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-person-lines-fill" viewBox="0 0 16 16">
          <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1z"/>
        </svg>
      </div>
      <h3>No Contacts Found</h3>
      <p>Start by adding your first contact or adjust your search filters.</p>
    </div>

    <!-- Grid View -->
    <template v-else-if="view === 'grid'">
      <div class="grid-view">
        <ContactCard v-for="c in filteredContacts" :key="c.id" :contact="c" />
      </div>
    </template>

    <!-- Small View -->
    <template v-else-if="view === 'small'">
      <div style="display:flex;flex-direction:column;gap:8px">
        <ContactRow v-for="c in filteredContacts" :key="c.id" :contact="c" small />
      </div>
    </template>

    <!-- List View -->
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

<style scoped>
.table {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  min-height: 400px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}

.empty-state p {
  font-size: 14px;
  color: var(--text-muted);
  max-width: 400px;
  line-height: 1.6;
}

.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* Responsive Grid */
@media (max-width: 1024px) {
  .grid-view {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .grid-view {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 12px;
  }
}

@media (max-width: 640px) {
  .grid-view {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .empty-state {
    padding: 60px 20px;
    min-height: 300px;
  }

  .empty-icon {
    font-size: 48px;
  }

  .empty-state h3 {
    font-size: 18px;
  }

  .empty-state p {
    font-size: 13px;
  }
}
</style>
