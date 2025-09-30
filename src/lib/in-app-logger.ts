type LogListener = (message: string) => void;

class InAppLogger {
  private listeners: Set<LogListener> = new Set();
  private isEnabled: boolean = false; // Set to false by default

  public enable(): void {
    if (this.isEnabled) return;
    this.isEnabled = true;
    this.log("LOGGER_SVC: Logging enabled.");
  }
  
  public disable(): void {
    if (!this.isEnabled) return;
    this.log("LOGGER_SVC: Logging disabled.");
    this.isEnabled = false;
  }

  public subscribe(listener: LogListener): void {
    this.listeners.add(listener);
  }

  public unsubscribe(listener: LogListener): void {
    this.listeners.delete(listener);
  }

  public log(message: string, ...args: any[]): void {
    const timestamp = new Date().toLocaleTimeString();
    const fullMessage = `[${timestamp}] ${message}`;

    // Always log to the standard console regardless of whether the in-app logger is enabled
    console.log(fullMessage, ...args);

    // Only broadcast to in-app listeners if enabled
    if (!this.isEnabled) return;
    
    // Format for in-app display
    const displayArgs = args.length > 0 ? `\n${JSON.stringify(args, null, 2)}` : '';
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
