"use client";

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import Sidebar from '@/components/sidebar';
import NoteEditor from '@/components/note-editor';
import NoteViewer from '@/components/note-viewer';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Separator } from '@/components/ui/separator';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { PanelLeftOpen, PanelLeftClose, Plus } from 'lucide-react';
import { createEmptyNote } from '@/lib/utils';
import { Note } from '@/lib/types';
import EmptyState from '@/components/empty-state';
import SyncStatus from '@/components/sync-status';

export function NoteApp() {
  const [mounted, setMounted] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const { 
    notes, 
    activeNoteId, 
    isEditing, 
    setActiveNote,
    setEditing,
    addNote
  } = useStore();
  
  const activeNote = notes.find((note) => note.id === activeNoteId);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const handleCreateNote = () => {
    const newNote = createEmptyNote();
    addNote(newNote);
  };
  
  if (!mounted) {
    return null;
  }
  
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <header className="border-b bg-card h-14 flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          </Button>
          <h1 className="text-xl font-semibold">Notes</h1>
        </div>
        <div className="flex items-center gap-2">
          <SyncStatus />
          <ThemeSwitcher />
        </div>
      </header>
      
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel 
            defaultSize={20} 
            minSize={15}
            maxSize={30} 
            collapsible={true} 
            collapsedSize={0}
            
            onCollapse={() => setSidebarCollapsed(true)}
            onExpand={() => setSidebarCollapsed(false)}
            className="bg-muted/20"
          >
            <Sidebar />
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          <ResizablePanel defaultSize={80}>
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-medium">
                  {activeNote ? (
                    activeNote.title
                  ) : (
                    'No note selected'
                  )}
                </h2>
                <div className="flex items-center gap-2">
                  {activeNote && !isEditing ? (
                    <Button 
                      variant="outline" 
                      onClick={() => setEditing(true)}
                    >
                      Edit
                    </Button>
                  ) : null}
                  <Button 
                    onClick={handleCreateNote}
                    className="flex gap-1 items-center"
                  >
                    <Plus size={16} />
                    New Note
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto">
                {activeNote ? (
                  isEditing ? (
                    <NoteEditor note={activeNote} />
                  ) : (
                    <NoteViewer note={activeNote} />
                  )
                ) : (
                  <EmptyState 
                    title="No note selected" 
                    description="Select a note from the sidebar or create a new one to get started."
                    action={
                      <Button onClick={handleCreateNote}>Create Note</Button>
                    }
                  />
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}