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
import { useDataStore } from '@/stores/dataStore'
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/constants/theme'
import { Plus, X, Check, Flame, Target, Trash2, Calendar } from 'lucide-react-native'
import { format, subDays, startOfWeek, endOfWeek, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Habit } from '@/types/database'

const HABIT_COLORS = [COLORS.blue, COLORS.success, COLORS.warning, COLORS.error, COLORS.purple, COLORS.orange]

export default function HabitsScreen() {
  const { user } = useAuthStore()
  const { habits, habitLogs, fetchAllData, addHabit, deleteHabit, logHabit, isLoading } = useDataStore()

  const [showAddModal, setShowAddModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newColor, setNewColor] = useState(COLORS.blue)
  const [newDailyGoal, setNewDailyGoal] = useState('1')

  useEffect(() => {
    if (user) fetchAllData(user.id)
  }, [user])

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayLogs = useMemo(() => habitLogs.filter(l => l.completed_at === today), [habitLogs, today])

  const weekDates = useMemo(() => {
    const end = endOfWeek(new Date(), { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => format(subDays(end, 6 - i), 'yyyy-MM-dd'))
  }, [])

  const handleAddHabit = async () => {
    if (!newName.trim()) return Alert.alert('Erro', 'Por favor, digite o nome do habito')
    await addHabit({
      user_id: user!.id, name: newName.trim(), description: newDescription.trim() || null,
      color: newColor, icon: 'check-circle', daily_goal: parseInt(newDailyGoal) || 1,
      weekly_goal: 7, streak: 0, best_streak: 0, is_active: true
    })
    setShowAddModal(false)
    setNewName('')
    setNewDescription('')
    setNewColor(COLORS.blue)
    setNewDailyGoal('1')
  }

  const handleLogHabit = async (habitId: string) => await logHabit(habitId, user!.id, 1)

  const handleDeleteHabit = async (habitId: string) => {
    Alert.alert('Excluir Habito', 'Tem certeza que deseja excluir este habito?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => await deleteHabit(habitId) }
    ])
  }

  const getHabitStreak = (habit: Habit) => {
    let streak = 0
    const logs = habitLogs.filter(l => l.habit_id === habit.id)
    for (let i = 0; i < 365; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
      if (logs.some(l => l.completed_at === date)) streak++
      else if (date !== today) break
    }
    return streak
  }

  const getHabitWeekData = (habit: Habit) => weekDates.map(date => ({
    date,
    completed: !!habitLogs.find(l => l.habit_id === habit.id && l.completed_at === date)
  }))

  const activeHabits = habits.filter(h => h.is_active)
  const completedToday = todayLogs.filter(l => habits.find(h => h.id === l.habit_id)).length

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Habitos</Text>
              <Text style={styles.subtitle}>Construa disciplina diaria</Text>
            </View>
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
              <Plus color={COLORS.white} size={22} />
            </TouchableOpacity>
          </View>

          {/* Progress Summary */}
          <LinearGradient colors={[COLORS.cardBg, COLORS.darkGray]} style={styles.progressCard}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Progresso Hoje</Text>
              <Text style={styles.progressValue}>{completedToday}/{activeHabits.length}</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${activeHabits.length ? (completedToday / activeHabits.length) * 100 : 0}%` }]} />
            </View>
          </LinearGradient>
        </View>

        {/* Week Overview */}
        <View style={styles.section}>
          <View style={styles.weekCard}>
            <Text style={styles.weekTitle}>Esta Semana</Text>
            <View style={styles.weekGrid}>
              {weekDates.map((date, index) => (
                <View key={date} style={styles.weekDay}>
                  <Text style={[styles.weekDayLabel, date === today && styles.weekDayLabelToday]}>
                    {format(parseISO(date), 'EEE', { locale: ptBR })}
                  </Text>
                  <View style={[styles.weekDot, { backgroundColor: date === today ? COLORS.blue : COLORS.gray700 }]} />
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Habits List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habitos Ativos ({activeHabits.length})</Text>
          {activeHabits.map(habit => {
            const isCompletedToday = todayLogs.some(l => l.habit_id === habit.id)
            const streak = getHabitStreak(habit)
            const weekData = getHabitWeekData(habit)

            return (
              <View key={habit.id} style={[styles.habitCard, { borderLeftColor: habit.color }]}>
                <View style={styles.habitRow}>
                  <TouchableOpacity
                    style={[styles.checkButton, { backgroundColor: isCompletedToday ? habit.color : COLORS.gray800, borderColor: habit.color }]}
                    onPress={() => !isCompletedToday && handleLogHabit(habit.id)}
                    activeOpacity={0.8}
                  >
                    {isCompletedToday && <Check color={COLORS.white} size={18} />}
                  </TouchableOpacity>
                  <View style={styles.habitInfo}>
                    <Text style={[styles.habitName, isCompletedToday && styles.habitNameCompleted]}>{habit.name}</Text>
                    {habit.description && <Text style={styles.habitDescription}>{habit.description}</Text>}
                  </View>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteHabit(habit.id)}>
                    <Trash2 color={COLORS.gray600} size={16} />
                  </TouchableOpacity>
                </View>

                {/* Week Progress */}
                <View style={styles.habitWeek}>
                  {weekData.map((day, idx) => (
                    <View key={idx} style={[styles.dayDot, { backgroundColor: day.completed ? habit.color : COLORS.gray800, opacity: day.date === today ? 1 : 0.7 }]} />
                  ))}
                </View>

                {/* Stats */}
                <View style={styles.habitStats}>
                  <View style={styles.habitStat}>
                    <Flame color={COLORS.orange} size={14} />
                    <Text style={styles.habitStatValue}>{streak}</Text>
                    <Text style={styles.habitStatLabel}>dias</Text>
                  </View>
                  <View style={styles.habitStat}>
                    <Target color={habit.color} size={14} />
                    <Text style={styles.habitStatValue}>{habit.best_streak}</Text>
                    <Text style={styles.habitStatLabel}>recorde</Text>
                  </View>
                </View>
              </View>
            )
          })}
          {activeHabits.length === 0 && (
            <View style={styles.emptyState}>
              <Target color={COLORS.gray600} size={40} />
              <Text style={styles.emptyText}>Nenhum habito ainda</Text>
              <Text style={styles.emptySubtext}>Comece a construir sua disciplina</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => setShowAddModal(true)}>
                <Text style={styles.emptyButtonText}>Adicionar Primeiro Habito</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Habito</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X color={COLORS.white} size={24} />
              </TouchableOpacity>
            </View>

            <TextInput style={styles.input} placeholder="Nome do habito" placeholderTextColor={COLORS.gray500} value={newName} onChangeText={setNewName} />
            <TextInput style={styles.input} placeholder="Descricao (opcional)" placeholderTextColor={COLORS.gray500} value={newDescription} onChangeText={setNewDescription} />

            <Text style={styles.inputLabel}>Cor</Text>
            <View style={styles.colorPicker}>
              {HABIT_COLORS.map(color => (
                <TouchableOpacity key={color} style={[styles.colorOption, { backgroundColor: color }, newColor === color && styles.colorOptionSelected]} onPress={() => setNewColor(color)} />
              ))}
            </View>

            <Text style={styles.inputLabel}>Meta Diaria</Text>
            <TextInput style={styles.input} placeholder="1" placeholderTextColor={COLORS.gray500} value={newDailyGoal} onChangeText={setNewDailyGoal} keyboardType="numeric" />

            <TouchableOpacity style={styles.submitButton} onPress={handleAddHabit}>
              <LinearGradient colors={[COLORS.blue, COLORS.blueDark]} style={styles.submitGradient}>
                <Text style={styles.submitText}>Criar Habito</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.black },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.smd },
  title: { ...TYPOGRAPHY.h1, color: COLORS.white },
  subtitle: { ...TYPOGRAPHY.bodySmall, color: COLORS.gray500, marginTop: 2 },
  addButton: { width: 44, height: 44, backgroundColor: COLORS.blue, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  progressCard: { borderRadius: BORDER_RADIUS.lg, padding: SPACING.smd },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  progressLabel: { ...TYPOGRAPHY.bodySmall, color: COLORS.gray400 },
  progressValue: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  progressBar: { height: 6, backgroundColor: COLORS.gray800, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.blue, borderRadius: 3 },
  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  weekCard: { backgroundColor: COLORS.cardBg, borderRadius: BORDER_RADIUS.lg, padding: SPACING.smd },
  weekTitle: { ...TYPOGRAPHY.label, color: COLORS.gray400, marginBottom: SPACING.smd },
  weekGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  weekDay: { alignItems: 'center', flex: 1 },
  weekDayLabel: { fontSize: 11, color: COLORS.gray500, marginBottom: SPACING.sm, textTransform: 'capitalize' },
  weekDayLabelToday: { color: COLORS.blue, fontWeight: '600' },
  weekDot: { width: 10, height: 10, borderRadius: 5 },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.white, marginBottom: SPACING.smd },
  habitCard: { backgroundColor: COLORS.cardBg, borderRadius: BORDER_RADIUS.lg, padding: SPACING.smd, marginBottom: SPACING.sm, borderLeftWidth: 3 },
  habitRow: { flexDirection: 'row', alignItems: 'center' },
  checkButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginRight: SPACING.smd },
  habitInfo: { flex: 1 },
  habitName: { fontSize: 15, fontWeight: '600', color: COLORS.white, marginBottom: 2 },
  habitNameCompleted: { color: COLORS.gray500 },
  habitDescription: { fontSize: 12, color: COLORS.gray500 },
  deleteButton: { padding: SPACING.sm },
  habitWeek: { flexDirection: 'row', justifyContent: 'space-between', marginTop: SPACING.smd, paddingLeft: 36 + SPACING.smd },
  dayDot: { width: 8, height: 8, borderRadius: 4 },
  habitStats: { flexDirection: 'row', marginTop: SPACING.smd, paddingLeft: 36 + SPACING.smd },
  habitStat: { flexDirection: 'row', alignItems: 'center', marginRight: SPACING.lg },
  habitStatValue: { fontSize: 13, fontWeight: '600', color: COLORS.white, marginLeft: 4 },
  habitStatLabel: { fontSize: 11, color: COLORS.gray500, marginLeft: 2 },
  emptyState: { backgroundColor: COLORS.cardBg, borderRadius: BORDER_RADIUS.lg, padding: SPACING.xl, alignItems: 'center' },
  emptyText: { ...TYPOGRAPHY.body, fontWeight: '600', color: COLORS.gray400, marginTop: SPACING.smd },
  emptySubtext: { ...TYPOGRAPHY.bodySmall, color: COLORS.gray600, marginTop: SPACING.xs },
  emptyButton: { marginTop: SPACING.lg, paddingVertical: SPACING.smd, paddingHorizontal: SPACING.lg, backgroundColor: COLORS.blue, borderRadius: BORDER_RADIUS.md },
  emptyButtonText: { fontSize: 13, fontWeight: '600', color: COLORS.white },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.darkGray, borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, padding: SPACING.lg, paddingBottom: SPACING.xxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { ...TYPOGRAPHY.h3, color: COLORS.white },
  input: { backgroundColor: COLORS.elevatedBg, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.smd, paddingVertical: SPACING.smd, fontSize: 15, color: COLORS.white, marginBottom: SPACING.smd },
  inputLabel: { ...TYPOGRAPHY.label, color: COLORS.gray400, marginBottom: SPACING.sm },
  colorPicker: { flexDirection: 'row', marginBottom: SPACING.lg },
  colorOption: { width: 36, height: 36, borderRadius: 18, marginRight: SPACING.sm },
  colorOptionSelected: { borderWidth: 3, borderColor: COLORS.white },
  submitButton: { marginTop: SPACING.sm },
  submitGradient: { paddingVertical: SPACING.smd, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  submitText: { fontSize: 15, fontWeight: '600', color: COLORS.white }
})
