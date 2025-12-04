<template>
  <div>
    <div class="toolbar-row">
      <router-link to="/" class="back">← Back</router-link>
      <h2 style="margin-left: 12px">Add Contact</h2>
    </div>

    <form class="card" @submit.prevent="create">
      <div class="field">
        <label>First Name</label>
        <input :value="form.firstName" @input="stripSpaces('firstName', $event)" required />
      </div>

      <div class="field">
        <label>Last Name</label>
        <input :value="form.lastName" @input="stripSpaces('lastName', $event)" required />
      </div>

      <div class="field">
        <label>Email</label>
        <input :value="form.email" @input="stripSpaces('email', $event)" type="email" required />
      </div>

      <div class="field">
        <label>Phone Number</label>
        <input :value="form.phoneNumber" @input="stripSpaces('phoneNumber', $event)" type="tel" />
      </div>

      <div class="field">
        <label>Company</label>
        <input v-model="form.company" />
      </div>

      <div class="field">
        <label>Notes</label>
        <textarea v-model="form.notes" rows="3"></textarea>
      </div>

      <div style="display: flex; gap: 8px; margin-top: 12px">
        <button class="btn" type="submit" :disabled="contactStore.loading">
          {{ contactStore.loading ? 'Creating...' : 'Create' }}
        </button>
        <router-link class="btn-out" to="/">Cancel</router-link>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useContactStore } from '@/stores/contacts'
import { toast } from '@/utils/toast'

const router = useRouter()
const contactStore = useContactStore()
const form = reactive({ 
  firstName: '', 
  lastName: '', 
  email: '', 
  phoneNumber: '',
  company: '',
  notes: ''
})

function stripSpaces(field: keyof typeof form, event: Event) {
  const input = event.target as HTMLInputElement
  const stripped = input.value.replace(/\s/g, '')
  input.value = stripped
  form[field] = stripped
}

async function create() {
  const success = await contactStore.addContact(form)
  if (success) {
    toast.success(`Contact created successfully!`)
    router.push({ name: 'contacts' })
  } else {
    toast.error('Failed to create contact. Please try again.')
  }
}
</script>

<style scoped>
.toolbar-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.back {
  color: var(--accent);
  text-decoration: none;
  font-size: 14px;
  transition: opacity 0.2s ease;
}

.back:hover {
  opacity: 0.7;
}

.card {
  background: var(--panel);
  padding: 24px;
  border-radius: var(--radius);
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
  max-width: 640px;
}

.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.field label {
  font-size: 13px;
  color: #374151;
  margin-bottom: 6px;
  font-weight: 500;
}

.field input,
.field textarea {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e6eef8;
  font-family: inherit;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.field input:focus,
.field textarea:focus {
  border-color: var(--accent);
}

.field textarea {
  resize: vertical;
  min-height: 80px;
}

.btn {
  background: var(--accent);
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:hover:not(:disabled) {
  background: #2d8ae0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(58, 160, 255, 0.3);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-out {
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  color: #0f172a;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-out:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
}
</style>