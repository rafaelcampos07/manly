import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Mail, ArrowLeft } from 'lucide-react-native'
import { useAuthStore } from '@/stores/authStore'
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme'

export default function ForgotPasswordScreen() {
  const router = useRouter()
  const { resetPassword, isLoading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleReset = async () => {
    if (!email.trim()) return Alert.alert('Erro', 'Digite seu e-mail')
    await resetPassword(email.trim())
    if (!error) setSent(true)
  }

  if (sent) {
    return (
      <LinearGradient colors={[COLORS.black, COLORS.darkGray, COLORS.black]} style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}><Mail color={COLORS.success} size={40} /></View>
          <Text style={styles.successTitle}>Verifique seu E-mail</Text>
          <Text style={styles.successText}>Enviamos instrucoes para {email}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <LinearGradient colors={[COLORS.blue, COLORS.blueDark]} style={styles.buttonGradient}>
              <Text style={styles.buttonText}>Voltar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={[COLORS.black, COLORS.darkGray, COLORS.black]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backIconButton} onPress={() => router.back()}>
            <ArrowLeft color={COLORS.white} size={22} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Redefinir Senha</Text>
            <Text style={styles.subtitle}>Digite seu e-mail para receber as instrucoes</Text>
          </View>

          {error && <View style={styles.errorContainer}><Text style={styles.errorText}>{error}</Text></View>}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Mail color={COLORS.gray500} size={18} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor={COLORS.gray500} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            </View>

            <TouchableOpacity style={styles.resetButton} onPress={handleReset} disabled={isLoading}>
              <LinearGradient colors={[COLORS.blue, COLORS.blueDark]} style={styles.buttonGradient}>
                {isLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Enviar</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: SPACING.lg, paddingTop: SPACING.xxl, paddingBottom: SPACING.xl },
  backIconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.cardBg, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  header: { marginBottom: SPACING.xl },
  title: { ...TYPOGRAPHY.h1, color: COLORS.white, marginBottom: SPACING.sm },
  subtitle: { ...TYPOGRAPHY.bodySmall, color: COLORS.gray500, lineHeight: 22 },
  errorContainer: { backgroundColor: COLORS.error + '20', borderRadius: BORDER_RADIUS.md, padding: SPACING.smd, marginBottom: SPACING.smd },
  errorText: { color: COLORS.error, textAlign: 'center', fontSize: 13 },
  form: { marginTop: SPACING.sm },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.smd, marginBottom: SPACING.lg, borderWidth: 1, borderColor: COLORS.gray800 },
  inputIcon: { marginRight: SPACING.sm },
  input: { flex: 1, paddingVertical: SPACING.smd, fontSize: 15, color: COLORS.white },
  resetButton: { marginTop: SPACING.sm },
  buttonGradient: { paddingVertical: SPACING.smd + 2, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.lg },
  successIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.success + '15', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.lg },
  successTitle: { ...TYPOGRAPHY.h2, color: COLORS.white, marginBottom: SPACING.sm },
  successText: { ...TYPOGRAPHY.bodySmall, color: COLORS.gray500, textAlign: 'center', marginBottom: SPACING.xl },
  backButton: { width: '100%' }
})
