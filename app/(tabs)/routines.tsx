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
import {
  Plus, X, Check, Circle, Briefcase, BookOpen, Dumbbell, Heart, DollarSign,
  Calendar, Clock, Timer, Play, Pause, RotateCcw
} from 'lucide-react-native'
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Task, TaskCategory } from '@/types/database'

const CATEGORY_CONFIG: Record<TaskCategory, { icon: React.ReactNode; color: string; label: string }> = {
  work: { icon: <Briefcase color={COLORS.blue} size={18} />, color: COLORS.blue, label: 'Trabalho' },
  gym: { icon: <Dumbbell color={COLORS.orange} size={18} />, color: COLORS.orange, label: 'Academia' },
  health: { icon: <Heart color={COLORS.success} size={18} />, color: COLORS.success, label: 'Saude' },
  studies: { icon: <BookOpen color={COLORS.purple} size={18} />, color: COLORS.purple, label: 'Estudos' },
  finance: { icon: <DollarSign color={COLORS.warning} size={18} />, color: COLORS.warning, label: 'Financeiro' }
}

export default function RoutinesScreen() {
  const { user } = useAuthStore()
  const { tasks, pomodoroSessions, fetchAllData, addTask, deleteTask, completeTask, startPomodoro, endPomodoro } = useDataStore()

  const [selectedTab, setSelectedTab] = useState<'tasks' | 'pomodoro'>('tasks')
  const [showAddTask, setShowAddTask] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskCategory, setTaskCategory] = useState<TaskCategory>('work')
  const [taskDueDate, setTaskDueDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  // Pomodoro state
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [isTimerPaused, setIsTimerPaused] = useState(false)
  const [timerMinutes, setTimerMinutes] = useState(25)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus')
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  useEffect(() => {
    if (user) fetchAllData(user.id)
  }, [user])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (isTimerActive && !isTimerPaused) {
      interval = setInterval(() => {
        if (timerSeconds === 0) {
          if (timerMinutes === 0) handleTimerComplete()
          else { setTimerMinutes(m => m - 1); setTimerSeconds(59) }
        } else setTimerSeconds(s => s - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerActive, isTimerPaused, timerSeconds, timerMinutes])

  const handleTimerComplete = async () => {
    if (currentSessionId) await endPomodoro(currentSessionId)
    setIsTimerActive(false)
    const title = timerMode === 'focus' ? 'Foco Concluido!' : 'Pausa Concluida!'
    const message = timerMode === 'focus' ? 'Hora de uma pausa?' : 'Pronto para focar?'
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel' },
      { text: timerMode === 'focus' ? 'Pausar' : 'Focar', onPress: () => {
        const newMode = timerMode === 'focus' ? 'break' : 'focus'
        const newTime = newMode === 'focus' ? 25 : 5
        setTimerMode(newMode)
        setTimerMinutes(newTime)
        setTimerSeconds(0)
        startNewSession(newMode, newTime)
      }}
    ])
  }

  const startNewSession = async (type: 'focus' | 'break', duration: number) => {
    const sessionId = await startPomodoro({ user_id: user!.id, type, duration_minutes: duration, started_at: new Date().toISOString(), completed: false })
    if (sessionId) { setCurrentSessionId(sessionId); setIsTimerActive(true); setIsTimerPaused(false) }
  }

  const handleStartTimer = async () => {
    if (!isTimerActive) await startNewSession(timerMode, timerMode === 'focus' ? 25 : 5)
    else setIsTimerPaused(false)
  }

  const handlePauseTimer = () => setIsTimerPaused(true)

  const handleResetTimer = () => {
    setIsTimerActive(false); setIsTimerPaused(false)
    setTimerMinutes(timerMode === 'focus' ? 25 : 5)
    setTimerSeconds(0)
    setCurrentSessionId(null)
  }

  const todayTasks = useMemo(() => tasks.filter(t => t.due_date === format(new Date(), 'yyyy-MM-dd')), [tasks])
  const completedToday = todayTasks.filter(t => t.status === 'completed').length

  const handleAddTask = async () => {
    if (!taskTitle.trim()) return Alert.alert('Erro', 'Digite o titulo da tarefa')
    await addTask({ user_id: user!.id, title: taskTitle.trim(), description: taskDescription.trim() || null, category: taskCategory, status: 'pending', priority: 1, due_date: taskDueDate })
    setShowAddTask(false)
    setTaskTitle('')
    setTaskDescription('')
    setTaskCategory('work')
  }

  const handleCompleteTask = async (taskId: string) => await completeTask(taskId)

  const handleDeleteTask = async (taskId: string) => {
    Alert.alert('Excluir Tarefa', 'Excluir esta tarefa?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => await deleteTask(taskId) }
    ])
  }

  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return 'Sem data'
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Hoje'
    if (isTomorrow(date)) return 'Amanha'
    if (isYesterday(date)) return 'Ontem'
    return format(date, "d MMM", { locale: ptBR })
  }

  const timerProgress = () => {
    const total = (timerMode === 'focus' ? 25 : 5) * 60
    const current = timerMinutes * 60 + timerSeconds
    return ((total - current) / total) * 100
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Rotina</Text>
            <Text style={styles.subtitle}>Organize seu dia</Text>
          </View>
          {selectedTab === 'tasks' && (
            <TouchableOpacity style={styles.addButton} onPress={() => setShowAddTask(true)}>
              <Plus color={COLORS.white} size={22} />
            </TouchableOpacity>
          )}
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, selectedTab === 'tasks' && styles.tabActive]} onPress={() => setSelectedTab('tasks')}>
            <Calendar color={selectedTab === 'tasks' ? COLORS.blue : COLORS.gray500} size={18} />
            <Text style={[styles.tabText, selectedTab === 'tasks' && styles.tabTextActive]}>Tarefas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, selectedTab === 'pomodoro' && styles.tabActive]} onPress={() => setSelectedTab('pomodoro')}>
            <Timer color={selectedTab === 'pomodoro' ? COLORS.blue : COLORS.gray500} size={18} />
            <Text style={[styles.tabText, selectedTab === 'pomodoro' && styles.tabTextActive]}>Pomodoro</Text>
          </TouchableOpacity>
        </View>
      </View>

      {selectedTab === 'tasks' ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Today Summary */}
          <View style={styles.section}>
            <LinearGradient colors={[COLORS.cardBg, COLORS.darkGray]} style={styles.progressCard}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressLabel}>Tarefas de Hoje</Text>
                <Text style={styles.progressValue}>{completedToday}/{todayTasks.length}</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${todayTasks.length ? (completedToday / todayTasks.length) * 100 : 0}%` }]} />
              </View>
            </LinearGradient>
          </View>

          {/* Today's Tasks */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hoje</Text>
            {todayTasks.map(task => {
              const config = CATEGORY_CONFIG[task.category as TaskCategory]
              const isCompleted = task.status === 'completed'
              return (
                <View key={task.id} style={[styles.taskCard, { borderLeftColor: config.color }]}>
                  <TouchableOpacity style={[styles.taskCheck, isCompleted && { backgroundColor: config.color }]} onPress={() => handleCompleteTask(task.id)}>
                    {isCompleted ? <Check color={COLORS.white} size={16} /> : <Circle color={COLORS.gray600} size={18} strokeWidth={2} />}
                  </TouchableOpacity>
                  <View style={styles.taskContent}>
                    <Text style={[styles.taskTitle, isCompleted && styles.taskTitleCompleted]}>{task.title}</Text>
                    <View style={styles.taskMeta}>
                      {config.icon}
                      <Text style={styles.taskCategory}>{config.label}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.taskDelete} onPress={() => handleDeleteTask(task.id)}>
                    <X color={COLORS.gray600} size={18} />
                  </TouchableOpacity>
                </View>
              )
            })}
            {todayTasks.length === 0 && (
              <View style={styles.emptyState}>
                <Calendar color={COLORS.gray600} size={40} />
                <Text style={styles.emptyText}>Nenhuma tarefa para hoje</Text>
              </View>
            )}
          </View>

          {/* Pending Tasks */}
          {tasks.filter(t => t.status === 'pending' && t.due_date !== format(new Date(), 'yyyy-MM-dd')).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pendentes</Text>
              {tasks.filter(t => t.status === 'pending' && t.due_date !== format(new Date(), 'yyyy-MM-dd')).slice(0, 4).map(task => {
                const config = CATEGORY_CONFIG[task.category as TaskCategory]
                return (
                  <View key={task.id} style={[styles.taskCard, { borderLeftColor: config.color }]}>
                    <TouchableOpacity style={styles.taskCheck} onPress={() => handleCompleteTask(task.id)}>
                      <Circle color={COLORS.gray600} size={18} strokeWidth={2} />
                    </TouchableOpacity>
                    <View style={styles.taskContent}>
                      <Text style={styles.taskTitle}>{task.title}</Text>
                      <View style={styles.taskMeta}>
                        <Clock color={COLORS.gray500} size={13} />
                        <Text style={styles.taskDueDate}>{formatDueDate(task.due_date)}</Text>
                      </View>
                    </View>
                  </View>
                )
              })}
            </View>
          )}

          <View style={{ height: SPACING.xxl }} />
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.pomodoroContainer}>
          {/* Timer Mode */}
          <View style={styles.timerModeContainer}>
            <TouchableOpacity style={[styles.timerModeButton, timerMode === 'focus' && styles.timerModeActive]} onPress={() => { if (!isTimerActive) { setTimerMode('focus'); setTimerMinutes(25); setTimerSeconds(0) } }}>
              <Text style={[styles.timerModeText, timerMode === 'focus' && styles.timerModeTextActive]}>Foco</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.timerModeButton, timerMode === 'break' && styles.timerModeActive]} onPress={() => { if (!isTimerActive) { setTimerMode('break'); setTimerMinutes(5); setTimerSeconds(0) } }}>
              <Text style={[styles.timerModeText, timerMode === 'break' && styles.timerModeTextActive]}>Pausa</Text>
            </TouchableOpacity>
          </View>

          {/* Timer */}
          <View style={styles.timerContainer}>
            <View style={[styles.timerCircle, { borderColor: timerMode === 'focus' ? COLORS.blue : COLORS.success }]}>
              <View style={[styles.timerProgress, { backgroundColor: timerMode === 'focus' ? COLORS.blue + '15' : COLORS.success + '15' }]} />
              <Text style={styles.timerDisplay}>{String(timerMinutes).padStart(2, '0')}:{String(timerSeconds).padStart(2, '0')}</Text>
              <Text style={styles.timerLabel}>{isTimerActive ? (isTimerPaused ? 'PAUSADO' : 'FOCADO') : 'PRONTO'}</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.timerControls}>
            {!isTimerActive ? (
              <TouchableOpacity style={styles.timerButton} onPress={handleStartTimer}>
                <LinearGradient colors={[COLORS.blue, COLORS.blueDark]} style={styles.timerButtonGradient}>
                  <Play color={COLORS.white} size={28} fill={COLORS.white} />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.timerControlsRow}>
                <TouchableOpacity style={[styles.timerControlButton, { backgroundColor: COLORS.warning }]} onPress={isTimerPaused ? handleStartTimer : handlePauseTimer}>
                  {isTimerPaused ? <Play color={COLORS.white} size={22} fill={COLORS.white} /> : <Pause color={COLORS.white} size={22} fill={COLORS.white} />}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.timerControlButton, { backgroundColor: COLORS.error }]} onPress={handleResetTimer}>
                  <RotateCcw color={COLORS.white} size={22} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Presets */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tempos</Text>
            <View style={styles.presetContainer}>
              {[{ label: '25 min', time: 25 }, { label: '50 min', time: 50 }, { label: '15 min', time: 15 }].map(preset => (
                <TouchableOpacity key={preset.label} style={styles.presetButton} onPress={() => { if (!isTimerActive) { setTimerMinutes(preset.time); setTimerSeconds(0) } }}>
                  <Text style={styles.presetText}>{preset.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sessions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sessoes de Hoje</Text>
            {pomodoroSessions.filter(s => s.started_at && isToday(parseISO(s.started_at))).slice(0, 5).map(session => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={[styles.sessionDot, { backgroundColor: session.type === 'focus' ? COLORS.blue : COLORS.success }]} />
                <Text style={styles.sessionType}>{session.type === 'focus' ? 'Foco' : 'Pausa'}</Text>
                <Text style={styles.sessionDuration}>{session.duration_minutes} min</Text>
                {session.completed && <Check color={COLORS.success} size={14} />}
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Add Task Modal */}
      <Modal visible={showAddTask} animationType="slide" transparent onRequestClose={() => setShowAddTask(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nova Tarefa</Text>
              <TouchableOpacity onPress={() => setShowAddTask(false)}>
                <X color={COLORS.white} size={24} />
              </TouchableOpacity>
            </View>

            <TextInput style={styles.input} placeholder="Titulo" placeholderTextColor={COLORS.gray500} value={taskTitle} onChangeText={setTaskTitle} />
            <TextInput style={styles.input} placeholder="Descricao (opcional)" placeholderTextColor={COLORS.gray500} value={taskDescription} onChangeText={setTaskDescription} />

            <Text style={styles.inputLabel}>Categoria</Text>
            <View style={styles.categoryContainer}>
              {(Object.keys(CATEGORY_CONFIG) as TaskCategory[]).map(cat => {
                const config = CATEGORY_CONFIG[cat]
                return (
                  <TouchableOpacity key={cat} style={[styles.categoryButton, { borderColor: config.color }, taskCategory === cat && { backgroundColor: config.color + '20' }]} onPress={() => setTaskCategory(cat)}>
                    {config.icon}
                    <Text style={[styles.categoryText, taskCategory === cat && { color: config.color }]}>{config.label}</Text>
                  </TouchableOpacity>
                )
              })}
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleAddTask}>
              <LinearGradient colors={[COLORS.blue, COLORS.blueDark]} style={styles.submitGradient}>
                <Text style={styles.submitText}>Criar Tarefa</Text>
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
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingHorizontal: SPACING.lg, marginBottom: SPACING.smd },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.smd },
  title: { ...TYPOGRAPHY.h1, color: COLORS.white },
  subtitle: { ...TYPOGRAPHY.bodySmall, color: COLORS.gray500, marginTop: 2 },
  addButton: { width: 44, height: 44, backgroundColor: COLORS.blue, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  tabContainer: { flexDirection: 'row', backgroundColor: COLORS.cardBg, borderRadius: BORDER_RADIUS.lg, padding: 4 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.smd, borderRadius: BORDER_RADIUS.md, gap: SPACING.xs },
  tabActive: { backgroundColor: COLORS.darkGray },
  tabText: { fontSize: 13, color: COLORS.gray500, fontWeight: '500' },
  tabTextActive: { color: COLORS.blue, fontWeight: '600' },
  progressCard: { borderRadius: BORDER_RADIUS.lg, padding: SPACING.smd },
  progressInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  progressLabel: { ...TYPOGRAPHY.bodySmall, color: COLORS.gray400 },
  progressValue: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  progressBar: { height: 6, backgroundColor: COLORS.gray800, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.blue, borderRadius: 3 },
  section: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.white, marginBottom: SPACING.smd },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: BORDER_RADIUS.lg, padding: SPACING.smd, marginBottom: SPACING.sm, borderLeftWidth: 3 },
  taskCheck: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.gray800, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.smd },
  taskContent: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: '500', color: COLORS.white, marginBottom: 4 },
  taskTitleCompleted: { textDecorationLine: 'line-through', color: COLORS.gray500 },
  taskMeta: { flexDirection: 'row', alignItems: 'center' },
  taskCategory: { fontSize: 12, color: COLORS.gray500, marginLeft: 6 },
  taskDelete: { padding: SPACING.sm },
  taskDueDate: { fontSize: 12, color: COLORS.gray500, marginLeft: 4 },
  emptyState: { backgroundColor: COLORS.cardBg, borderRadius: BORDER_RADIUS.lg, padding: SPACING.xl, alignItems: 'center' },
  emptyText: { ...TYPOGRAPHY.body, fontWeight: '500', color: COLORS.gray500, marginTop: SPACING.smd },
  pomodoroContainer: { alignItems: 'center', paddingHorizontal: SPACING.lg },
  timerModeContainer: { flexDirection: 'row', backgroundColor: COLORS.cardBg, borderRadius: BORDER_RADIUS.lg, padding: 4, marginBottom: SPACING.xl },
  timerModeButton: { paddingVertical: SPACING.smd, paddingHorizontal: SPACING.lg, borderRadius: BORDER_RADIUS.md },
  timerModeActive: { backgroundColor: COLORS.blue + '25' },
  timerModeText: { fontSize: 14, color: COLORS.gray500, fontWeight: '500' },
  timerModeTextActive: { color: COLORS.blue, fontWeight: '600' },
  timerContainer: { marginBottom: SPACING.xl },
  timerCircle: { width: 220, height: 220, borderRadius: 110, backgroundColor: COLORS.cardBg, alignItems: 'center', justifyContent: 'center', borderWidth: 4 },
  timerProgress: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 110 },
  timerDisplay: { fontSize: 52, fontWeight: '800', color: COLORS.white, letterSpacing: 2 },
  timerLabel: { fontSize: 11, color: COLORS.gray500, marginTop: SPACING.xs, letterSpacing: 2, fontWeight: '600' },
  timerControls: { marginBottom: SPACING.xl },
  timerControlsRow: { flexDirection: 'row', gap: SPACING.lg },
  timerButton: { width: 64, height: 64, borderRadius: 32 },
  timerButtonGradient: { width: '100%', height: '100%', borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  timerControlButton: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  presetContainer: { flexDirection: 'row', gap: SPACING.smd },
  presetButton: { backgroundColor: COLORS.cardBg, borderRadius: BORDER_RADIUS.md, paddingVertical: SPACING.smd, paddingHorizontal: SPACING.lg },
  presetText: { fontSize: 13, color: COLORS.gray300, fontWeight: '500' },
  sessionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: BORDER_RADIUS.md, padding: SPACING.smd, marginBottom: SPACING.sm, width: '100%' },
  sessionDot: { width: 8, height: 8, borderRadius: 4, marginRight: SPACING.smd },
  sessionType: { flex: 1, fontSize: 13, color: COLORS.white },
  sessionDuration: { fontSize: 13, color: COLORS.gray500, marginRight: SPACING.smd },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.darkGray, borderTopLeftRadius: BORDER_RADIUS.xl, borderTopRightRadius: BORDER_RADIUS.xl, padding: SPACING.lg, paddingBottom: SPACING.xxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { ...TYPOGRAPHY.h3, color: COLORS.white },
  input: { backgroundColor: COLORS.elevatedBg, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.smd, paddingVertical: SPACING.smd, fontSize: 15, color: COLORS.white, marginBottom: SPACING.smd },
  inputLabel: { ...TYPOGRAPHY.label, color: COLORS.gray400, marginBottom: SPACING.sm },
  categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  categoryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: BORDER_RADIUS.sm, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.smd, borderWidth: 1 },
  categoryText: { fontSize: 12, color: COLORS.gray500, marginLeft: 6 },
  submitButton: { marginTop: SPACING.sm },
  submitGradient: { paddingVertical: SPACING.smd, borderRadius: BORDER_RADIUS.md, alignItems: 'center' },
  submitText: { fontSize: 15, fontWeight: '600', color: COLORS.white }
})
