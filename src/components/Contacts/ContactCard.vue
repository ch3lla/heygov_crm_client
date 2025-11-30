<template>
  <div class="card" @click="handleRowClick">
    <div class="card-header">
      <div class="avatar">
        <span class="initials-text">{{ initials }}</span>
      </div>
      <div class="header-info">
        <div class="name">{{ contact.firstName }} {{ contact.lastName }}</div>
        <div class="email small">{{ contact.email || '-' }}</div>
      </div>
    </div>

    <div class="card-details">
      <div v-if="contact.company" class="detail-item">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="icon">
          <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" stroke-width="1.5"/>
          <line x1="2" y1="6" x2="14" y2="6" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <span class="small">{{ contact.company }}</span>
      </div>
      <div v-if="contact.phoneNumber" class="detail-item">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="icon">
          <path d="M3 3h2l1 3-1.5 1a8 8 0 005 5l1-1.5 3 1v2a1 1 0 01-1 1A10 10 0 012 4a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <span class="small">{{ contact.phoneNumber }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { IContact } from '@/types'
import { useContactStore } from "@/stores/contacts";

const contactStore = useContactStore();
const props = defineProps<{ contact: IContact }>()
const initials = computed(() => 
  (props.contact.firstName?.[0] || '').toUpperCase() + 
  (props.contact.lastName?.[0] || '').toUpperCase()
)

const handleRowClick = () => {
  contactStore.openContactDetail(props.contact)
}
</script>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-height: 160px;
  padding: 20px;
  background: var(--panel);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: all 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.card-header {
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--soft-purple);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.initials-text {
  font-weight: 600;
  color: var(--primary);
  font-size: 18px;
}

.header-info {
  flex: 1;
  min-width: 0;
}

.name {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.email {
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-details {
  margin-top: 16px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  opacity: 0.5;
  flex-shrink: 0;
}

.detail-item .small {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Responsive Design */
@media (max-width: 640px) {
  .card {
    padding: 16px;
    min-height: 140px;
  }
  
  .avatar {
    width: 40px;
    height: 40px;
  }
  
  .initials-text {
    font-size: 16px;
  }
  
  .name {
    font-size: 15px;
  }
}
</style>
