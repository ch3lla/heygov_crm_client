# HeyGov CRM Frontend

A mini Customer Relationship Management (CRM) frontend built with Vue 3, Vite, and TypeScript. It features contact management, a trash bin for soft deletes, and an integrated AI Assistant.

## Getting Started

### Prerequisites
* Node.js (v20+ recommended)
* A running backend instance (configured via `.env`)

### Installation

1.  **Install dependencies:**
    ```sh
    npm install
    ```

2.  **Environment Setup:**
    Ensure your `.env` file maps `VITE_SERVER_URL` to your backend API.

3.  **Run Development Server:**
    ```sh
    npm run dev
    ```
    The app will start at `http://localhost:5173` (or the port specified by Vite).

4.  **Build for Production:**
    ```sh
    npm run build
    ```

### Running Tests

This project uses Vitest for unit testing:

```sh
npm run test:unit
```

## Architecture & Component Map

The application is structured around **Views** (Pages handled by the Router) and **Components** (Reusable UI elements).


### 1. Core Layout (`App.vue`)
This is the root entry point. It handles the global layout and global modals.
* **Renders:** `<RouterView />` (The active page)
* **Components:**
    * `UserProfile.vue`: The slide-out sidebar for managing user profile settings, password updates, and logging out.

### 2. Authentication Views
* **`LoginView.vue`**: Handles user sign-in.
* **`RegisterView.vue`**: Handles new user account creation.
* *Note:* These views redirect to `/` if the user is already authenticated via `Pinia` auth store.

### 3. Dashboard / Contacts (`ContactsView.vue`)
This is the main route (`/`). It serves as the central hub for managing data.
* **Route:** `/`
* **Key Features:** Searching, Sorting, View Switching (List/Grid), AI Widget.
* **Child Components:**
    * `MainHeader.vue`: Contains the search bar, sort dropdown, view switcher icons, and the "Add Contact" button.
    * `ContactsTable.vue`: The container that renders the data based on the selected view.
        * `ContactRow.vue`: Renders a single contact in "List" or "Small" mode. Includes `ContactContextMenu.vue` for actions like Edit/Delete.
        * `ContactCard.vue`: Renders a single contact in "Grid" mode.
    * `ContactDetailModal.vue`: A modal for viewing details or editing a contact. It handles "Edit Mode" and optimistic UI updates.
    * `AssistantWidget.vue`: The floating action button (FAB) that toggles the AI chat.
    * `AssistantChat.vue`: The actual chat interface for the AI Agent.

### 4. Add Contact (`ContactAdd.vue`)
A dedicated full-page form for creating new contacts.
* **Route:** `/add`
* **Functionality:** Validates input and communicates with `ContactStore` to create entries.

### 5. Trash Bin (`TrashView.vue`)
Manages soft-deleted contacts with bulk restore capabilities.
* **Route:** `/trash`
* **Child Components:**
    * `MainHeader.vue`: Reused for consistent styling.
    * `TrashRow.vue`: Represents a deleted contact with options to restore it.
    * `ConfirmModal.vue`: A reusable modal triggered when confirming actions (used globally across the app).

## 🛠 State Management (Pinia)
The app uses three main stores:
1.  **Auth Store (`auth.ts`)**: Manages JWT tokens, login/register logic, and user profile state. Persists to LocalStorage.
2.  **Contacts Store (`contacts.ts`)**: Handles fetching, filtering, sorting, CRUD operations, and optimistic UI updates for contacts and trash. Persists to LocalStorage.
3.  **Assistant Store (`assistant.ts`)**: Manages the chat history and open/close state of the AI widget. Persists to SessionStorage.