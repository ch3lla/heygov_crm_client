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
h3{color:var(--accent)}
.small{
  background:transparent;
  border:none;
  text-align:left;
  padding:8px;
  border-radius:6px;
  cursor:pointer;
  text-decoration:none;
  color:inherit;
  display:block;
  transition: transform 0.2s ease;
}
.small:hover{
  background:var(--soft-blue);
  transform: scale(1.05);
}
.small.router-link-active{
  background:var(--soft-blue);
  font-weight:600;
}
</style>
