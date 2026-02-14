export function log(message: string, ...args: unknown[]): void {
  console.error(`[memory-alpha-mcp] ${message}`, ...args);
}

export function logError(message: string, error: unknown): void {
  if (error instanceof Error) {
    console.error(`[memory-alpha-mcp] ERROR: ${message}: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
  } else {
    console.error(`[memory-alpha-mcp] ERROR: ${message}: ${String(error)}`);
  }
}
