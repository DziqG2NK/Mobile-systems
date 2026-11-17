import { useSQLiteContext } from "expo-sqlite";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Animal, deleteAnimal, getAnimal, saveAnimal } from "../db/database";

type GameState = {
  animal: Animal | null;
  loading: boolean;
  hatch: (name: string) => Promise<void>;
  resetGame: () => Promise<void>;
  addExp: (amount: number) => Promise<void>;
};

const GameContext = createContext<GameState | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnimal(db).then((a) => {
      setAnimal(a);
      setLoading(false);
    });
  }, [db]);

  const hatch = useCallback(
    async (name: string) => {
      const newAnimal: Animal = { name, health: 100, exp: 0 };
      await saveAnimal(db, newAnimal);
      setAnimal(newAnimal);
    },
    [db],
  );

  const resetGame = useCallback(async () => {
    await deleteAnimal(db);
    setAnimal(null);
  }, [db]);
  const addExp = useCallback(
    async (amount: number) => {
      if (!animal || amount <= 0) return;

      const updatedAnimal = {
        ...animal,
        exp: animal.exp + amount,
      };

      await saveAnimal(db, updatedAnimal);
      setAnimal(updatedAnimal);
    },
    [animal, db],
  );

  return (
    <GameContext.Provider value={{ animal, loading, hatch, resetGame, addExp }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside <GameProvider>");
  return ctx;
}
