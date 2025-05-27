"use client";

import { useEffect, useState, useCallback } from 'react';
import { useStore } from '@/lib/store';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Note } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface NoteEditorProps {
  note: Note;
}

export default function NoteEditor({ note }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const { updateNote, setEditing } = useStore();
  const { toast } = useToast();
  
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note]);
  
  // Save changes when unmounting or switching notes
  useEffect(() => {
    return () => {
      if (title !== note.title || content !== note.content) {
        updateNote(note.id, { title, content });
      }
    };
  }, [title, content, note, updateNote]);
  
  // Debounced save with a longer delay
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        updateNote(note.id, { title, content });
      }
    }, 2000);
    
    return () => clearTimeout(saveTimeout);
  }, [title, content, note, updateNote]);
  
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }, []);
  
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  }, []);
  
  const handleDone = useCallback(() => {
    updateNote(note.id, { title, content });
    setEditing(false);
    toast({
      title: "Note saved",
      description: "Your changes have been saved."
    });
  }, [title, content, note.id, updateNote, setEditing, toast]);
  
  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-4">
        <Input
          value={title}
          onChange={handleTitleChange}
          className="text-2xl font-bold border-none shadow-none focus-visible:ring-0 px-0 bg-transparent"
          placeholder="Note title"
        />
      </div>
      <Textarea
        value={content}
        onChange={handleContentChange}
        className="flex-1 resize-none border-none shadow-none focus-visible:ring-0 px-0 bg-transparent"
        placeholder="Write your note here... (Markdown is supported)"
      />
      <div className="flex justify-end mt-4">
        <Button onClick={handleDone}>Done</Button>
      </div>
    </div>
  );
}