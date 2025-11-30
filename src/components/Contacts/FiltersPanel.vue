<template>
  <div class="filter-panel">
    <h3>Filters</h3>
    <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px">
      <label>Tags</label>
      <input placeholder="comma-separated" v-model="local.tags" />
      <label>Min score</label>
      <input type="number" v-model.number="local.minScore" />
      <button style="margin-top:10px" @click="apply">Apply</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useContactStore } from '@/stores/contacts'
const store = useContactStore()
const local = reactive({ tags:'', minScore:0 })
function apply(){
  const tags = local.tags.split(',').map(t=>t.trim()).filter(Boolean)
  // Note: filters functionality needs to be added to the store
  // store.filters.tags = tags
  // could also filter store.contacts here or emit event
}
</script>
