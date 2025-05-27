"use client";

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Note } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Trash, MoreHorizontal, Edit, Pencil } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/hooks/use-toast';

interface NoteViewerProps {
  note: Note;
}

export default function NoteViewer({ note }: NoteViewerProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteNote, setEditing } = useStore();
  const { toast } = useToast();
  
  const handleDeleteNote = () => {
    deleteNote(note.id);
    setShowDeleteDialog(false);
    toast({
      title: "Note deleted",
      description: "Your note has been deleted."
    });
  };
  
  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">{note.title}</h1>
          <p className="text-sm text-muted-foreground">
            Last updated: {formatDate(note.updatedAt)}
          </p>
        </div>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setEditing(true)}
          >
            <Pencil size={18} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditing(true)}>
                <Edit size={16} className="mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash size={16} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto prose dark:prose-invert max-w-none">
        {note.content ? (
          <ReactMarkdown>{note.content}</ReactMarkdown>
        ) : (
          <p className="text-muted-foreground italic">This note is empty.</p>
        )}
      </div>
      
      {/* Delete Note Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
          </DialogHeader>
          <Alert>
            <AlertTitle>Are you sure?</AlertTitle>
            <AlertDescription>
              This will permanently delete "{note.title}".
              This action cannot be undone.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteNote}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}