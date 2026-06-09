import { Redirect } from 'expo-router'
import { Tabs } from 'expo-router'
import { useAuthStore } from '@/stores/authStore'
import { COLORS, BORDER_RADIUS, SPACING } from '@/constants/theme'
import { ActivityIndicator, View, StyleSheet, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LayoutDashboard, Target, Dumbbell, Wallet, User } from 'lucide-react-native'

export default function TabLayout() {
  const { user, isInitialized } = useAuthStore()
  const insets = useSafeAreaInsets()

  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.blue} />
      </View>
    )
  }

  if (!user) return <Redirect href="/(auth)" />

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.darkGray,
          borderTopColor: COLORS.gray800,
          borderTopWidth: 0.5,
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 12),
          height: 60 + Math.max(insets.bottom, 12)
        },
        tabBarActiveTintColor: COLORS.blue,
        tabBarInactiveTintColor: COLORS.gray600,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.3
        }
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Painel', tabBarIcon: ({ size, color }) => <LayoutDashboard size={size} color={color} strokeWidth={2} /> }} />
      <Tabs.Screen name="habits" options={{ title: 'Habitos', tabBarIcon: ({ size, color }) => <Target size={size} color={color} strokeWidth={2} /> }} />
      <Tabs.Screen name="routines" options={{ title: 'Rotina', tabBarIcon: ({ size, color }) => <Dumbbell size={size} color={color} strokeWidth={2} /> }} />
      <Tabs.Screen name="finance" options={{ title: 'Financas', tabBarIcon: ({ size, color }) => <Wallet size={size} color={color} strokeWidth={2} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: ({ size, color }) => <User size={size} color={color} strokeWidth={2} /> }} />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: COLORS.black, alignItems: 'center', justifyContent: 'center' }
})
