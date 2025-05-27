"use client";

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import googleDriveService from '@/lib/googleDriveService';
import { mergeNotes, mergeFolders } from '@/lib/localStorage';
import { useToast } from '@/hooks/use-toast';

export function UserProfile() {
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    user, 
    setUser, 
    clearUser,
    notes,
    folders,
    addNote,
    addFolder,
    setSyncing
  } = useStore();
  
  const { toast } = useToast();
  
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        await googleDriveService.init();
        const isSignedIn = await googleDriveService.isSignedIn();
        
        if (isSignedIn) {
          const profileResponse = await googleDriveService.getUserProfile();
          
          if (profileResponse.success && profileResponse.user) {
            setUser({
              email: profileResponse.user.email,
              name: profileResponse.user.name,
              picture: profileResponse.user.picture,
              isAuthenticated: true,
            });
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };
    
    checkAuthStatus();
  }, []);
  
  const handleSignIn = async () => {
    setIsLoading(true);
    
    try {
      const response = await googleDriveService.signIn();
      
      if (response.success && response.user) {
        setUser({
          email: response.user.email,
          name: response.user.name,
          picture: response.user.picture,
          isAuthenticated: true,
        });
        
        toast({
          title: 'Signed in successfully',
          description: `Welcome, ${response.user.name}!`,
        });
        
        // Sync with Google Drive
        await syncWithGoogleDrive();
      } else {
        toast({
          title: 'Sign in failed',
          description: response.error || 'Failed to sign in with Google',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: 'Sign in failed',
        description: 'An error occurred while signing in',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    setIsLoading(true);
    
    try {
      const success = await googleDriveService.signOut();
      
      if (success) {
        clearUser();
        
        toast({
          title: 'Signed out successfully',
          description: 'You have been signed out of Google Drive',
        });
      } else {
        toast({
          title: 'Sign out failed',
          description: 'Failed to sign out',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Sign out failed',
        description: 'An error occurred while signing out',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const syncWithGoogleDrive = async () => {
    setSyncing(true);
    
    try {
      // Upload local notes and folders to Google Drive
      for (const note of notes) {
        if (!note.synced) {
          await googleDriveService.uploadNote({ ...note, synced: true });
        }
      }
      
      for (const folder of folders) {
        if (!folder.synced) {
          await googleDriveService.uploadFolder({ ...folder, synced: true });
        }
      }
      
      // Download notes and folders from Google Drive
      const driveNotes = await googleDriveService.downloadNotes();
      const driveFolders = await googleDriveService.downloadFolders();
      
      // Merge with local data
      const mergedNotes = mergeNotes(notes, driveNotes);
      const mergedFolders = mergeFolders(folders, driveFolders);
      
      // Update local data
      const newNotes = mergedNotes.filter(note => !notes.some(n => n.id === note.id));
      const newFolders = mergedFolders.filter(folder => !folders.some(f => f.id === folder.id));
      
      for (const note of newNotes) {
        addNote(note);
      }
      
      for (const folder of newFolders) {
        addFolder(folder);
      }
      
      toast({
        title: 'Sync completed',
        description: `Synchronized ${newNotes.length} new notes and ${newFolders.length} new folders`,
      });
    } catch (error) {
      console.error('Error syncing with Google Drive:', error);
      toast({
        title: 'Sync failed',
        description: 'An error occurred while syncing with Google Drive',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center gap-2 mb-4">
      {user.isAuthenticated ? (
        <>
          <Avatar className="h-12 w-12">
            {user.picture ? (
              <AvatarImage src={user.picture} alt={user.name || 'User'} />
            ) : null}
            <AvatarFallback>{user.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          
          <div className="text-center">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
              {user.email}
            </p>
          </div>
          
          <div className="flex gap-2 mt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={syncWithGoogleDrive}
              disabled={isLoading}
            >
              Sync
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              disabled={isLoading}
            >
              Sign Out
            </Button>
          </div>
        </>
      ) : (
        <Button 
          className="w-full" 
          onClick={handleSignIn}
          disabled={isLoading}
        >
          Connect Google Drive
        </Button>
      )}
    </div>
  );
}