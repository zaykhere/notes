import { Note, Folder } from './types';

// Google Drive API configuration
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

// Folder where notes are stored
const NOTES_FOLDER_NAME = 'Notes App';

export interface GoogleAuthResponse {
  success: boolean;
  user?: {
    email: string;
    name: string;
    picture: string;
  };
  error?: string;
}

class GoogleDriveService {
  private isInitialized = false;
  private notesFolder: string | null = null;

  // Initialize the Google API client
  async init(): Promise<boolean> {
    if (this.isInitialized) return true;
    
    try {
      // We're in a browser environment, load the Google API client
      if (typeof window !== 'undefined' && typeof document !== 'undefined') {
        await this.loadGapiClient();
        this.isInitialized = true;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize Google Drive API:', error);
      return false;
    }
  }

  // Load the Google API client library
  private loadGapiClient(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Initialize the gapi client
        window.gapi.load('client:auth2', async () => {
          try {
            await window.gapi.client.init({
              apiKey: GOOGLE_API_KEY,
              clientId: GOOGLE_CLIENT_ID,
              discoveryDocs: DISCOVERY_DOCS,
              scope: SCOPES,
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      };
      script.onerror = () => {
        reject(new Error('Failed to load Google API script'));
      };
      document.body.appendChild(script);
    });
  }

  // Sign in the user
  async signIn(): Promise<GoogleAuthResponse> {
    try {
      if (!this.isInitialized) {
        await this.init();
      }

      const authInstance = window.gapi.auth2.getAuthInstance();
      const isSignedIn = authInstance.isSignedIn.get();

      if (!isSignedIn) {
        await authInstance.signIn();
      }

      const currentUser = authInstance.currentUser.get();
      const profile = currentUser.getBasicProfile();
      
      return {
        success: true,
        user: {
          email: profile.getEmail(),
          name: profile.getName(),
          picture: profile.getImageUrl(),
        },
      };
    } catch (error) {
      console.error('Error signing in:', error);
      return {
        success: false,
        error: 'Failed to sign in with Google',
      };
    }
  }

  // Sign out the user
  async signOut(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.init();
      }

      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  }

  // Check if the user is signed in
  async isSignedIn(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.init();
      }
      
      const authInstance = window.gapi.auth2.getAuthInstance();
      return authInstance.isSignedIn.get();
    } catch {
      return false;
    }
  }

