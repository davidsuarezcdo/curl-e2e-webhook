import { ILogger } from "../../application/interfaces/ILogger.js";

export class ConsoleLogger implements ILogger {
  info(message: string, ...args: any[]): void {
    console.error(`[MCP] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    console.error(`[MCP] Warning: ${message}`, ...args);
  }

  error(message: string, ...args: any[]): void {
    console.error(`[MCP] ✗ ${message}`, ...args);
  }

  debug(message: string, ...args: any[]): void {
    console.error(`[MCP] Debug: ${message}`, ...args);
  }
}
