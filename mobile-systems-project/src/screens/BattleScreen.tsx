import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';
import { HealthBar } from '../components/HealthBar';
import { getOpponent } from '../db/database';
import { useGame } from '../state/GameContext';

type Fighter = { name: string; health: number; maxHealth: number };
type BattleState = { player: Fighter; enemy: Fighter };

export function BattleScreen() {
  const { animal } = useGame();
  const db = useSQLiteContext();
  const [battle, setBattle] = useState<BattleState | null>(null);

  const animalRef = useRef(animal);
  animalRef.current = animal;

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      getOpponent(db, 1).then((opponent) => {
        const a = animalRef.current;
        if (cancelled || !opponent || !a) return;

        setBattle({
          player: { name: a.name, health: a.health, maxHealth: a.health },
          enemy: { name: opponent.name, health: opponent.health, maxHealth: opponent.health },
        });
      });

      return () => {
        cancelled = true;
        setBattle(null);
      };
    }, [db])
  );

  const dealDamage = (target: 'player' | 'enemy', amount: number) => {
    setBattle((prev) => {
      if (!prev) return prev;
      const fighter = prev[target];
      return {
        ...prev,
        [target]: { ...fighter, health: Math.max(0, fighter.health - amount) },
      };
    });
  };

  if (!battle) return <ActivityIndicator style={{ flex: 1 }} />;

  const finished = battle.player.health === 0 || battle.enemy.health === 0;
  const playerWon = battle.enemy.health === 0;

  return (
    <View style={styles.screen}>
      <View style={styles.bars}>
        <View style={styles.half}>
          <HealthBar unit={battle.player} maxHealth={battle.player.maxHealth} side="left" />
        </View>
        <View style={styles.half}>
          <HealthBar unit={battle.enemy} maxHealth={battle.enemy.maxHealth} side="right" />
        </View>
      </View>

      <View style={styles.center}>
        <Text style={styles.title}>Battle is HERE!</Text>
        {finished && <Text style={styles.title}>{playerWon ? 'Wygrana!' : 'Przegrana...'}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  bars: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 8,
    gap: 8,
  },
  half: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { fontSize: 20, fontWeight: '600' },
});