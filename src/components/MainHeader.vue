<template>
  <div class="header">
    <div>
      <h2 style="margin: 0">
        {{ contactStore.hasSelected ? `${contactStore.selectedCount} Selected` : 'Contacts' }}
      </h2>
      <div class="small" v-if="!contactStore.hasSelected">
        {{ contactStore.contactCount.toLocaleString() }} Total · Sort by: 
        <div class="custom-dropdown" ref="dropdownRef">
          <button 
            @click="isDropdownOpen = !isDropdownOpen" 
            class="sort-select small badge"
          >
            {{ sortOptions.find(opt => opt.value === sortBy)?.label }}
            <span class="arrow" :class="{ open: isDropdownOpen }">▾</span>
          </button>
          <div v-if="isDropdownOpen" class="dropdown-menu">
            <button 
              v-for="option in sortOptions" 
              :key="option.value"
              @click="selectSort(option.value)"
              class="dropdown-item"
              :class="{ active: sortBy === option.value }"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </div>
      <div class="small" v-else style="color: #dc2626;">
        Click the trash button to delete selected contacts
      </div>
    </div>
    <div style="display: flex; gap: 12px; align-items: center">
      <!-- Bulk Delete Button - Only visible when contacts are selected -->
      <Transition name="fade">
        <button v-if="contactStore.hasSelected" @click="handleBulkDelete" class="bulk-delete-btn">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <!-- Move to Trash -->
        </button>
      </Transition>

      <!-- Regular Controls - Hidden when contacts are selected -->
      <Transition name="fade">
        <div v-if="!contactStore.hasSelected" style="display: flex; gap: 12px; align-items: center">
          <!-- Trash Page Button -->
          <RouterLink to="/trash" class="trash-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </RouterLink>
          
          <!-- View Switcher -->
          <div class="view-switcher">
            <button 
              @click="contactStore.setView('list')" 
              class="view-btn" 
              :class="{ active: contactStore.currentView === 'list' }"
              title="List View"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="3" width="12" height="2" rx="1" fill="currentColor"/>
                <rect x="2" y="7" width="12" height="2" rx="1" fill="currentColor"/>
                <rect x="2" y="11" width="12" height="2" rx="1" fill="currentColor"/>
              </svg>
            </button>
            <button 
              @click="contactStore.setView('grid')" 
              class="view-btn" 
              :class="{ active: contactStore.currentView === 'grid' }"
              title="Grid View"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor"/>
                <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor"/>
                <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor"/>
                <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor"/>
              </svg>
            </button>
          </div>
          
          <input v-model="contactStore.searchQuery" placeholder="Search..." class="search-input" />
          <RouterLink to="/add" class="add-btn">+ Add Contact</RouterLink>
        </div>
      </Transition>
      
      <!-- User Avatar - Always visible -->
      <div class="user-avatar" @click="authStore.toggleProfile()" :title="authStore.getFullName()">
        <div class="avatar-circle">
          {{ authStore.getInitials() }}
        </div>
      </div>
    </div>

    <!-- Bulk Delete Confirmation Modal -->
    <ConfirmModal
      ref="bulkDeleteModal"
      title="Move to Trash"
      :message="`Are you sure you want to move ${contactStore.selectedCount} contact(s) to trash?`"
      confirm-text="Move to Trash"
      variant="danger"
      @confirm="confirmBulkDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useContactStore } from '@/stores/contacts';
import { useAuthStore } from '@/stores/auth';
import { toast } from '@/utils/toast';
import ConfirmModal from '@/components/ConfirmModal.vue';

const contactStore = useContactStore();
const authStore = useAuthStore();
const bulkDeleteModal = ref<InstanceType<typeof ConfirmModal> | null>(null);
const sortBy = ref<'firstName' | 'lastName' | 'email' | 'phoneNumber' | 'company' | 'createdAt' | 'updatedAt'>('createdAt');
const isDropdownOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const sortOptions = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'updatedAt', label: 'Date Updated' },
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'email', label: 'Email' },
  { value: 'phoneNumber', label: 'Phone Number' },
  { value: 'company', label: 'Company' },
] as const;

const selectSort = (value: typeof sortBy.value) => {
  sortBy.value = value;
  isDropdownOpen.value = false;
  contactStore.sortContacts(value);
}

const handleBulkDelete = () => {
  bulkDeleteModal.value?.open()
}

const confirmBulkDelete = async () => {
  // Get the IDs before clearing selection
  const idsToDelete = Array.from(contactStore.selectedIds);
  if (idsToDelete.length === 0) return;

  // Remove from UI immediately and store backup
  contactStore.bulkDeleteOptimistic(idsToDelete);

  // Show toast with undo button
  toast.deleteWithUndo(
    `${idsToDelete.length} contact(s) moved to trash`,
    () => {
      // Undo: restore contacts
      contactStore.undoBulkDelete(idsToDelete);
    },
    5000
  )
  
  // After 5 seconds, actually delete on server
  setTimeout(async () => {
    await contactStore.bulkDelete(idsToDelete)
  }, 5000)
}

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.search-input {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e6eef8;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
  min-width: 250px;
}

.search-input:focus {
  border-color: var(--accent);
}

.custom-dropdown {
  position: relative;
  display: inline-block;
}

.sort-select {
  border: none;
  background: var(--soft-blue);
  color: var(--accent);
  cursor: pointer;
  outline: none;
  padding: 4px 28px 4px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(58, 160, 255, 0.1);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  position: relative;
}

.sort-select:hover {
  background-color: var(--soft-purple);
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.15);
}

.sort-select:focus {
  background-color: var(--soft-purple);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.arrow {
  font-size: 10px;
  transition: transform 0.2s ease;
  display: inline-block;
  margin-left: 2px;
}

.arrow.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  background: var(--panel);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.12);
  padding: 4px;
  min-width: 180px;
  z-index: 1000;
  animation: slideDown 0.15s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.15s ease;
  display: block;
}

.dropdown-item:hover {
  background: var(--soft-blue);
  color: var(--accent);
}

.dropdown-item.active {
  background: var(--soft-blue);
  color: var(--accent);
  font-weight: 500;
}

.add-btn {
  background: var(--accent);
  color: white;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.add-btn:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.add-btn:active {
  transform: translateY(0);
}

.view-switcher {
  display: flex;
  gap: 4px;
  background: var(--panel);
  padding: 4px;
  border-radius: 8px;
  border: 1px solid #e6eef8;
}

.view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: transparent;
  border: none;
  color: var(--muted);
  transition: all 0.2s ease;
  cursor: pointer;
}

.view-btn:hover {
  background: var(--soft-blue);
  color: var(--accent);
}

.view-btn.active {
  background: var(--accent);
  color: white;
}

.user-avatar {
  cursor: pointer;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-gradient);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.avatar-circle:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.avatar-circle:active {
  transform: scale(0.95);
}

.bulk-delete-btn {
  padding: 10px 16px;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.bulk-delete-btn:hover {
  background: #b91c1c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.bulk-delete-btn:active {
  transform: translateY(0);
}

.fade-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* When regular controls disappear (slide right) */
.fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}

.fade-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* When controls appear (slide from right) */
.fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-enter-to {
  opacity: 1;
  transform: translateX(0);
}
</style>
