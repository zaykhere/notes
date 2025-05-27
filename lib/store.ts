import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Note, Folder, User } from './types';

interface StoreState {
  notes: Note[];
  folders: Folder[];
  user: User;
  activeNoteId: string | null;
  activeFolderId: string | null;
  isEditing: boolean;
  isDarkMode: boolean;
  isSyncing: boolean;
  
  // Notes actions
  addNote: (note: Note) => void;
  updateNote: (id: string, data: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  setActiveNote: (id: string | null) => void;
  
  // Folders actions
  addFolder: (folder: Folder) => void;
  updateFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  setActiveFolder: (id: string | null) => void;
  
  // User actions
  setUser: (user: Partial<User>) => void;
  clearUser: () => void;
  
  // UI actions
  setEditing: (isEditing: boolean) => void;
  toggleDarkMode: () => void;
  setSyncing: (isSyncing: boolean) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      notes: [],
      folders: [],
      user: {
        email: null,
        name: null,
        picture: null,
        isAuthenticated: false,
      },
      activeNoteId: null,
      activeFolderId: null,
      isEditing: false,
      isDarkMode: false,
      isSyncing: false,
      
      // Notes actions
      addNote: (note) => set((state) => ({ 
        notes: [...state.notes, note],
        activeNoteId: note.id,
        isEditing: true,
      })),
      
      updateNote: (id, data) => set((state) => ({
        notes: state.notes.map((note) => 
          note.id === id ? { ...note, ...data, updatedAt: new Date().toISOString(), synced: false } : note
        ),
      })),
      
      deleteNote: (id) => set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
        activeNoteId: state.activeNoteId === id ? null : state.activeNoteId,
      })),
      
      setActiveNote: (id) => set({ activeNoteId: id, isEditing: false }),
      
      // Folders actions
      addFolder: (folder) => set((state) => ({ 
        folders: [...state.folders, folder],
        activeFolderId: folder.id,
      })),
      
      updateFolder: (id, name) => set((state) => ({
        folders: state.folders.map((folder) => 
          folder.id === id ? { ...folder, name, synced: false } : folder
        ),
      })),
      
      deleteFolder: (id) => set((state) => ({
        folders: state.folders.filter((folder) => folder.id !== id),
        activeFolderId: state.activeFolderId === id ? null : state.activeFolderId,
        notes: state.notes.map((note) => 
          note.folderId === id ? { ...note, folderId: null, synced: false } : note
        ),
      })),
      
      setActiveFolder: (id) => set({ activeFolderId: id }),
      
      // User actions
      setUser: (userData) => set((state) => ({ 
        user: { ...state.user, ...userData },
      })),
      
      clearUser: () => set({ 
        user: {
          email: null,
          name: null,
          picture: null,
          isAuthenticated: false,
        },
      }),
      
      // UI actions
      setEditing: (isEditing) => set({ isEditing }),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setSyncing: (isSyncing) => set({ isSyncing }),
    }),
    {
      name: 'notes-storage',
      partialize: (state) => ({
        notes: state.notes,
        folders: state.folders,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);