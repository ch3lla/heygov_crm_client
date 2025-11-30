<template>
  <div>
    <div class="toolbar-row">
      <router-link to="/" class="back">← Back</router-link>
      <h2 style="margin-left: 12px">Contact details</h2>
    </div>

    <div v-if="contact" class="detail-card">
      <div class="header">
        <div class="avatar">{{ initials }}</div>
        <div>
          <h3>{{ contact.first }} {{ contact.last }}</h3>
          <div class="small">{{ contact.email }}</div>
        </div>
        <div style="margin-left: auto">
          <div class="badge">{{ contact.score }}</div>
        </div>
      </div>

      <div class="meta">
        <p><strong>Company:</strong> {{ contact.company }}</p>
        <p><strong>Phone:</strong> {{ contact.phone }}</p>
        <p>
          <strong>Tags:</strong>
          <span v-for="t in contact.tags" :key="t" class="tag">{{ t }}</span>
        </p>
      </div>
    </div>

    <div v-else class="empty">Contact not found</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { store } from '../../store/contacts'

const route = useRoute()
const id = Number(route.params.id)
const contact = computed(() => store.contacts.find((c) => c.id === id))
const initials = computed(() => {
  if (!contact.value) return ''
  return (
    (contact.value.first?.[0] || '').toUpperCase() + (contact.value.last?.[0] || '').toUpperCase()
  )
})
</script>

<style scoped>
.toolbar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.back {
  color: #0284c7;
  text-decoration: none;
}
.detail-card {
  background: #fff;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 64px;
  height: 64px;
  border-radius: 10px;
  background: #e6f6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}
.badge {
  background: #eaf6ff;
  padding: 6px 10px;
  border-radius: 999px;
  color: #0284c7;
}
.small {
  color: #6b7280;
}
.tag {
  background: #f3f7fb;
  padding: 4px 8px;
  border-radius: 8px;
  margin-right: 6px;
}
.empty {
  color: #6b7280;
}
</style>
