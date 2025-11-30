<template>
  <div class="app-container">
    <RouterView />
    <UserProfile />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import UserProfile from "@/components/UserProfile.vue"
</script>
