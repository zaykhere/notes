import { Note, Folder } from './types';

// Keys for localStorage
const NOTES_KEY = 'notes-app-notes';
const FOLDERS_KEY = 'notes-app-folders';

// Get notes from localStorage
export function getNotesFromStorage(): Note[] {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const notesJson = localStorage.getItem(NOTES_KEY);
    return notesJson ? JSON.parse(notesJson) : [];
  } catch (error) {
    console.error('Error reading notes from localStorage:', error);
    return [];
  }
}

// Save notes to localStorage
export function saveNotesToStorage(notes: Note[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Error saving notes to localStorage:', error);
  }
}

// Get folders from localStorage
export function getFoldersFromStorage(): Folder[] {
  if (typeof window === 'undefined') {
    return [];
  }
  
  try {
    const foldersJson = localStorage.getItem(FOLDERS_KEY);
    return foldersJson ? JSON.parse(foldersJson) : [];
  } catch (error) {
    console.error('Error reading folders from localStorage:', error);
    return [];
  }
}

// Save folders to localStorage
export function saveFoldersToStorage(folders: Folder[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
  } catch (error) {
    console.error('Error saving folders to localStorage:', error);
  }
}

// Merge notes from Google Drive with local notes
export function mergeNotes(localNotes: Note[], driveNotes: Note[]): Note[] {
  const mergedNotes = [...localNotes];
  const localNoteIds = new Set(localNotes.map(note => note.id));
  
  // Add notes from Google Drive that don't exist locally
  for (const driveNote of driveNotes) {
    if (!localNoteIds.has(driveNote.id)) {
      mergedNotes.push({
        ...driveNote,
        synced: true,
      });
    }
  }
  
  return mergedNotes;
}

// Merge folders from Google Drive with local folders
export function mergeFolders(localFolders: Folder[], driveFolders: Folder[]): Folder[] {
  const mergedFolders = [...localFolders];
  const localFolderIds = new Set(localFolders.map(folder => folder.id));
  
  // Add folders from Google Drive that don't exist locally
  for (const driveFolder of driveFolders) {
    if (!localFolderIds.has(driveFolder.id)) {
      mergedFolders.push({
        ...driveFolder,
        synced: true,
      });
    }
  }
  
  return mergedFolders;
}