import Database from "better-sqlite3";
import { resolve } from "path";

let dbInstance: Database.Database | null = null;
let dbPath: string | null = null;

export function getDatabase(path: string = "./webhook-tests.db"): Database.Database {
  if (!dbInstance || dbPath !== path) {
    if (dbInstance) {
      dbInstance.close();
    }
    dbPath = path;
    dbInstance = new Database(resolve(path));
    dbInstance.pragma("journal_mode = WAL");
    dbInstance.pragma("foreign_keys = ON");
  }
  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    dbPath = null;
  }
}
