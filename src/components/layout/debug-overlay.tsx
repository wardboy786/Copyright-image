'use client';

import { useState, useEffect, useRef } from 'react';
import { logger } from '@/lib/in-app-logger';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Bug, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function DebugOverlay() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleNewLog = (message: string) => {
      setLogs(prevLogs => [...prevLogs, message].slice(-100)); // Keep last 100 logs
    };
    logger.subscribe(handleNewLog);
    return () => logger.unsubscribe(handleNewLog);
  }, []);

  useEffect(() => {
    if (isOpen && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: 'spring' }}
          className="fixed bottom-24 right-4 z-[100]"
        >
          <Button
            variant="destructive"
            size="icon"
            className="rounded-full shadow-lg"
          >
            <Bug className="h-5 w-5" />
          </Button>
        </motion.div>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-3/4 flex flex-col">
        <SheetHeader className="flex flex-row justify-between items-center pr-6">
          <SheetTitle>In-App Debug Log</SheetTitle>
          <Button variant="ghost" size="icon" onClick={clearLogs}>
            <Trash2 className="h-5 w-5" />
          </Button>
        </SheetHeader>
        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto bg-muted/50 p-2 rounded-md font-mono text-xs">
          <AnimatePresence initial={false}>
            {logs.map((log, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                className="border-b border-border/50 py-1"
              >
                {log}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
