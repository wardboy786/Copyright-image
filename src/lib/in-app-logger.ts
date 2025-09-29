type LogListener = (message: string) => void;

class InAppLogger {
  private listeners: Set<LogListener> = new Set();
  private isEnabled: boolean = false; // Set to false by default

  public enable(): void {
    this.isEnabled = true;
  }
  
  public disable(): void {
    this.isEnabled = false;
  }

  public subscribe(listener: LogListener): void {
    this.listeners.add(listener);
  }

  public unsubscribe(listener: LogListener): void {
    this.listeners.delete(listener);
  }

  public log(message: string, ...args: any[]): void {
    if (!this.isEnabled) return; // Do nothing if not enabled
    
    const timestamp = new Date().toLocaleTimeString();
    const fullMessage = `[${timestamp}] ${message}`;

    // Also log to the standard console for good measure
    console.log(fullMessage, ...args);

    // Format for in-app display
    const displayArgs = args.length > 0 ? ` | ${JSON.stringify(args)}` : '';
    const displayMessage = `${fullMessage}${displayArgs}`;
    
    this.listeners.forEach(listener => {
      try {
        listener(displayMessage);
      } catch (e) {
        console.error("Error in logger listener:", e);
      }
    });
  }
}

// The logger is created, but it will not do anything until `logger.enable()` is called.
export const logger = new InAppLogger();
