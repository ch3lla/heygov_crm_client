import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '@/api/index';
import type { IContact } from "@/types/index";
import { useAuthStore } from '@/stores/auth';

export const useContactStore = defineStore('contacts', () => {
    const contacts = ref<IContact[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const searchQuery = ref('');
    const currentView = ref<'list' | 'grid' | 'small'>('list');
    
    // Use reactive Set wrapper to ensure it stays as a Set
    const _selectedIds = ref<Set<number>>(new Set());
    const selectedIds = computed({
        get: () => {
            // Ensure it's always a Set
            if (!(_selectedIds.value instanceof Set)) {
                _selectedIds.value = new Set();
            }
            return _selectedIds.value;
        },
        set: (val) => {
            _selectedIds.value = val instanceof Set ? val : new Set(val);
        }
    });
    
    const showContactDetail = ref(false);
    const selectedContact = ref<IContact | null>(null);
    const openInEditMode = ref(false); // Flag to open modal in edit mode
    const deletedContactsBackup = ref<IContact[]>([]); // For undo functionality
    
    // Trash state
    const trashContacts = ref<IContact[]>([]);
    
    const _trashSelectedIds = ref<Set<number>>(new Set());
    const trashSelectedIds = computed({
        get: () => {
            // Ensure it's always a Set
            if (!(_trashSelectedIds.value instanceof Set)) {
                _trashSelectedIds.value = new Set();
            }
            return _trashSelectedIds.value;
        },
        set: (val) => {
            _trashSelectedIds.value = val instanceof Set ? val : new Set(val);
        }
    });
    
    const trashLoading = ref(false);

    const contactCount = computed(() => contacts.value.length);
    const trashCount = computed(() => trashContacts.value.length);
    const trashSelectedCount = computed(() => trashSelectedIds.value.size);
    const hasTrashSelected = computed(() => trashSelectedIds.value.size > 0);
    const selectedCount = computed(() => selectedIds.value.size);
    const hasSelected = computed(() => selectedIds.value.size > 0);
    
    const setView = (view: 'list' | 'grid' | 'small') => {
        currentView.value = view;
    };

    const toggleSelect = (id: number) => {
        const newSet = new Set(selectedIds.value);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        _selectedIds.value = newSet;
    };

    const clearSelection = () => {
        _selectedIds.value = new Set();
    };

    const openContactDetail = (contact: IContact, editMode = false) => {
        selectedContact.value = contact;
        openInEditMode.value = editMode;
        showContactDetail.value = true;
    };

    const closeContactDetail = () => {
        showContactDetail.value = false;
        selectedContact.value = null;
        openInEditMode.value = false;
    };

    // Filtered contacts based on search query
    const filteredContacts = computed(() => {
        if (!searchQuery.value.trim()) {
            return contacts.value;
        }
        
        const query = searchQuery.value.toLowerCase().trim();
        return contacts.value.filter(contact => {
            return (
                contact.firstName?.toLowerCase().includes(query) ||
                contact.lastName?.toLowerCase().includes(query) ||
                contact.email?.toLowerCase().includes(query) ||
                contact.phoneNumber?.toLowerCase().includes(query) ||
                contact.company?.toLowerCase().includes(query) ||
                contact.notes?.toLowerCase().includes(query)
            );
        });
    });

    const fetchContacts = async () => {
        loading.value = true;
        error.value = null;
        try {
            const { data } = await apiClient.get('/contacts/all');
            contacts.value = data.data || [];
        } catch (err: any) {
            if (err.response && err.response.status === 404) {
                contacts.value = [];
            } else {
                error.value = err.message || 'Failed to load contacts';
            }
        } finally {
            loading.value = false;
        }
    };

    const addContact = async (payload: Partial<IContact>) => {
        loading.value = true;
        error.value = null;
        try {
            const result = await apiClient.post('/contacts/add', payload);
            if (result.data?.data) {
                contacts.value.push(result.data.data);
                return true;
            } else {
                return false;
            }
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to add contact';
            return false;
        } finally {
            loading.value = false;
        }
    };

    const updateContact = async (id: number, payload: Partial<IContact>) => {
        loading.value = true;
        error.value = null;

        try {
            const response = await apiClient.patch(`/contacts/update/${id}`, payload);
            if (response.data.status === 'Success') {
                fetchContacts();
                return true;
            } else {
                return false;
            }
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to update contact';
            return false;
        } finally {
            loading.value = false;
        }
    };

    // 4. Get Single Contact
    const getContact = async (id: number) => {
        loading.value = true;
        error.value = null;
        try {
            const { data } = await apiClient.get(`/contacts/${id}`);
            if (!data.data) {
                throw new Error('Contact not found');
            }
            return data.data;
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to fetch contact';
            return null;
        } finally {
            loading.value = false;
        }
    };

    // 5. Delete Contact (Soft Delete - Move to Trash) with undo support
    const deleteContact = async (id: number, skipApi = false) => {
        // Find and backup the contact
        const contactToDelete = contacts.value.find(c => c.id === id);
        if (!contactToDelete) return false;

        // Remove from UI immediately
        contacts.value = contacts.value.filter(c => c.id !== id);
        deletedContactsBackup.value.push(contactToDelete);

        if (skipApi) {
            return true; // For undo feature, don't call API yet
        }

        loading.value = true;
        error.value = null;

        try {
            const result = await apiClient.patch(`/contacts/remove/${id}`);
            if (result.data.status === "Success"){
                // Successfully deleted on server
                deletedContactsBackup.value = deletedContactsBackup.value.filter(c => c.id !== id);
                return true;
            } else {
                throw new Error("API reported failure to delete");
            }
        } catch (err: any) {
            // Restore contact on error
            const backup = deletedContactsBackup.value.find(c => c.id === id);
            if (backup) {
                contacts.value.push(backup);
                deletedContactsBackup.value = deletedContactsBackup.value.filter(c => c.id !== id);
            }
            error.value = err.response?.data?.message || 'Failed to delete contact';
            return false;
        } finally {
            loading.value = false;
        }
    };

    // Undo delete (restore contact)
    const undoDelete = (id: number) => {
        const backup = deletedContactsBackup.value.find(c => c.id === id);
        if (backup) {
            contacts.value.push(backup);
            deletedContactsBackup.value = deletedContactsBackup.value.filter(c => c.id !== id);
        }
    };

    // Optimistic bulk delete - just remove from UI, no API call
    const bulkDeleteOptimistic = (idsToDelete: number[]) => {
        if (idsToDelete.length === 0) return;

        // Backup and remove from UI
        const backupContacts = contacts.value.filter(c => idsToDelete.includes(c.id));
        contacts.value = contacts.value.filter(c => !idsToDelete.includes(c.id));
        deletedContactsBackup.value.push(...backupContacts);
        clearSelection();
    };

    // 6. Bulk Delete (Move multiple to trash) - API call only
    const bulkDelete = async (idsToDelete: number[]) => {
        if (idsToDelete.length === 0) return { count: 0, ids: [] };

        // Call API to actually delete
        loading.value = true;
        const results = await Promise.allSettled(
            idsToDelete.map(id => apiClient.patch(`/contacts/remove/${id}`))
        );

        // Track successful deletions
        const successfulIds = results
            .map((result, index) => result.status === 'fulfilled' ? idsToDelete[index] : null)
            .filter(id => id !== null) as number[];

        // Remove from backup for successful ones
        deletedContactsBackup.value = deletedContactsBackup.value.filter(
            c => !successfulIds.includes(c.id)
        );

        // Restore failed ones to UI
        const failedIds = idsToDelete.filter(id => !successfulIds.includes(id));
        if (failedIds.length > 0) {
            const failedContacts = deletedContactsBackup.value.filter(c => failedIds.includes(c.id));
            contacts.value.push(...failedContacts);
            deletedContactsBackup.value = deletedContactsBackup.value.filter(c => !failedIds.includes(c.id));
        }

        loading.value = false;
        return { count: successfulIds.length, ids: successfulIds };
    };

    // Undo bulk delete (restore multiple contacts)
    const undoBulkDelete = (ids: number[]) => {
        const backupToRestore = deletedContactsBackup.value.filter(c => ids.includes(c.id));
        contacts.value.push(...backupToRestore);
        deletedContactsBackup.value = deletedContactsBackup.value.filter(c => !ids.includes(c.id));
    };

    type SortField = 'firstName' | 'lastName' | 'email' | 'phoneNumber' | 'company' | 'createdAt' | 'updatedAt';
    const sortContacts = (field: SortField) => {
        contacts.value.sort((a, b) => {
            const aVal = a[field];
            const bVal = b[field];

            // Handle date fields
            if (field === 'createdAt' || field === 'updatedAt') {
                const aTime = new Date(aVal as string | Date).getTime();
                const bTime = new Date(bVal as string | Date).getTime();
                return aTime - bTime;
            }

            // Convert to string for comparison
            const aStr = String(aVal || '').toLowerCase();
            const bStr = String(bVal || '').toLowerCase();

            if (aStr < bStr) return -1;
            if (aStr > bStr) return 1;
            return 0;
        });
    };

    // Trash functions
    const toggleTrashSelect = (id: number) => {
        const newSet = new Set(trashSelectedIds.value);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        _trashSelectedIds.value = newSet;
    };

    const clearTrashSelection = () => {
        _trashSelectedIds.value = new Set();
    };

    const fetchTrash = async () => {
        trashLoading.value = true;
        error.value = null;
        try {
            const response = await apiClient.get('/contacts/trash');
            if (response.data.status === 'Success') {
                trashContacts.value = response.data.data || [];
            }
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to fetch trash';
        } finally {
            trashLoading.value = false;
        }
    };

    const restoreContact = async (id: number) => {
        trashLoading.value = true;
        error.value = null;
        try {
            const response = await apiClient.patch(`/contacts/restore/${id}`);
            trashContacts.value = trashContacts.value.filter(c => c.id !== id);
            return response.data.status === 'Success';
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to restore contact';
            return false;
        } finally {
            trashLoading.value = false;
        }
    };

    const bulkRestoreFromTrash = async () => {
        const idsToRestore = Array.from(trashSelectedIds.value);
        if (idsToRestore.length === 0) return { count: 0, ids: [] };

        trashLoading.value = true;
        error.value = null;
        let successCount = 0;

        try {
            // Restore each contact
            for (const id of idsToRestore) {
                const success = await restoreContact(id);
                if (success) successCount++;
            }

            clearTrashSelection();
            return { count: successCount, ids: idsToRestore };
        } catch (err: any) {
            error.value = err.response?.data?.message || 'Failed to restore contacts';
            return { count: successCount, ids: idsToRestore };
        } finally {
            trashLoading.value = false;
        }
    };

    // Real-time updates using SSE
    const realTimeUpdatesUsingSSE = () => {
        const authStore = useAuthStore();
        if (!authStore.token) return;

        const eventSource = new EventSource(`${import.meta.env.VITE_SERVER_URL}/sse/events?token=${authStore.token}`);
        eventSource.onmessage = (event) => {
            const { type, data } = JSON.parse(event.data);
            switch (type) {
                case 'ADD':
                    contacts.value.push(data);
                    console.log('Contact added:', data);
                    break;
                case 'UPDATE':
                    contacts.value = contacts.value.map(contact => contact.id === data.id ? data : contact);
                    console.log('Contact updated:', data);
                    break;
                case 'DELETE':
                    contacts.value = contacts.value.filter(contact => contact.id !== data.id);
                    console.log('Contact deleted:', data);
                    break;
                default:
                    break;
            }
        };

        eventSource.onerror = (event) => {
            console.error('EventSource failed:', event);
            eventSource.close();
        };
    }

    return {
    contacts,
    loading,
    error,
    searchQuery,
    currentView,
    selectedIds,
    selectedCount,
    hasSelected,
    showContactDetail,
    selectedContact,
    openInEditMode,
    contactCount,
    filteredContacts,
    setView,
    toggleSelect,
    clearSelection,
    openContactDetail,
    closeContactDetail,
    fetchContacts,
    getContact,
    addContact,
    updateContact,
    deleteContact,
    undoDelete,
    bulkDelete,
    bulkDeleteOptimistic,
    undoBulkDelete,
    sortContacts,
    // Trash
    trashContacts,
    trashSelectedIds,
    trashLoading,
    trashCount,
    trashSelectedCount,
    hasTrashSelected,
    toggleTrashSelect,
    clearTrashSelection,
    fetchTrash,
    restoreContact,
    bulkRestoreFromTrash,
    // SSE
    realTimeUpdatesUsingSSE,
    };
}, 
{
    persist: {
      key: 'contacts',
      storage: localStorage
    }
});
