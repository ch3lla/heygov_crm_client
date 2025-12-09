<template>
  <div class="app-container">
    <RouterView />
    <UserProfile />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import UserProfile from "@/components/UserProfile.vue"
import { useContactStore } from '@/stores/contacts';
import { useAuthStore } from '@/stores/auth';
import { onMounted } from 'vue';

const contactStore = useContactStore();
const authStore = useAuthStore();

onMounted(() => {
  if (authStore.token) {
    contactStore.realTimeUpdatesUsingSSE();
  } else {
    console.log('No token found, cannot connect to SSE');
  }
});
</script>
