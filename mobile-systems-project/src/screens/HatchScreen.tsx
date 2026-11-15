import { useRef, useState } from 'react';
import { 
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable, 
  StyleSheet, 
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View 
} from 'react-native';
import { useGame } from '../state/GameContext';

const MAX_NAME_LENGTH = 16;

function parseName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > MAX_NAME_LENGTH){
    return 'Max ${MAX_NAME_LENGTH} characters in the name';
  }
  const validPattern = /^[\p{L} _-]+$/u;
  if (!validPattern.test(trimmed)){
    return 'Only letters, space, _ and - are allowed';
  }
  return null;
}

export function HatchScreen() {
  const { hatch } = useGame();
  const shake = useRef(new Animated.Value(0)).current;
  const [hatching, setHatching] = useState(false);
  const [name, setName] = useState('');

  const trimmed = name.trim();
  const error = parseName(name);
  const canHatch = trimmed.length > 0 && error === null && !hatching;

  const onPress = () => {
    if(!canHatch) return;
    Keyboard.dismiss();
    setHatching(true);

    Animated.sequence([
      ...[1,-1,1,-1,1,0].map((v) =>
        Animated.timing(shake, {toValue: v, duration: 90, useNativeDriver: true})
      ),
      Animated.delay(300),
    ]).start(() => {
      hatch(trimmed);
    });
  };

  const rotate = shake.interpolate({ inputRange: [-1, 1], outputRange: ['-12deg', '12deg'] });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          <Text style={styles.title}>Something is moving...</Text>

          <Pressable onPress={onPress} disabled={!canHatch}>
            <Animated.Text
              style={[styles.egg, { transform: [{ rotate }] }, !canHatch && !hatching && styles.eggDisabled]}
            >
              🥚
            </Animated.Text>
          </Pressable>

          <TextInput
            style={[styles.input, error && styles.inputError]}
            value={name}
            onChangeText={setName}
            placeholder="Name your pet"
            placeholderTextColor="#999"
            maxLength={MAX_NAME_LENGTH}
            autoCapitalize="words"
            autoCorrect={false}
            editable={!hatching}
            returnKeyType="done"
            onSubmitEditing={onPress}
          />

          {error ? (
            <Text style={styles.error} >{error}</Text>
          ): (
            <Text style={styles.hint}>
              {trimmed.length === 0 ? 'Enter a name, then tap the egg': 'Tap the egg to hatch it'}
            </Text>
          )} 
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, padding: 24 },
  title: { fontSize: 22, fontWeight: '600' },
  egg: { fontSize: 140 },
  eggDisabled: { opacity: 0.5 },
  inputError: {
    borderColor: '#d33',
    borderWidth: 2,
  },
  input: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 18,
    textAlign: 'center',
  },
  error: {
    color: '#d33',
    fontWeight: '600',
  },
  hint: { opacity: 0.6 },  
});