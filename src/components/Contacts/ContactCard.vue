<template>
  <div class="card" @click="handleRowClick" style="flex-direction:column;align-items:flex-start;min-height:160px;padding:16px;background:var(--panel);border-radius:var(--radius);box-shadow:0 2px 6px rgba(15,23,42,0.04)">
    <div style="display:flex;gap:12px;align-items:center;width:100%">
      <div style="width:48px;height:48px;border-radius:50%;background:#e6f2ff;display:flex;align-items:center;justify-content:center">
        <span style="font-weight:600;color:var(--accent);font-size:18px">{{ initials }}</span>
      </div>
      <div style="flex:1">
        <div style="font-weight:600;font-size:16px;margin-bottom:4px">{{ contact.firstName }} {{ contact.lastName }}</div>
        <div class="small" style="color:var(--muted)">{{ contact.email }}</div>
      </div>
    </div>

    <div style="margin-top:12px;width:100%">
      <div v-if="contact.company" style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="opacity:0.5">
          <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" stroke-width="1.5"/>
          <line x1="2" y1="6" x2="14" y2="6" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        <span class="small">{{ contact.company }}</span>
      </div>
      <div v-if="contact.phoneNumber" style="display:flex;align-items:center;gap:8px">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="opacity:0.5">
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
</style>