  // Get the user's profile information
  async getUserProfile(): Promise<GoogleAuthResponse> {
    try {
      if (!this.isInitialized) {
        await this.init();
      }

      const authInstance = window.gapi.auth2.getAuthInstance();
      
      if (!authInstance.isSignedIn.get()) {
        return {
          success: false,
          error: 'User is not signed in',
        };
      }

      const currentUser = authInstance.currentUser.get();
      const profile = currentUser.getBasicProfile();
      
      return {
        success: true,
        user: {
          email: profile.getEmail(),
          name: profile.getName(),
          picture: profile.getImageUrl(),
        },
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return {
        success: false,
        error: 'Failed to get user profile',
      };
    }
  }

  // Create or get the notes folder
  private async getNotesFolderId(): Promise<string> {
    if (this.notesFolder) {
      return this.notesFolder;
    }

    try {
      // Check if the folder already exists
      const response = await window.gapi.client.drive.files.list({
        q: `name='${NOTES_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name)',
      });

      if (response.result.files && response.result.files.length > 0) {
        this.notesFolder = response.result.files[0].id;
        return this.notesFolder;
      }

      // Create a new folder
      const folderResponse = await window.gapi.client.drive.files.create({
        resource: {
          name: NOTES_FOLDER_NAME,
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });

      this.notesFolder = folderResponse.result.id;
      return this.notesFolder;
    } catch (error) {
      console.error('Error getting notes folder:', error);
      throw new Error('Failed to get or create notes folder');
    }
  }

  // Upload a note to Google Drive
  async uploadNote(note: Note): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.init();
      }

      const folderId = await this.getNotesFolderId();
      const noteContent = JSON.stringify(note);
      const fileName = `note_${note.id}.json`;

      // Check if the file already exists
      const response = await window.gapi.client.drive.files.list({
        q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
        spaces: 'drive',
        fields: 'files(id)',
      });

      if (response.result.files && response.result.files.length > 0) {
        // Update the existing file
        const fileId = response.result.files[0].id;
        await window.gapi.client.request({
          path: `/upload/drive/v3/files/${fileId}`,
          method: 'PATCH',
          params: { uploadType: 'media' },
          body: noteContent,
        });
      } else {
        // Create a new file
        await window.gapi.client.drive.files.create({
          resource: {
            name: fileName,
            parents: [folderId],
          },
          media: {
            mimeType: 'application/json',
            body: noteContent,
          },
        });
      }

      return true;
    } catch (error) {
      console.error('Error uploading note:', error);
      return false;
    }
  }

  // Upload a folder to Google Drive
  async uploadFolder(folder: Folder): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.init();
      }

      const folderId = await this.getNotesFolderId();
      const folderContent = JSON.stringify(folder);
      const fileName = `folder_${folder.id}.json`;

      // Check if the file already exists
      const response = await window.gapi.client.drive.files.list({
        q: `name='${fileName}' and '${folderId}' in parents and trashed=false`,
        spaces: 'drive',
        fields: 'files(id)',
      });

      if (response.result.files && response.result.files.length > 0) {
        // Update the existing file
        const fileId = response.result.files[0].id;
        await window.gapi.client.request({
          path: `/upload/drive/v3/files/${fileId}`,
          method: 'PATCH',
          params: { uploadType: 'media' },
          body: folderContent,
        });
      } else {
        // Create a new file
        await window.gapi.client.drive.files.create({
          resource: {
            name: fileName,
            parents: [folderId],
          },
          media: {
            mimeType: 'application/json',
            body: folderContent,
          },
        });
      }

      return true;
    } catch (error) {
      console.error('Error uploading folder:', error);
      return false;
    }
  }

  // Download notes from Google Drive
  async downloadNotes(): Promise<Note[]> {
    try {
      if (!this.isInitialized) {
        await this.init();
      }

      const folderId = await this.getNotesFolderId();
      
      // List all note files
      const response = await window.gapi.client.drive.files.list({
        q: `name contains 'note_' and '${folderId}' in parents and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name)',
      });

      if (!response.result.files || response.result.files.length === 0) {
        return [];
      }

      // Download each note file
      const notes: Note[] = [];
      for (const file of response.result.files) {
        const fileResponse = await window.gapi.client.drive.files.get({
          fileId: file.id,
          alt: 'media',
        });

        const note: Note = JSON.parse(fileResponse.body);
        notes.push(note);
      }

      return notes;
    } catch (error) {
      console.error('Error downloading notes:', error);
      return [];
    }
  }

  // Download folders from Google Drive
  async downloadFolders(): Promise<Folder[]> {
    try {
      if (!this.isInitialized) {
        await this.init();
      }

      const folderId = await this.getNotesFolderId();
      
      // List all folder files
      const response = await window.gapi.client.drive.files.list({
        q: `name contains 'folder_' and '${folderId}' in parents and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name)',
      });

      if (!response.result.files || response.result.files.length === 0) {
        return [];
      }

      // Download each folder file
      const folders: Folder[] = [];
      for (const file of response.result.files) {
        const fileResponse = await window.gapi.client.drive.files.get({
          fileId: file.id,
          alt: 'media',
        });

        const folder: Folder = JSON.parse(fileResponse.body);
        folders.push(folder);
      }

      return folders;
    } catch (error) {
      console.error('Error downloading folders:', error);
      return [];
    }
  }
}

declare global {
  interface Window {
    gapi: any;
  }
}

// Export a singleton instance
const googleDriveService = new GoogleDriveService();
export default googleDriveService;