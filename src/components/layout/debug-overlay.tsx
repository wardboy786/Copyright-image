'use client';

import { useState, useEffect, useRef } from 'react';
import { logger } from '@/lib/in-app-logger';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Bug, Trash2, Power, PowerOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function DebugOverlay() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleNewLog = (message: string) => {
      setLogs(prevLogs => [...prevLogs, message].slice(-200)); // Keep last 200 logs
    };
    
    if (isEnabled) {
      logger.subscribe(handleNewLog);
      logger.log("✅ DEBUG_OVERLAY: Logger enabled and subscribed.");
    } else {
      logger.unsubscribe(handleNewLog);
      logger.log("❌ DEBUG_OVERLAY: Logger disabled and unsubscribed.");
    }

    return () => logger.unsubscribe(handleNewLog);
  }, [isEnabled]);

  useEffect(() => {
    // Scroll to bottom when new logs are added and the sheet is open
    if (isOpen && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  const clearLogs = () => {
    setLogs([]);
  };

  const toggleLogging = () => {
    setIsEnabled(prev => {
        const newState = !prev;
        if (newState) {
            logger.enable();
        } else {
            logger.disable();
        }
        return newState;
    });
  }

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
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleLogging} title={isEnabled ? 'Disable Logging' : 'Enable Logging'}>
                {isEnabled ? <PowerOff className="h-5 w-5 text-red-500"/> : <Power className="h-5 w-5 text-green-500" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={clearLogs} title="Clear Logs">
                <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </SheetHeader>
        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto bg-muted/50 p-2 rounded-md font-mono text-xs">
          {!isEnabled && <div className="text-center text-muted-foreground p-8">Logging is currently disabled. Press the power icon to begin.</div>}
          <AnimatePresence initial={false}>
            {logs.map((log, index) => (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                className="border-b border-border/50 py-1 whitespace-pre-wrap break-words"
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
