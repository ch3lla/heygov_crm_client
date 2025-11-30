<template>
  <!-- Backdrop -->
  <Transition name="fade">
    <div 
      v-if="authStore.isProfileOpen" 
      class="backdrop" 
      @click="authStore.closeProfile()"
    ></div>
  </Transition>

  <!-- Sidebar -->
  <Transition name="slide">
    <div v-if="authStore.isProfileOpen" class="profile-sidebar">
      <div class="profile-header">
        <div class="avatar-large">
          {{ authStore.getInitials() }}
        </div>
        <h3>{{ authStore.getFullName() }}</h3>
        <p class="email">{{ authStore.user?.email }}</p>
      </div>

      <div class="profile-content">
        <h4>Account Settings</h4>
        
        <form @submit.prevent="handleSave" class="settings-form">
          <div class="form-group">
            <label>First Name</label>
            <input v-model="form.firstName" type="text" required />
          </div>

          <div class="form-group">
            <label>Last Name</label>
            <input v-model="form.lastName" type="text" required />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input v-model="form.email" type="email" required />
          </div>

          <div class="form-group">
            <label>Phone Number</label>
            <input v-model="form.phoneNumber" type="tel" placeholder="+1 (555) 123-4567" />
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-save" :disabled="saving">
              {{ saving ? 'Saving...' : 'Save Changes' }}
            </button>
            <button type="button" class="btn-cancel" @click="authStore.closeProfile()">Cancel</button>
          </div>
        </form>

        <div class="divider"></div>

        <button class="btn-logout" @click="authStore.logout(); ">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M11 11L14 8M14 8L11 5M14 8H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Log Out
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { toast } from '@/utils/toast'

const authStore = useAuthStore()
const saving = ref(false)

const form = reactive({
  firstName: authStore.user?.firstName || '',
  lastName: authStore.user?.lastName || '',
  email: authStore.user?.email || '',
  phoneNumber: authStore.user?.phoneNumber || ''
})

// Update form when user data changes
watch(() => authStore.user, (newUser) => {
  if (newUser) {
    form.firstName = newUser.firstName || ''
    form.lastName = newUser.lastName || ''
    form.email = newUser.email || ''
    form.phoneNumber = newUser.phoneNumber || ''
  }
}, { deep: true })

const handleSave = async () => {
  saving.value = true
  const success = await authStore.updateUserProfile(form)
  saving.value = false
  
  if (success) {
    authStore.closeProfile()
    toast.success('Profile updated successfully!')
  } else {
    toast.error('Failed to update profile. Please try again.')
  }
}
</script>

<style scoped>
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

.profile-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: var(--panel);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.profile-header {
  background: linear-gradient(135deg, var(--accent) 0%, #2d8ae0 100%);
  padding: 32px 24px;
  color: white;
  text-align: center;
}

.avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 28px;
  margin: 0 auto 16px;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.profile-header h3 {
  margin: 0 0 4px;
  font-size: 20px;
  font-weight: 600;
}

.email {
  margin: 0 0 12px;
  font-size: 14px;
  opacity: 0.9;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}

.profile-content {
  flex: 1;
  padding: 24px;
}

.profile-content h4 {
  margin: 0 0 20px;
  color: var(--text);
  font-size: 16px;
  font-weight: 600;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.form-group input {
  padding: 10px 12px;
  border: 1px solid #e6eef8;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.form-group input:focus {
  border-color: var(--accent);
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.btn-save {
  flex: 1;
  padding: 10px 16px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-save:hover {
  background: #2d8ae0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(58, 160, 255, 0.3);
}

.btn-cancel {
  padding: 10px 16px;
  background: transparent;
  color: var(--text);
  border: 1px solid #e6eef8;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel:hover {
  background: #f8f9fa;
  border-color: #cbd5e1;
}

.divider {
  height: 1px;
  background: #e6eef8;
  margin: 24px 0;
}

.btn-logout {
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  color: #dc2626;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-logout:hover {
  background: #fef2f2;
  border-color: #fca5a5;
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-enter-active, .slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from, .slide-leave-to {
  transform: translateX(100%);
}
</style>

