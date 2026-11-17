import { Button, View } from "react-native";
import { AnimalSprite } from "../components/AnimalSprite";
import { useGame } from "../state/GameContext";

export function HomeScreen() {
  const { resetGame } = useGame();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <AnimalSprite />
      <View style={{ position: "absolute", bottom: 16 }}>
        <Button title="Reset (dev only)" onPress={resetGame} />
      </View>
    </View>
  );
}
