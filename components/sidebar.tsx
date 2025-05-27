"use client";

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Folder, 
  File, 
  Plus, 
  FolderPlus,
  MoreVertical,
  Trash,
  Edit
} from 'lucide-react';
import { createFolder } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { UserProfile } from '@/components/user-profile';

export default function Sidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [folderName, setFolderName] = useState('');
  const [renameFolderId, setRenameFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showRenameFolder, setShowRenameFolder] = useState(false);
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null);
  const [showDeleteFolder, setShowDeleteFolder] = useState(false);
  
  const { toast } = useToast();
  
  const { 
    notes, 
    folders, 
    activeNoteId, 
    activeFolderId,
    setActiveNote,
    setActiveFolder,
    addFolder,
    updateFolder,
    deleteFolder
  } = useStore();
  
  // Filter notes based on search query and active folder
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = searchQuery === '' || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFolder = activeFolderId === null || note.folderId === activeFolderId;
    
    return matchesSearch && (activeFolderId === null || matchesFolder);
  });
  
  const handleCreateFolder = () => {
    if (folderName.trim() === '') {
      toast({
        title: 'Error',
        description: 'Folder name cannot be empty',
        variant: 'destructive',
      });
      return;
    }
    
    const newFolder = createFolder(folderName);
    addFolder(newFolder);
    setFolderName('');
    setShowCreateFolder(false);
    
    toast({
      title: 'Success',
      description: 'Folder created successfully',
    });
  };
  
  const handleRenameFolder = () => {
    if (!renameFolderId) return;
    if (newFolderName.trim() === '') {
      toast({
        title: 'Error',
        description: 'Folder name cannot be empty',
        variant: 'destructive',
      });
      return;
    }
    
    updateFolder(renameFolderId, newFolderName);
    setRenameFolderId(null);
    setNewFolderName('');
    setShowRenameFolder(false);
    
    toast({
      title: 'Success',
      description: 'Folder renamed successfully',
    });
  };
  
  const handleDeleteFolder = () => {
    if (!deleteFolderId) return;
    
    deleteFolder(deleteFolderId);
    setDeleteFolderId(null);
    setShowDeleteFolder(false);
    
    toast({
      title: 'Success',
      description: 'Folder deleted successfully',
    });
  };
  
  const openRenameDialog = (folderId: string, currentName: string) => {
    setRenameFolderId(folderId);
    setNewFolderName(currentName);
    setShowRenameFolder(true);
  };
  
  const openDeleteDialog = (folderId: string) => {
    setDeleteFolderId(folderId);
    setShowDeleteFolder(true);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <UserProfile />
      </div>
      
      <div className="p-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search notes..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between px-4 py-2">
        <h2 className="text-sm font-semibold text-muted-foreground">FOLDERS</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowCreateFolder(true)}
        >
          <FolderPlus size={16} />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="px-2 py-1">
          <Button
            variant={activeFolderId === null ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start mb-1"
            onClick={() => setActiveFolder(null)}
          >
            <File size={16} className="mr-2" />
            All Notes
          </Button>
          
          {folders.map((folder) => (
            <div 
              key={folder.id} 
              className="flex items-center group mb-1"
            >
              <Button
                variant={activeFolderId === folder.id ? "secondary" : "ghost"}
                size="sm"
                className="flex-1 justify-start"
                onClick={() => setActiveFolder(folder.id)}
              >
                <Folder size={16} className="mr-2" />
                {folder.name}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => openRenameDialog(folder.id, folder.name)}
                  >
                    <Edit size={14} className="mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => openDeleteDialog(folder.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash size={14} className="mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
        
        <Separator className="my-2" />
        
        <div className="flex items-center justify-between px-4 py-2">
          <h2 className="text-sm font-semibold text-muted-foreground">NOTES</h2>
          <div className="text-xs text-muted-foreground">
            {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
          </div>
        </div>
        
        <div className="px-2 py-1">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <Button
                key={note.id}
                variant={activeNoteId === note.id ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "w-full justify-start mb-1 overflow-hidden",
                  note.synced ? "" : "italic"
                )}
                onClick={() => setActiveNote(note.id)}
              >
                <File size={16} className="mr-2 shrink-0" />
                <span className="truncate">{note.title}</span>
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No notes found
            </p>
          )}
        </div>
      </ScrollArea>
      
      {/* Create Folder Dialog */}
      <Dialog open={showCreateFolder} onOpenChange={setShowCreateFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Folder name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFolder(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rename Folder Dialog */}
      <Dialog open={showRenameFolder} onOpenChange={setShowRenameFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="New folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameFolder(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameFolder}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Folder Dialog */}
      <Dialog open={showDeleteFolder} onOpenChange={setShowDeleteFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertTitle>Are you sure?</AlertTitle>
            <AlertDescription>
              This will delete the folder and move all notes within it to the root level.
              This action cannot be undone.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteFolder(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFolder}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}