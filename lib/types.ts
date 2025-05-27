export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  folderId: string | null;
  synced: boolean;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
  synced: boolean;
}

export interface User {
  email: string | null;
  name: string | null;
  picture: string | null;
  isAuthenticated: boolean;
}