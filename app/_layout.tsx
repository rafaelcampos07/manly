import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useFrameworkReady } from '@/hooks/useFrameworkReady'
import { useAuthStore } from '@/stores/authStore'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { COLORS } from '@/constants/theme'

export default function RootLayout() {
  useFrameworkReady()
  const { isInitialized, isLoading, initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [])

  if (!isInitialized || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.blue} />
      </View>
    )
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style="light" />
    </>
  )
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.black,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
