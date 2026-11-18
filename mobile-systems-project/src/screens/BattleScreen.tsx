import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Button,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { HealthBar } from '../components/HealthBar';
import { getOpponent } from '../db/database';
import { useGame } from '../state/GameContext';
import { useLeaveGuard } from '../state/LeaveGuard';

type Fighter = { name: string; health: number; maxHealth: number };
type BattleState = { player: Fighter; enemy: Fighter };

const ATTACKS = [
  { name: 'Attack 1', damage: 10 },
  { name: 'Attack 2', damage: 15 },
  { name: 'Attack 3', damage: 20 },
  { name: 'Attack 4', damage: 30 },
];

export function BattleScreen() {
  const { animal } = useGame();
  const db = useSQLiteContext();
  const navigation = useNavigation();
  const guardRef = useLeaveGuard();

  const [battle, setBattle] = useState<BattleState | null>(null);
  const [starting, setStarting] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const pendingRef = useRef<(() => void) | null>(null);
  const sessionRef = useRef(0);

  useFocusEffect(
    useCallback(() => {
      return () => {
        sessionRef.current += 1;
        setBattle(null);
        setStarting(false);
        setConfirmVisible(false);
        pendingRef.current = null;
      };
    }, [])
  );

  const startBattle = async () => {
    if (!animal || starting) return;
    setStarting(true);
    const session = sessionRef.current;

    const opponent = await getOpponent(db, 1);
    if (session !== sessionRef.current) return;

    setStarting(false);
    if (!opponent) return;

    setBattle({
      player: { name: animal.name, health: animal.health, maxHealth: animal.health },
      enemy: { name: opponent.name, health: opponent.health, maxHealth: opponent.health },
    });
  };

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

  const finished = battle !== null && (battle.player.health === 0 || battle.enemy.health === 0);
  const fighting = battle !== null && !finished; // tylko wtedy pytamy o ucieczkę

  const askToLeave = useCallback((proceed: () => void) => {
    pendingRef.current = proceed;
    setConfirmVisible(true);
  }, []);

  useEffect(() => {
    if (!fighting) return;

    guardRef.current = askToLeave;
    const backSub = BackHandler.addEventListener('hardwareBackPress', () => {
      askToLeave(() => navigation.goBack());
      return true;
    });

    return () => {
      guardRef.current = null;
      backSub.remove();
    };
  }, [fighting, askToLeave, guardRef, navigation]);

  const confirmLeave = () => {
    const proceed = pendingRef.current;
    pendingRef.current = null;
    setConfirmVisible(false);
    proceed?.();
  };

  const stay = () => {
    pendingRef.current = null;
    setConfirmVisible(false);
  };

  if (!battle) {
    return (
      <View style={styles.idle}>
        {starting ? (
          <ActivityIndicator />
        ) : (
          <Pressable
            onPress={startBattle}
            style={({ pressed }) => [styles.fightBox, pressed && styles.fightBoxPressed]}
          >
            <Text style={styles.fightText}>Fight!</Text>
          </Pressable>
        )}
      </View>
    );
  }

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
        {finished && <Text style={styles.title}>{playerWon ? 'Victory!' : 'You lost...'}</Text>}

        <Button title="Test: -20 HP zwierzaka" onPress={() => dealDamage('player', 20)} disabled={finished} />
      </View>

      {/* Dolny panel z atakami */}
      <View style={styles.panel}>
        {ATTACKS.map((attack) => (
          <Pressable
            key={attack.name}
            disabled={finished}
            onPress={() => dealDamage('enemy', attack.damage)}
            style={({ pressed }) => [
              styles.attackTile,
              pressed && styles.attackTilePressed,
              finished && styles.attackTileDisabled,
            ]}
          >
            <Text style={styles.attackText}>{attack.name}</Text>
          </Pressable>
        ))}
      </View>

      <Modal transparent animationType="fade" visible={confirmVisible} onRequestClose={stay}>
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <Text style={styles.dialogText}>Are you sure you want to chicken out?</Text>
            <View style={styles.dialogButtons}>
              <Pressable style={[styles.dialogButton, styles.noButton]} onPress={stay}>
                <Text style={styles.noText}>No</Text>
              </Pressable>
              <Pressable style={[styles.dialogButton, styles.yesButton]} onPress={confirmLeave}>
                <Text style={styles.yesText}>Yes</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  // "Fight!"
  idle: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fightBox: {
    backgroundColor: '#1e1e2e',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 56,
  },
  fightBoxPressed: { opacity: 0.8 },
  fightText: { color: 'white', fontSize: 28, fontWeight: '700' },

  // Walka
  bars: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 8,
    gap: 8,
  },
  half: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  title: { fontSize: 20, fontWeight: '600' },

  panel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 12,
    margin: 8,
    backgroundColor: '#c9c9d3',
    borderRadius: 12,
  },
  attackTile: {
    flexBasis: '45%',
    flexGrow: 1,
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: '#1e1e2e',
    borderRadius: 8,
  },
  attackTilePressed: { opacity: 0.8 },
  attackTileDisabled: { opacity: 0.4 },
  attackText: { color: 'white', fontSize: 18, fontWeight: '600' },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: { backgroundColor: 'white', borderRadius: 16, padding: 24, width: '80%', gap: 20 },
  dialogText: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  dialogButtons: { flexDirection: 'row', gap: 12 },
  dialogButton: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  noButton: { backgroundColor: '#e6e6ee' },
  noText: { fontWeight: '600', color: '#1e1e2e' },
  yesButton: { backgroundColor: '#e5484d' },
  yesText: { fontWeight: '600', color: 'white' },
});