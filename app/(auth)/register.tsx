import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { useRouter } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react-native'
import { useAuthStore } from '@/stores/authStore'
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme'

export default function RegisterScreen() {
  const router = useRouter()
  const { signUp, isLoading, error } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) return Alert.alert('Erro', 'Preencha todos os campos')
    if (password !== confirmPassword) return Alert.alert('Erro', 'Senhas nao coincidem')
    if (password.length < 6) return Alert.alert('Erro', 'Senha minima: 6 caracteres')
    await signUp(email.trim(), password, name.trim())
    if (!error) { Alert.alert('Sucesso', 'Conta criada! Faca login.'); router.back() }
  }

  return (
    <LinearGradient colors={[COLORS.black, COLORS.darkGray, COLORS.black]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>Inicie sua jornada</Text>
          </View>

          {error && <View style={styles.errorContainer}><Text style={styles.errorText}>{error}</Text></View>}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <User color={COLORS.gray500} size={18} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Nome completo" placeholderTextColor={COLORS.gray500} value={name} onChangeText={setName} autoCapitalize="words" />
            </View>

            <View style={styles.inputContainer}>
              <Mail color={COLORS.gray500} size={18} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="E-mail" placeholderTextColor={COLORS.gray500} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
            </View>

            <View style={styles.inputContainer}>
              <Lock color={COLORS.gray500} size={18} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Senha" placeholderTextColor={COLORS.gray500} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                {showPassword ? <EyeOff color={COLORS.gray500} size={18} /> : <Eye color={COLORS.gray500} size={18} />}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Lock color={COLORS.gray500} size={18} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Confirmar senha" placeholderTextColor={COLORS.gray500} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} autoCapitalize="none" />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                {showConfirmPassword ? <EyeOff color={COLORS.gray500} size={18} /> : <Eye color={COLORS.gray500} size={18} />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={isLoading}>
              <LinearGradient colors={[COLORS.blue, COLORS.blueDark]} style={styles.buttonGradient}>
                {isLoading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.buttonText}>Criar Conta</Text>}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Ja tem conta? </Text>
              <TouchableOpacity onPress={() => router.back()}><Text style={styles.loginLink}>Entrar</Text></TouchableOpacity>
            </View>
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
  header: { marginBottom: SPACING.xl },
  title: { ...TYPOGRAPHY.h1, color: COLORS.white, marginBottom: SPACING.xs },
  subtitle: { ...TYPOGRAPHY.bodySmall, color: COLORS.gray500 },
  errorContainer: { backgroundColor: COLORS.error + '20', borderRadius: BORDER_RADIUS.md, padding: SPACING.smd, marginBottom: SPACING.smd },
  errorText: { color: COLORS.error, textAlign: 'center', fontSize: 13 },
  form: { marginTop: SPACING.sm },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.smd, marginBottom: SPACING.smd, borderWidth: 1, borderColor: COLORS.gray800 },
  inputIcon: { marginRight: SPACING.sm },
  input: { flex: 1, paddingVertical: SPACING.smd, fontSize: 15, color: COLORS.white },
  eyeIcon: { padding: SPACING.xs },
  registerButton: { marginTop: SPACING.sm, marginBottom: SPACING.lg },
  buttonGradient: { paddingVertical: SPACING.smd + 2, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.gray800 },
  dividerText: { color: COLORS.gray600, paddingHorizontal: SPACING.smd, fontSize: 11, fontWeight: '600' },
  loginContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  loginText: { color: COLORS.gray500, fontSize: 14 },
  loginLink: { color: COLORS.blue, fontWeight: '600', fontSize: 14 }
})
