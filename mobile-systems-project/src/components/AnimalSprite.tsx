import { useEffect, useRef, useState, useCallback } from "react";
import { Animated, Image, Pressable, StyleSheet, View } from "react-native";

const IDLE = [
  require("../../assets/idle/idle1.png"),
  require("../../assets/idle/idle2.png"),
  require("../../assets/idle/idle3.png"),
  require("../../assets/idle/idle4.png"),
];

const INTERACTION = require("../../assets/interactions/head_rot.png");
const INTERACTION_MS = 1000;

function useFrames(frames: number[], fps = 6, active: boolean) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!active) return;
    setI(0);
    const id = setInterval(
      () => setI((n) => (n + 1) % frames.length),
      1000 / fps,
    );
    return () => clearInterval(id);
  }, [frames.length, fps, active]);
  return frames[i];
}

export function AnimalSprite() {
  const [interacting, setInteracting] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heart = useRef(new Animated.Value(0)).current;

  const idleFrame = useFrames(IDLE, 6, !interacting);

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  const onPress = useCallback(() => {
    if (interacting) return;
    setInteracting(true);

    heart.setValue(0);
    Animated.timing(heart, {
      toValue: 1,
      duration: INTERACTION_MS,
      useNativeDriver: true,
    }).start();

    timeout.current = setTimeout(() => setInteracting(false), INTERACTION_MS);
  }, [interacting, heart]);

  const heartStyle = {
    opacity: heart.interpolate({
      inputRange: [0, 0.2, 0.8, 1],
      outputRange: [0, 1, 1, 0],
    }),
    transform: [
      {
        translateY: heart.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -20],
        }),
      },
    ],
  };

  return (
    <Pressable onPress={onPress}>
      <View style={styles.container}>
        {interacting && (
          <Animated.Text style={[styles.heart, heartStyle]}>❤️</Animated.Text>
        )}
        <Image
          source={interacting ? INTERACTION : idleFrame}
          style={styles.sprite}
          resizeMode="contain"
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { width: 200, height: 200, marginTop: 40, alignItems: "center" },
  heart: { position: "absolute", top: -35, fontSize: 40, zIndex: 1 },
  sprite: { width: 200, height: 200 },
});
