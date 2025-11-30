<template>
  <div class="contacts-layout">
    <MainHeader />
    <div class="content-area">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import MainHeader from '../../components/MainHeader.vue'
</script>

<style scoped>
.contacts-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}
.content-area {
  flex: 1;
}
</style>
