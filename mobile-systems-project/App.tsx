import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SQLiteProvider } from 'expo-sqlite';
import { Suspense } from 'react';
import { ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusHeader } from './src/components/StatusHeader';
import { migrateDb } from './src/db/database';
import { HatchScreen } from './src/screens/HatchScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { PlaceholderScreen } from './src/screens/PlaceholderScreen';
import { GameProvider, useGame } from './src/state/GameContext';
import { BattleScreen } from './src/screens/BattleScreen';
import { LeaveGuardProvider, useLeaveGuard } from './src/state/LeaveGuard';

const Tab = createBottomTabNavigator();

const MapScreen = () => <PlaceholderScreen title="Map" />;
const InventoryScreen = () => <PlaceholderScreen title="Items" />;

function AppContent() {
  const { animal, loading } = useGame();
  const guardRef = useLeaveGuard();

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!animal) return <HatchScreen />;

  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName='Home'
        screenOptions={{ header: () => <StatusHeader /> }}
        screenListeners={({ navigation, route }) => ({
          tabPress: (e) => {
            const guard = guardRef.current;
            if (!guard || route.name === 'Battle') return;
            e.preventDefault();
            guard(() => navigation.navigate(route.name));
          },
        })}
      >
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{ tabBarIcon: ({ color, size }) => <Ionicons name="map" color={color} size={size} /> }}
        />
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> }}
        />
        <Tab.Screen
          name="Battle"
          component={BattleScreen}
          options={{
            tabBarIcon: ({color, size}) => (
              <MaterialCommunityIcons name="sword-cross" color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen
          name="Items"
          component={InventoryScreen}
          options={{ tabBarIcon: ({ color, size }) => <Ionicons name="bag" color={color} size={size} /> }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Suspense fallback={<ActivityIndicator style={{ flex: 1 }} />}>
        <SQLiteProvider databaseName="game.db" onInit={migrateDb} useSuspense>
          <GameProvider>
            <LeaveGuardProvider>
              <AppContent />
            </LeaveGuardProvider>
          </GameProvider>
        </SQLiteProvider>
      </Suspense>
    </SafeAreaProvider>
  );
}
