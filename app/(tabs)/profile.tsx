import React, { useState, useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuthStore } from '@/stores/authStore'
import { useDataStore, calculateManScore } from '@/stores/dataStore'
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme'
import { X, User, Trophy, Target, Activity, Scale, Ruler, Calendar, Moon, Sun, Zap, TrendingUp, LogOut, ChevronRight, Edit3, Mail, Award } from 'lucide-react-native'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ProfileScreen() {
  const { user, profile, signOut, updateProfile } = useAuthStore()
  const { goals, habits, habitLogs, workoutLogs, studySessions, pomodoroSessions, personalEvolution, fetchAllData, addEvolutionEntry } = useDataStore()

  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showEvolutionModal, setShowEvolutionModal] = useState(false)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [evoWeight, setEvoWeight] = useState('')
  const [evoMood, setEvoMood] = useState('7')
  const [evoEnergy, setEvoEnergy] = useState('7')
  const [evoSleep, setEvoSleep] = useState('7')
  const [evoSleepHours, setEvoSleepHours] = useState('7')

  useEffect(() => { if (user) fetchAllData(user.id) }, [user])
  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setAge(profile.age?.toString() || '')
      setWeight(profile.weight?.toString() || '')
      setHeight(profile.height?.toString() || '')
    }
  }, [profile])

  const stats = useMemo(() => ({
    completedGoals: goals.filter(g => g.status === 'completed').length,
    activeHabits: habits.filter(h => h.is_active).length,
    totalWorkouts: workoutLogs.length,
    totalStudyHours: (studySessions.reduce((acc, s) => acc + s.duration_minutes, 0) / 60).toFixed(1),
    totalFocusSessions: pomodoroSessions.filter(p => p.type === 'focus' && p.completed).length
  }), [goals, habits, workoutLogs, studySessions, pomodoroSessions])

  const manScore = useMemo(() => calculateManScore({
    tasks: [], habits, habitLogs, finances: [], goals, workoutLogs, pomodoroSessions, studySessions,
    isLoading: false, error: null, workouts: [], personalEvolution: [],
    addTask: async () => {}, updateTask: async () => {}, deleteTask: async () => {}, completeTask: async () => {},
    addHabit: async () => {}, updateHabit: async () => {}, deleteHabit: async () => {}, logHabit: async () => {},
    addFinance: async () => {}, updateFinance: async () => {}, deleteFinance: async () => {},
    addGoal: async () => {}, updateGoal: async () => {}, deleteGoal: async () => {},
    addWorkout: async () => {}, logWorkout: async () => {}, startPomodoro: async () => null, endPomodoro: async () => {},
    addStudySession: async () => {}, addEvolutionEntry: async () => {}, updateEvolutionEntry: async () => {}, clearError: () => {}
  }), [habits, habitLogs, goals, workoutLogs, pomodoroSessions, studySessions])

  const latestEvolution = personalEvolution[0]
  const evolutionHistory = useMemo(() => personalEvolution.slice(0, 7), [personalEvolution])

  const handleUpdateProfile = async () => {
    await updateProfile({ name: name.trim(), age: age ? parseInt(age) : null, weight: weight ? parseFloat(weight) : null, height: height ? parseFloat(height) : null })
    setShowEditProfile(false)
  }

  const handleLogEvolution = async () => {
    await addEvolutionEntry({
      user_id: user!.id, date: format(new Date(), 'yyyy-MM-dd'),
      weight: evoWeight ? parseFloat(evoWeight) : null,
      mood: evoMood ? parseInt(evoMood) : null,
      energy_level: evoEnergy ? parseInt(evoEnergy) : null,
      sleep_quality: evoSleep ? parseInt(evoSleep) : null,
      sleep_hours: evoSleepHours ? parseFloat(evoSleepHours) : null
    })
    setShowEvolutionModal(false)
    setEvoWeight(''); setEvoMood('7'); setEvoEnergy('7'); setEvoSleep('7'); setEvoSleepHours('7')
  }

  const handleSignOut = () => {
    Alert.alert('Sair', 'Deseja sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: async () => await signOut() }
    ])
  }

  const getScoreColor = (score: number) => score >= 80 ? COLORS.success : score >= 50 ? COLORS.blue : COLORS.warning

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={[COLORS.blue + '20', COLORS.black]} style={styles.headerGradient}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}><User color={COLORS.blue} size={36} /></View>
            <TouchableOpacity style={styles.editButton} onPress={() => setShowEditProfile(true)}>
              <Edit3 color={COLORS.white} size={14} />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{profile?.name || 'Usuario'}</Text>
          {user?.email && <Text style={styles.userEmail}>{user.email}</Text>}

          {/* Score Badge */}
          <View style={[styles.scoreBadge, { backgroundColor: getScoreColor(manScore) + '20' }]}>
            <Trophy color={getScoreColor(manScore)} size={16} />
            <Text style={[styles.scoreText, { color: getScoreColor(manScore) }]}>{manScore} pontos</Text>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Trophy color={COLORS.yellow} size={22} />
            <Text style={styles.statValue}>{stats.completedGoals}</Text>
            <Text style={styles.statLabel}>Metas</Text>
          </View>
          <View style={styles.statItem}>
            <Target color={COLORS.blue} size={22} />
            <Text style={styles.statValue}>{stats.activeHabits}</Text>
            <Text style={styles.statLabel}>Habitos</Text>
          </View>
          <View style={styles.statItem}>
            <Activity color={COLORS.orange} size={22} />
            <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Treinos</Text>
          </View>
          <View style={styles.statItem}>
            <Zap color={COLORS.purple} size={22} />
            <Text style={styles.statValue}>{stats.totalFocusSessions}</Text>
            <Text style={styles.statLabel}>Foco</Text>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informacoes</Text>
          <View style={styles.infoCard}>
            <InfoRow icon={<User />} label="Nome" value={profile?.name || 'Nao definido'} />
            <InfoRow icon={<Mail />} label="E-mail" value={user?.email || ''} />
            <InfoRow icon={<Calendar />} label="Idade" value={profile?.age ? `${profile.age} anos` : 'Nao definido'} />
            <InfoRow icon={<Scale />} label="Peso" value={profile?.weight ? `${profile.weight} kg` : 'Nao definido'} />
            <InfoRow icon={<Ruler />} label="Altura" value={profile?.height ? `${profile.height} cm` : 'Nao definido'} />
          </View>
        </View>

        {/* Evolution */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Evolucao Pessoal</Text>
            <TouchableOpacity style={styles.logButton} onPress={() => setShowEvolutionModal(true)}>
              <Text style={styles.logButtonText}>Registrar</Text>
            </TouchableOpacity>
          </View>

          {latestEvolution ? (
            <View style={styles.evolutionCard}>
              <View style={styles.evolutionGrid}>
                <EvolutionItem icon={<Scale color={COLORS.blue} size={16} />} label="Peso" value={latestEvolution.weight ? `${latestEvolution.weight}kg` : '-'} />
                <EvolutionItem icon={<Sun color={COLORS.yellow} size={16} />} label="Humor" value={latestEvolution.mood ? `${latestEvolution.mood}/10` : '-'} />
                <EvolutionItem icon={<Zap color={COLORS.orange} size={16} />} label="Energia" value={latestEvolution.energy_level ? `${latestEvolution.energy_level}/10` : '-'} />
                <EvolutionItem icon={<Moon color={COLORS.purple} size={16} />} label="Sono" value={latestEvolution.sleep_quality ? `${latestEvolution.sleep_quality}/10` : '-'} />
              </View>
              <Text style={styles.lastLogged}>Atualizado: {format(parseISO(latestEvolution.date), "d MMM", { locale: ptBR })}</Text>
            </View>
          ) : (
            <View style={styles.emptyEvolution}>
              <TrendingUp color={COLORS.gray600} size={36} />
              <Text style={styles.emptyText}>Sem dados ainda</Text>
              <TouchableOpacity style={styles.startButton} onPress={() => setShowEvolutionModal(true)}>
                <Text style={styles.startButtonText}>Comecar</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* History */}
          {evolutionHistory.length > 1 && (
            <View style={styles.historyContainer}>
              {evolutionHistory.slice(1).map(entry => (
                <View key={entry.id} style={styles.historyRow}>
                  <Text style={styles.historyDate}>{format(parseISO(entry.date), "d MMM", { locale: ptBR })}</Text>
                  <View style={styles.historyValues}>
                    {entry.mood && <Text style={[styles.historyBadge, { backgroundColor: COLORS.yellow + '20' }]}>H:{entry.mood}</Text>}
                    {entry.energy_level && <Text style={[styles.historyBadge, { backgroundColor: COLORS.orange + '20' }]}>E:{entry.energy_level}</Text>}
                    {entry.sleep_quality && <Text style={[styles.historyBadge, { backgroundColor: COLORS.purple + '20' }]}>S:{entry.sleep_quality}</Text>}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Sign Out */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut color={COLORS.error} size={18} />
            <Text style={styles.signOutText}>Sair</Text>
            <ChevronRight color={COLORS.error} size={18} />
          </TouchableOpacity>
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={showEditProfile} animationType="slide" transparent onRequestClose={() => setShowEditProfile(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <TouchableOpacity onPress={() => setShowEditProfile(false)}><X color={COLORS.white} size={24} /></TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Nome" placeholderTextColor={COLORS.gray500} value={name} onChangeText={setName} />
            <TextInput style={styles.input} placeholder="Idade" placeholderTextColor={COLORS.gray500} value={age} onChangeText={setAge} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Peso (kg)" placeholderTextColor={COLORS.gray500} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
            <TextInput style={styles.input} placeholder="Altura (cm)" placeholderTextColor={COLORS.gray500} value={height} onChangeText={setHeight} keyboardType="decimal-pad" />
            <TouchableOpacity style={styles.submitButton} onPress={handleUpdateProfile}>
              <LinearGradient colors={[COLORS.blue, COLORS.blueDark]} style={styles.submitGradient}>
                <Text style={styles.submitText}>Salvar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Evolution Modal */}
      <Modal visible={showEvolutionModal} animationType="slide" transparent onRequestClose={() => setShowEvolutionModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar Hoje</Text>
              <TouchableOpacity onPress={() => setShowEvolutionModal(false)}><X color={COLORS.white} size={24} /></TouchableOpacity>
            </View>
            <Text style={styles.inputLabel}>Peso (kg)</Text>
            <TextInput style={styles.input} placeholder="Opcional" placeholderTextColor={COLORS.gray500} value={evoWeight} onChangeText={setEvoWeight} keyboardType="decimal-pad" />
            <Text style={styles.inputLabel}>Humor (1-10)</Text>
            <TextInput style={styles.input} placeholder="7" placeholderTextColor={COLORS.gray500} value={evoMood} onChangeText={setEvoMood} keyboardType="numeric" maxLength={2} />
            <Text style={styles.inputLabel}>Energia (1-10)</Text>
            <TextInput style={styles.input} placeholder="7" placeholderTextColor={COLORS.gray500} value={evoEnergy} onChangeText={setEvoEnergy} keyboardType="numeric" maxLength={2} />
            <Text style={styles.inputLabel}>Sono (1-10)</Text>
            <TextInput style={styles.input} placeholder="7" placeholderTextColor={COLORS.gray500} value={evoSleep} onChangeText={setEvoSleep} keyboardType="numeric" maxLength={2} />
            <Text style={styles.inputLabel}>Horas de Sono</Text>
            <TextInput style={styles.input} placeholder="7" placeholderTextColor={COLORS.gray500} value={evoSleepHours} onChangeText={setEvoSleepHours} keyboardType="decimal-pad" />
            <TouchableOpacity style={styles.submitButton} onPress={handleLogEvolution}>
              <LinearGradient colors={[COLORS.success, COLORS.success]} style={styles.submitGradient}>
                <Text style={styles.submitText}>Salvar</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconContainer}>{React.cloneElement(icon as React.ReactElement, { color: COLORS.blue, size: 16 })}</View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  )
}

function EvolutionItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.evolutionItem}>
      {icon}
      <Text style={styles.evolutionLabel}>{label}</Text>
      <Text style={styles.evolutionValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  headerGradient: { alignItems: 'center', paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, paddingTop: Platform.OS === 'ios' ? 56 : 36 },
  avatarContainer: { position: 'relative', marginBottom: SPACING.smd },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: COLORS.cardBg, alignItems: 'center', justifyContent: 'center' },
  editButton: { position: 'absolute', right: 0, bottom: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.blue, alignItems: 'center', justifyContent: 'center' },
  userName: { ...TYPOGRAPHY.h2, color: COLORS.white },
  userEmail: { fontSize: 13, color: COLORS.gray500, marginTop: 2 },
  scoreBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.smd, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full, marginTop: SPACING.smd, gap: SPACING.xs },
  scoreText: { fontSize: 13, fontWeight: '600' },
  statsGrid: { flexDirection: 'row', paddingHorizontal: SPACING.lg, marginVertical: SPACING.lg },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: SPACING.smd, backgroundColor: COLORS.cardBg, marginHorizontal: 4, borderRadius: BORDER_RADIUS.lg },
  statValue: { fontSize: 22, fontWeight: '700', color: COLORS.white, marginTop: SPACING.xs },
  statLabel: { fontSize: 11, color: COLORS.gray500, marginTop: 2 },
  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.smd },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.white, marginBottom: SPACING.smd },
  logButton: { backgroundColor: COLORS.blue + '20', paddingHorizontal: SPACING.smd, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.md },
  logButtonText: { fontSize: 12, color: COLORS.blue, fontWeight: '600' },
  infoCard: { backgroundColor: COLORS.cardBg, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.smd, borderBottomWidth: 1, borderBottomColor: COLORS.gray800 },
  infoIconContainer: { marginRight: SPACING.smd },
  infoLabel: { flex: 1, fontSize: 13, color: COLORS.gray500 },
  infoValue: { fontSize: 13, color: COLORS.white },
  evolutionCard: { backgroundColor: COLORS.cardBg, borderRadius: BORDER_RADIUS.lg, padding: SPACING.smd },
  evolutionGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  evolutionItem: { width: '50%', alignItems: 'center', paddingVertical: SPACING.smd },
  evolutionLabel: { fontSize: 11, color: COLORS.gray500, marginTop: SPACING.xs },
  evolutionValue: { fontSize: 14, fontWeight: '600', color: COLORS.white, marginTop: 2 },
  lastLogged: { fontSize: 10, color: COLORS.gray600, textAlign: 'center', marginTop: SPACING.smd },
  emptyEvolution: { backgroundColor: COLORS.cardBg, borderRadius: BORDER_RADIUS.lg, padding: SPACING.xl, alignItems: 'center' },
  emptyText: { ...TYPOGRAPHY.body, fontWeight: '600', color: COLORS.gray400, marginTop: SPACING.smd },
  startButton: { marginTop: SPACING.smd, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.smd, backgroundColor: COLORS.blue, borderRadius: BORDER_RADIUS.md },
  startButtonText: { fontSize: 13, color: COLORS.white, fontWeight: '600' },
  historyContainer: { marginTop: SPACING.smd },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: BORDER_RADIUS.sm, padding: SPACING.sm, marginBottom: SPACING.xs },
  historyDate: { fontSize: 12, color: COLORS.gray500 },
  historyValues: { flexDirection: 'row', gap: SPACING.xs },
  historyBadge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: BORDER_RADIUS.sm, fontSize: 11, fontWeight: '600', color: COLORS.white },
  signOutButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.error + '12', borderRadius: BORDER_RADIUS.lg, padding: SPACING.smd },
  signOutText: { flex: 1, fontSize: 15, color: COLORS.error, marginLeft: SPACING.smd },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.darkGray, borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, padding: SPACING.lg, paddingBottom: SPACING.xxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { ...TYPOGRAPHY.h3, color: COLORS.white },
  input: { backgroundColor: COLORS.elevatedBg, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.smd, paddingVertical: SPACING.smd, fontSize: 15, color: COLORS.white, marginBottom: SPACING.smd },
  inputLabel: { ...TYPOGRAPHY.label, color: COLORS.gray400, marginBottom: SPACING.sm },
  submitButton: { marginTop: SPACING.sm },
  submitGradient: { paddingVertical: SPACING.smd, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  submitText: { fontSize: 15, fontWeight: '600', color: COLORS.white }
})
