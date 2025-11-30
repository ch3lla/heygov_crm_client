<template>
  <div>
    <h3 style="margin-top:0">HeyGov CRM</h3>
    <nav style="margin-top:16px;display:flex;flex-direction:column;gap:8px">
      <RouterLink to="/" class="small">Contacts</RouterLink>
      <RouterLink to="/trash" class="small">Trash</RouterLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<style scoped>
h3 {
  color: var(--primary);
  font-weight: 700;
  margin-top: 0;
}

.small {
  background: transparent;
  border: none;
  text-align: left;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-decoration: none;
  color: var(--text);
  display: block;
  transition: all 0.2s ease;
  font-weight: 500;
}

.small:hover {
  background: var(--soft-purple);
  transform: translateX(4px);
}

.small.router-link-active {
  background: var(--soft-purple);
  color: var(--primary);
  font-weight: 600;
}
</style>
