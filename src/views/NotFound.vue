<template>
  <div class="notfound">
    <h1>404 — Not Found</h1>
    <p class="muted">The page you requested doesn't exist.</p>
    <router-link class="btn" to="/">Go home</router-link>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.notfound {
  padding: 60px;
  text-align: center;
}
.muted {
  color: #6b7280;
  margin-bottom: 20px;
}
.btn {
  background: #0284c7;
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  text-decoration: none;
}
</style>
