import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useContactStore } from '../contacts'
import apiClient from '@/api/index'
import type { IContact } from '@/types/index'

// Mock API client
vi.mock('@/api/index')

// Helper to create mock contact
const createMockContact = (overrides: Partial<IContact> = {}): IContact => ({
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phoneNumber: '555-0100',
  company: 'Acme Corp',
  notes: 'Important client',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides
})

describe('Contact Store - High Value Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Fetch Contacts', () => {
    it('successfully loads contacts from API', async () => {
      const store = useContactStore()
      const mockContacts = [
        createMockContact({ id: 1, firstName: 'Alice' }),
        createMockContact({ id: 2, firstName: 'Bob' })
      ]

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockContacts }
      })

      await store.fetchContacts()

      expect(store.contacts).toHaveLength(2)
      expect(store.contacts[0]?.firstName).toBe('Alice')
      expect(store.contactCount).toBe(2)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('handles empty contact list (404) gracefully', async () => {
      const store = useContactStore()

      vi.mocked(apiClient.get).mockRejectedValueOnce({
        response: { status: 404 }
      })

      await store.fetchContacts()

      expect(store.contacts).toHaveLength(0)
      expect(store.contactCount).toBe(0)
      expect(store.loading).toBe(false)
    })

    it('handles API errors with proper error message', async () => {
      const store = useContactStore()
      const errorMessage = 'Network error'

      vi.mocked(apiClient.get).mockRejectedValueOnce({
        message: errorMessage
      })

      await store.fetchContacts()

      expect(store.error).toBe(errorMessage)
      expect(store.loading).toBe(false)
    })
  })

  describe('Add Contact', () => {
    it('successfully creates a new contact and adds to list', async () => {
      const store = useContactStore()
      const newContact = createMockContact({ id: 3, firstName: 'Charlie' })

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: newContact }
      })

      const result = await store.addContact({
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'charlie@example.com'
      })

      expect(result).toBe(true)
      expect(store.contacts).toHaveLength(1)
      expect(store.contacts[0]?.firstName).toBe('Charlie')
      expect(store.loading).toBe(false)
    })

    it('handles duplicate contact creation failure', async () => {
      const store = useContactStore()

      vi.mocked(apiClient.post).mockRejectedValueOnce({
        response: { data: { message: 'Contact with this email already exists' } }
      })

      const result = await store.addContact({
        email: 'existing@example.com'
      })

      expect(result).toBe(false)
      expect(store.error).toBe('Contact with this email already exists')
      expect(store.contacts).toHaveLength(0)
    })
  })

  describe('Update Contact', () => {
    it('successfully updates contact and refreshes list', async () => {
      const store = useContactStore()
      store.contacts = [createMockContact({ id: 1, firstName: 'John' })]

      const updatedContact = createMockContact({ id: 1, firstName: 'Jonathan' })

      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { status: 'Success' }
      })

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: [updatedContact] }
      })

      const result = await store.updateContact(1, { firstName: 'Jonathan' })

      expect(result).toBe(true)
      expect(store.contacts[0]?.firstName).toBe('Jonathan')
    })

    it('handles update failure gracefully', async () => {
      const store = useContactStore()
      store.contacts = [createMockContact({ id: 1 })]

      vi.mocked(apiClient.patch).mockRejectedValueOnce({
        response: { data: { message: 'Contact not found' } }
      })

      const result = await store.updateContact(1, { firstName: 'Updated' })

      expect(result).toBe(false)
      expect(store.error).toBe('Contact not found')
    })
  })

  describe('Critical Business Logic: Search & Filter', () => {
    beforeEach(() => {
      const store = useContactStore()
      store.contacts = [
        createMockContact({ id: 1, firstName: 'Alice', lastName: 'Anderson', email: 'alice@example.com', company: 'TechCorp' }),
        createMockContact({ id: 2, firstName: 'Bob', lastName: 'Brown', email: 'bob@example.com', company: 'DesignLab' }),
        createMockContact({ id: 3, firstName: 'Charlie', lastName: 'Chen', email: 'charlie@techcorp.com', company: 'TechCorp' }),
        createMockContact({ id: 4, firstName: 'Diana', lastName: 'Davis', email: 'diana@example.com', phoneNumber: '555-9999' })
      ]
    })

    it('filters contacts by first name (case-insensitive)', () => {
      const store = useContactStore()
      store.searchQuery = 'alice'

      expect(store.filteredContacts).toHaveLength(1)
      expect(store.filteredContacts[0]?.firstName).toBe('Alice')
    })

    it('filters contacts by last name (case-insensitive)', () => {
      const store = useContactStore()
      store.searchQuery = 'BROWN'

      expect(store.filteredContacts).toHaveLength(1)
      expect(store.filteredContacts[0]?.lastName).toBe('Brown')
    })

    it('filters contacts by email', () => {
      const store = useContactStore()
      store.searchQuery = 'charlie@'

      expect(store.filteredContacts).toHaveLength(1)
      expect(store.filteredContacts[0]?.email).toContain('charlie@')
    })

    it('filters contacts by company', () => {
      const store = useContactStore()
      store.searchQuery = 'TechCorp'

      expect(store.filteredContacts).toHaveLength(2)
      expect(store.filteredContacts.every(c => c.company === 'TechCorp')).toBe(true)
    })

    it('filters contacts by phone number', () => {
      const store = useContactStore()
      store.searchQuery = '555-9999'

      expect(store.filteredContacts).toHaveLength(1)
      expect(store.filteredContacts[0]?.phoneNumber).toBe('555-9999')
    })

    it('returns all contacts when search query is empty', () => {
      const store = useContactStore()
      store.searchQuery = ''

      expect(store.filteredContacts).toHaveLength(4)
    })

    it('returns empty array when no matches found', () => {
      const store = useContactStore()
      store.searchQuery = 'nonexistent'

      expect(store.filteredContacts).toHaveLength(0)
    })

    it('handles partial matches across multiple fields', () => {
      const store = useContactStore()
      store.searchQuery = 'a' // Should match Alice, Anderson, Diana, Davis, DesignLab

      expect(store.filteredContacts.length).toBeGreaterThan(0)
      expect(store.filteredContacts.some(c => c.firstName === 'Alice')).toBe(true)
      expect(store.filteredContacts.some(c => c.firstName === 'Diana')).toBe(true)
    })
  })

  describe('Critical Business Logic: Delete & Undo', () => {
    it('successfully deletes contact and moves to backup', async () => {
      const store = useContactStore()
      const contact = createMockContact({ id: 1 })
      store.contacts = [contact]

      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { status: 'Success' }
      })

      const result = await store.deleteContact(1)

      expect(result).toBe(true)
      expect(store.contacts).toHaveLength(0)
      expect(store.contactCount).toBe(0)
    })

    it('allows undoing a delete before API call', async () => {
      const store = useContactStore()
      const contact = createMockContact({ id: 1, firstName: 'John' })
      store.contacts = [contact]

      // Delete with skipApi=true (optimistic)
      await store.deleteContact(1, true)

      expect(store.contacts).toHaveLength(0)

      // Undo the delete
      store.undoDelete(1)

      expect(store.contacts).toHaveLength(1)
      expect(store.contacts[0]?.firstName).toBe('John')
    })

    it('restores contact when API delete fails', async () => {
      const store = useContactStore()
      const contact = createMockContact({ id: 1, firstName: 'Jane' })
      store.contacts = [contact]

      vi.mocked(apiClient.patch).mockRejectedValueOnce({
        response: { data: { message: 'Server error' } }
      })

      const result = await store.deleteContact(1)

      expect(result).toBe(false)
      expect(store.contacts).toHaveLength(1)
      expect(store.contacts[0]?.firstName).toBe('Jane')
      expect(store.error).toBe('Server error')
    })
  })

  describe('Critical Business Logic: Bulk Operations', () => {
    beforeEach(() => {
      const store = useContactStore()
      store.contacts = [
        createMockContact({ id: 1, firstName: 'Alice' }),
        createMockContact({ id: 2, firstName: 'Bob' }),
        createMockContact({ id: 3, firstName: 'Charlie' }),
        createMockContact({ id: 4, firstName: 'Diana' })
      ]
    })

    it('performs optimistic bulk delete', () => {
      const store = useContactStore()
      const idsToDelete = [1, 2, 3]

      store.bulkDeleteOptimistic(idsToDelete)

      expect(store.contacts).toHaveLength(1)
      expect(store.contacts[0]?.firstName).toBe('Diana')
      expect(store.selectedIds.size).toBe(0) // Selection cleared
    })

    it('successfully performs bulk delete via API', async () => {
      const store = useContactStore()
      
      // First do optimistic delete
      store.bulkDeleteOptimistic([1, 2])

      // Mock successful API calls
      vi.mocked(apiClient.patch)
        .mockResolvedValueOnce({ data: { status: 'Success' } })
        .mockResolvedValueOnce({ data: { status: 'Success' } })

      const result = await store.bulkDelete([1, 2])

      expect(result.count).toBe(2)
      expect(result.ids).toEqual([1, 2])
    })

    it('handles partial bulk delete failure', async () => {
      const store = useContactStore()
      
      // Optimistic delete
      store.bulkDeleteOptimistic([1, 2, 3])

      // Mock mixed results: first succeeds, second fails, third succeeds
      vi.mocked(apiClient.patch)
        .mockResolvedValueOnce({ data: { status: 'Success' } })
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: { status: 'Success' } })

      const result = await store.bulkDelete([1, 2, 3])

      expect(result.count).toBe(2) // Only 2 succeeded
      expect(store.contacts.some(c => c.id === 2)).toBe(true) // Failed one restored
    })

    it('allows undoing bulk delete', () => {
      const store = useContactStore()
      
      store.bulkDeleteOptimistic([1, 2])
      expect(store.contacts).toHaveLength(2)

      store.undoBulkDelete([1, 2])
      expect(store.contacts).toHaveLength(4)
    })
  })

  describe('Critical Business Logic: Selection Management', () => {
    it('toggles contact selection correctly', () => {
      const store = useContactStore()

      store.toggleSelect(1)
      expect(store.selectedIds.has(1)).toBe(true)
      expect(store.selectedCount).toBe(1)
      expect(store.hasSelected).toBe(true)

      store.toggleSelect(1)
      expect(store.selectedIds.has(1)).toBe(false)
      expect(store.selectedCount).toBe(0)
      expect(store.hasSelected).toBe(false)
    })

    it('manages multiple selections', () => {
      const store = useContactStore()

      store.toggleSelect(1)
      store.toggleSelect(2)
      store.toggleSelect(3)

      expect(store.selectedCount).toBe(3)
      expect(store.selectedIds.has(1)).toBe(true)
      expect(store.selectedIds.has(2)).toBe(true)
      expect(store.selectedIds.has(3)).toBe(true)
    })

    it('clears all selections', () => {
      const store = useContactStore()

      store.toggleSelect(1)
      store.toggleSelect(2)
      expect(store.selectedCount).toBe(2)

      store.clearSelection()
      expect(store.selectedCount).toBe(0)
      expect(store.hasSelected).toBe(false)
    })
  })

  describe('Trash Management', () => {
    it('fetches trash contacts successfully', async () => {
      const store = useContactStore()
      const trashedContacts = [
        createMockContact({ id: 5, firstName: 'Trashed' })
      ]

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { status: 'Success', data: trashedContacts }
      })

      await store.fetchTrash()

      expect(store.trashContacts).toHaveLength(1)
      expect(store.trashCount).toBe(1)
      expect(store.trashLoading).toBe(false)
    })

    it('successfully restores contact from trash', async () => {
      const store = useContactStore()
      const trashedContact = createMockContact({ id: 5 })
      store.trashContacts = [trashedContact]

      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { status: 'Success' }
      })

      const result = await store.restoreContact(5)

      expect(result).toBe(true)
      expect(store.trashContacts).toHaveLength(0)
    })

    it('handles trash restore failure', async () => {
      const store = useContactStore()
      store.trashContacts = [createMockContact({ id: 5 })]

      vi.mocked(apiClient.patch).mockRejectedValueOnce({
        response: { data: { message: 'Restore failed' } }
      })

      const result = await store.restoreContact(5)

      expect(result).toBe(false)
      expect(store.trashContacts).toHaveLength(1) // Not removed
      expect(store.error).toBe('Restore failed')
    })

    it('manages trash selection independently', () => {
      const store = useContactStore()

      store.toggleTrashSelect(5)
      store.toggleTrashSelect(6)

      expect(store.trashSelectedCount).toBe(2)
      expect(store.hasTrashSelected).toBe(true)
      expect(store.trashSelectedIds.has(5)).toBe(true)

      store.clearTrashSelection()
      expect(store.trashSelectedCount).toBe(0)
    })
  })

  describe('Data Integrity: Sorting', () => {
    it('sorts contacts by first name', () => {
      const store = useContactStore()
      store.contacts = [
        createMockContact({ id: 1, firstName: 'Zoe' }),
        createMockContact({ id: 2, firstName: 'Alice' }),
        createMockContact({ id: 3, firstName: 'Bob' })
      ]

      store.sortContacts('firstName')

      expect(store.contacts[0]?.firstName).toBe('Alice')
      expect(store.contacts[1]?.firstName).toBe('Bob')
      expect(store.contacts[2]?.firstName).toBe('Zoe')
    })

    it('sorts contacts by date created', () => {
      const store = useContactStore()
      store.contacts = [
        createMockContact({ id: 1, createdAt: new Date('2024-03-01') }),
        createMockContact({ id: 2, createdAt: new Date('2024-01-01') }),
        createMockContact({ id: 3, createdAt: new Date('2024-02-01') })
      ]

      store.sortContacts('createdAt')

      expect(store.contacts[0]?.id).toBe(2) // Earliest date
      expect(store.contacts[2]?.id).toBe(1) // Latest date
    })
  })

  describe('User Experience: Contact Detail Modal', () => {
    it('opens contact detail in view mode', () => {
      const store = useContactStore()
      const contact = createMockContact({ id: 1 })

      store.openContactDetail(contact, false)

      expect(store.showContactDetail).toBe(true)
      expect(store.selectedContact).toEqual(contact)
      expect(store.openInEditMode).toBe(false)
    })

    it('opens contact detail in edit mode', () => {
      const store = useContactStore()
      const contact = createMockContact({ id: 1 })

      store.openContactDetail(contact, true)

      expect(store.showContactDetail).toBe(true)
      expect(store.selectedContact).toEqual(contact)
      expect(store.openInEditMode).toBe(true)
    })

    it('closes contact detail and clears state', () => {
      const store = useContactStore()
      const contact = createMockContact({ id: 1 })

      store.openContactDetail(contact, true)
      store.closeContactDetail()

      expect(store.showContactDetail).toBe(false)
      expect(store.selectedContact).toBeNull()
      expect(store.openInEditMode).toBe(false)
    })
  })

  describe('User Experience: View Management', () => {
    it('switches between different view modes', () => {
      const store = useContactStore()

      expect(store.currentView).toBe('list')

      store.setView('grid')
      expect(store.currentView).toBe('grid')

      store.setView('small')
      expect(store.currentView).toBe('small')
    })
  })
})
