import type { SQLiteDatabase } from "expo-sqlite";

export type Animal = {
  name: string;
  health: number;
  exp: number;
};

export async function migrateDb(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS animal (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      health INTEGER NOT NULL,
      exp INTEGER NOT NULL
    );
  `);
}

export async function getAnimal(db: SQLiteDatabase): Promise<Animal | null> {
  return db.getFirstAsync<Animal>(
    "SELECT name, health, exp FROM animal WHERE id = 1",
  );
}

export async function saveAnimal(db: SQLiteDatabase, a: Animal) {
  await db.runAsync(
    "INSERT OR REPLACE INTO animal (id, name, health, exp) VALUES (1, ?, ?, ?)",
    a.name,
    a.health,
    a.exp,
  );
}

export async function deleteAnimal(db: SQLiteDatabase) {
  await db.runAsync("DELETE FROM animal WHERE id = 1");
}
