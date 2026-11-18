import type { SQLiteDatabase } from "expo-sqlite";

export type Animal = {
  name: string;
  health: number;
  exp: number;
};

export type Opponent = {
  name: string;
  health: number;
  expReward: number;
}

const o : Opponent = {
  name: "Przeciwnik 1",
  health: 200,
  expReward: 100
}

export async function migrateDb(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS animal (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      health INTEGER NOT NULL,
      exp INTEGER NOT NULL
    );
    DROP TABLE IF EXISTS opponent;
    CREATE TABLE opponent (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      health INTEGER NOT NULL,
      exp_reward INTEGER NOT NULL
    );
  `);

  await db.runAsync(
    'INSERT INTO opponent (id, name, health, exp_reward) VALUES (1, ?, ?, ?)',
    o.name, o.health, o.expReward
  );
}

export async function getAnimal(db: SQLiteDatabase): Promise<Animal | null> {
  return db.getFirstAsync<Animal>(
    "SELECT name, health, exp FROM animal WHERE id = 1",
  );
}

export async function getOpponent(db: SQLiteDatabase, id: number): Promise<Opponent | null> {
  return db.getFirstAsync<Opponent>(
    'SELECT name, health, exp_reward FROM opponent where id = ?',
    id
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

// export async function saveOpponent(db: SQLiteDatabase, o: Opponent) {
//   await db.runAsync(
//     'INSERT OR REPLACE INTO opponent (id, name, health, exp_reward) VALUES (1, ?, ?, ?)',
//     o.name, o.health, o.expReward
//   );
// }

export async function deleteAnimal(db: SQLiteDatabase) {
  await db.runAsync("DELETE FROM animal WHERE id = 1");
}
