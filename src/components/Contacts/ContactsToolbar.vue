<template>
  <div class="toolbar">
    <div style="display:flex;gap:8px">
      <button @click="changeView('list')" :class="['btn', view==='list' ? '' : '']">List</button>
      <button @click="changeView('grid')" :class="['btn', view==='grid' ? '' : '']">Grid</button>
      <button @click="changeView('small')" :class="['btn', view==='small' ? '' : '']">Small</button>
    </div>

    <div style="margin-left:auto;display:flex;gap:8px">
      <button class="dropdown" @click="$emit('filter')">Filter ▾</button>
      <button class="btn">Add Contact</button>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['update:view','filter'])
function changeView(v){ emit('update:view', v) }
</script>

