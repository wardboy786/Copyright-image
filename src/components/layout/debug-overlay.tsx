'use client';

import React, { useState, useEffect, useRef } from 'react';
import { logger } from '@/lib/in-app-logger';

const DebugOverlay: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleNewLog = (message: string) => {
      setLogs(prevLogs => [message, ...prevLogs].slice(0, 100)); // Keep last 100 logs
    };

    logger.subscribe(handleNewLog);

    return () => {
      logger.unsubscribe(handleNewLog);
    };
  }, []);

  useEffect(() => {
    // Auto-scroll to the top (most recent log)
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '10px',
          zIndex: 1001,
          padding: '8px',
          backgroundColor: 'rgba(0, 122, 255, 0.8)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '24px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
          cursor: 'pointer',
        }}
      >
        🐞
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px',
      right: '10px',
      width: 'calc(100% - 20px)',
      maxWidth: '500px',
      height: '300px',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      color: '#0f0',
      fontFamily: 'monospace',
      fontSize: '11px',
      borderRadius: '8px',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
      border: '1px solid #333',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px',
        backgroundColor: '#111',
        borderBottom: '1px solid #333',
      }}>
        <span style={{ fontWeight: 'bold', color: '#fff' }}>🐞 In-App Debug Logs</span>
        <div>
           <button onClick={() => setLogs([])} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginRight: '10px' }}>Clear</button>
           <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>×</button>
        </div>
      </div>
      <div ref={logContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {logs.map((log, index) => (
          <div key={index} style={{
             borderBottom: '1px solid #222',
             paddingBottom: '4px',
             marginBottom: '4px',
             wordBreak: 'break-all',
             color: log.startsWith('❌') ? '#ff4d4d' : log.startsWith('🎉') ? '#4dff4d' : '#0f0'
          }}>{log}</div>
        ))}
      </div>
    </div>
  );
};

export { DebugOverlay };
