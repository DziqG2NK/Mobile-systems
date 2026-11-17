import { Text, View } from "react-native";

export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 20 }}>{title} (coming soon)</Text>
    </View>
  );
}
