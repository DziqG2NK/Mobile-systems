import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '../state/GameContext';

export function StatusHeader() {
  const { animal } = useGame();
  const insets = useSafeAreaInsets();
  if (!animal) return null;

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 8 }]}>
      <Text style={styles.stat}>❤️ {animal.health}</Text>
      <Text style={styles.name}>{animal.name}</Text>
      <Text style={styles.stat}>⭐ {animal.exp} XP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#1e1e2e',
  },
  name: { color: 'white', fontSize: 18, fontWeight: '700' },
  stat: { color: 'white', fontSize: 16 },
});