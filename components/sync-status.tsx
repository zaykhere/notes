"use client";

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SyncStatus() {
  const { isSyncing, user } = useStore();
  
  if (!user.isAuthenticated) {
    return null;
  }
  
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      disabled={true}
      className="cursor-default"
    >
      <RefreshCw 
        size={18} 
        className={cn(
          "text-muted-foreground",
          isSyncing && "animate-spin"
        )} 
      />
    </Button>
  );
}