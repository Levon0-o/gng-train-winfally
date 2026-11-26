import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const RED = '#E34B4B';
const MUTED = '#858B91';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: '#171A1D', borderTopColor: '#30353A', height: 66, paddingTop: 7, paddingBottom: 8 },
      tabBarActiveTintColor: RED,
      tabBarInactiveTintColor: MUTED,
      tabBarLabelStyle: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
    }}>
      <Tabs.Screen name="index" options={{ title: 'PULPIT', tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="history" options={{ title: 'DZIENNIK', tabBarIcon: ({ color, size }) => <Ionicons name="reader-outline" color={color} size={size} /> }} />
      <Tabs.Screen name="stats" options={{ title: 'STATYSTYKI', tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" color={color} size={size} /> }} />
    </Tabs>
  );
}
