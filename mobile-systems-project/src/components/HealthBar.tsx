import { ReactNode, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type Unit = {
  name: string;
  health: number;
};

type Props = {
  unit: Unit;
  maxHealth: number;
  side?: 'left' | 'right';
  icon?: ReactNode;
};

const CIRCLE = 56;
const BAR_HEIGHT = 22;
const OVERLAP = CIRCLE / 2;

function barColor(ratio: number): string {
  if (ratio > 0.5) return '#3ecf5a';
  if (ratio > 0.25) return '#f0a93b';
  return '#e5484d';
}

export function HealthBar({ unit, maxHealth, side = 'left', icon }: Props) {
  const isLeft = side === 'left';

  const ratio = maxHealth > 0 ? Math.max(0, Math.min(1, unit.health / maxHealth)) : 0;

  const [trackWidth, setTrackWidth] = useState(0);

  const anim = useRef(new Animated.Value(ratio)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: ratio,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [ratio, anim]);

  const fullWidth = Math.max(trackWidth, OVERLAP);
  const fillWidth = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [OVERLAP, fullWidth],
  });

  return (
    <View style={styles.root}>
      <View style={[styles.row, !isLeft && styles.rowReverse]}>
        <View style={styles.circle}>
          {icon ?? <Text style={styles.circleText}>{unit.name.charAt(0).toUpperCase()}</Text>}
        </View>

        <View
          onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          style={[styles.track, isLeft ? { marginLeft: -OVERLAP } : { marginRight: -OVERLAP }]}
        >
          <View style={[styles.fillArea, !isLeft && styles.rowReverse]}>
            <Animated.View
              style={[styles.fill, { width: fillWidth, backgroundColor: barColor(ratio) }]}
            />
          </View>
        </View>
      </View>

      <Text
        numberOfLines={1}
        style={[
          styles.name,
          isLeft
            ? { paddingLeft: CIRCLE + 8, textAlign: 'left' }
            : { paddingRight: CIRCLE + 8, textAlign: 'right' },
        ]}
      >
        {unit.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { width: '100%' },
  row: { flexDirection: 'row', alignItems: 'center' },
  rowReverse: { flexDirection: 'row-reverse' },
  circle: {
    width: CIRCLE,
    height: CIRCLE,
    borderRadius: CIRCLE / 2,
    backgroundColor: '#1e1e2e',
    borderWidth: 3,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    elevation: 4,
  },
  circleText: { color: 'white', fontSize: 24, fontWeight: '700' },
  track: {
    flex: 1,
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: '#3a3a4a',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  fillArea: { flex: 1, flexDirection: 'row', alignItems: 'stretch' },
  fill: { height: '100%', borderRadius: BAR_HEIGHT / 2 },
  name: { marginTop: 4, fontSize: 16, fontWeight: '600' },
});