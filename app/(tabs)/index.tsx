import React, { useEffect, useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Platform,
  TouchableOpacity
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuthStore } from '@/stores/authStore'
import { useDataStore, calculateManScore, getTodayStats, getMonthlyStats } from '@/stores/dataStore'
import { COLORS, SPACING, BORDER_RADIUS, FONTS, TYPOGRAPHY } from '@/constants/theme'
import {
  CheckCircle,
  Target,
  BookOpen,
  Dumbbell,
  TrendingUp,
  DollarSign,
  PiggyBank,
  Zap,
  Calendar,
  Award,
  Flame,
  ChevronRight
} from 'lucide-react-native'
import { format, subDays, startOfWeek, isWithinInterval, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { router } from 'expo-router'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function DashboardScreen() {
  const { user, profile } = useAuthStore()
  const {
    fetchAllData,
    tasks,
    habits,
    habitLogs,
    finances,
    goals,
    workoutLogs,
    studySessions,
    pomodoroSessions,
    isLoading
  } = useDataStore()

  useEffect(() => {
    if (user) {
      fetchAllData(user.id)
    }
  }, [user])

  const manScore = useMemo(() => {
    const state = {
      tasks, habits, habitLogs, finances, goals, workoutLogs, pomodoroSessions, studySessions,
      isLoading: false, error: null, workouts: [], personalEvolution: [],
      addTask: async () => {}, updateTask: async () => {}, deleteTask: async () => {}, completeTask: async () => {},
      addHabit: async () => {}, updateHabit: async () => {}, deleteHabit: async () => {}, logHabit: async () => {},
      addFinance: async () => {}, updateFinance: async () => {}, deleteFinance: async () => {},
      addGoal: async () => {}, updateGoal: async () => {}, deleteGoal: async () => {},
      addWorkout: async () => {}, logWorkout: async () => {}, startPomodoro: async () => null, endPomodoro: async () => {},
      addStudySession: async () => {}, addEvolutionEntry: async () => {}, updateEvolutionEntry: async () => {}, clearError: () => {}
    }
    return calculateManScore(state)
  }, [tasks, habits, habitLogs, goals, workoutLogs, studySessions, pomodoroSessions])

  const todayStats = useMemo(() => {
    const state = {
      tasks, habits, habitLogs, finances, goals, workoutLogs, studySessions, pomodoroSessions,
      isLoading: false, error: null, workouts: [], personalEvolution: [],
      addTask: async () => {}, updateTask: async () => {}, deleteTask: async () => {}, completeTask: async () => {},
      addHabit: async () => {}, updateHabit: async () => {}, deleteHabit: async () => {}, logHabit: async () => {},
      addFinance: async () => {}, updateFinance: async () => {}, deleteFinance: async () => {},
      addGoal: async () => {}, updateGoal: async () => {}, deleteGoal: async () => {},
      addWorkout: async () => {}, logWorkout: async () => {}, startPomodoro: async () => null, endPomodoro: async () => {},
      addStudySession: async () => {}, addEvolutionEntry: async () => {}, updateEvolutionEntry: async () => {}, clearError: () => {}
    }
    return getTodayStats(state)
  }, [tasks, habitLogs, studySessions, workoutLogs, finances])

  const monthlyStats = useMemo(() => {
    const state = { finances, isLoading: false, error: null, tasks: [], habits: [], habitLogs: [], goals: [], workouts: [], workoutLogs: [], pomodoroSessions: [], studySessions: [], personalEvolution: [], addTask: async () => {}, updateTask: async () => {}, deleteTask: async () => {}, completeTask: async () => {}, addHabit: async () => {}, updateHabit: async () => {}, deleteHabit: async () => {}, logHabit: async () => {}, addFinance: async () => {}, updateFinance: async () => {}, deleteFinance: async () => {}, addGoal: async () => {}, updateGoal: async () => {}, deleteGoal: async () => {}, addWorkout: async () => {}, logWorkout: async () => {}, startPomodoro: async () => null, endPomodoro: async () => {}, addStudySession: async () => {}, addEvolutionEntry: async () => {}, updateEvolutionEntry: async () => {}, clearError: () => {} }
    return getMonthlyStats(state)
  }, [finances])

  const weekData = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dateStr = format(date, 'yyyy-MM-dd')
      const dayTasks = tasks.filter(t => t.due_date === dateStr && t.status === 'completed')
      const dayHabits = habitLogs.filter(l => l.completed_at === dateStr)
      const dayWorkout = workoutLogs.find(w => w.date === dateStr)
      const dayStudy = studySessions.filter(s => s.date === dateStr)
      const dayScore = Math.min((dayTasks.length * 5) + (dayHabits.length * 5) + (dayWorkout ? 10 : 0) + (dayStudy.reduce((acc, s) => acc + s.duration_minutes, 0) / 60 * 5), 100)
      days.push({ day: format(date, 'EEE', { locale: ptBR }), score: dayScore, fullDate: dateStr })
    }
    return days
  }, [tasks, habitLogs, workoutLogs, studySessions])

  const activeStreak = useMemo(() => {
    let streak = 0
    const today = format(new Date(), 'yyyy-MM-dd')
    for (let i = 0; i < 365; i++) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
      const logs = habitLogs.filter(l => l.completed_at === date)
      if (logs.length > 0) streak++
      else if (date !== today) break
    }
    return streak
  }, [habitLogs])

  const onRefresh = () => {
    if (user) fetchAllData(user.id)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return COLORS.success
    if (score >= 50) return COLORS.blue
    return COLORS.warning
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={COLORS.blue} />} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>Bem-vindo,</Text>
              <Text style={styles.userName}>{profile?.name || 'Guerreiro'}</Text>
            </View>
            <TouchableOpacity style={styles.dateBadge}>
              <Calendar color={COLORS.blue} size={16} />
              <Text style={styles.dateText}>{format(new Date(), "d MMM", { locale: ptBR })}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Man Score Card */}
        <LinearGradient colors={[COLORS.blue + '15', COLORS.cardBg]} style={styles.manScoreCard}>
          <View style={styles.manScoreContent}>
            <View style={styles.manScoreLeft}>
              <View style={styles.manScoreLabelRow}>
                <Zap color={COLORS.yellow} size={18} fill={COLORS.yellow} />
                <Text style={styles.manScoreLabel}>PONTUACAO</Text>
              </View>
              <Text style={styles.manScoreValue}>{manScore}</Text>
              <View style={styles.manScoreBar}>
                <View style={[styles.manScoreProgress, { width: `${manScore}%`, backgroundColor: getScoreColor(manScore) }]} />
              </View>
            </View>
            <View style={styles.manScoreRight}>
              <View style={[styles.scoreCircle, { borderColor: getScoreColor(manScore) }]}>
                <Text style={[styles.scoreCircleText, { color: getScoreColor(manScore) }]}>{manScore}</Text>
              </View>
            </View>
          </View>
          <View style={styles.streakRow}>
            <View style={styles.streakItem}>
              <Flame color={COLORS.orange} size={14} />
              <Text style={styles.streakText}>{activeStreak} dias</Text>
            </View>
            <View style={styles.streakDivider} />
            <View style={styles.streakItem}>
              <Target color={COLORS.blue} size={14} />
              <Text style={styles.streakText}>{habits.filter(h => h.is_active).length} habitos</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Today Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progresso de Hoje</Text>
          <View style={styles.statsGrid}>
            <StatCard icon={<CheckCircle color={COLORS.success} size={22} />} label="Tarefas" value={todayStats.tasksCompleted} color={COLORS.success} onPress={() => router.push('/(tabs)/routines')} />
            <StatCard icon={<Target color={COLORS.blue} size={22} />} label="Habitos" value={todayStats.habitsCompleted} color={COLORS.blue} onPress={() => router.push('/(tabs)/habits')} />
            <StatCard icon={<BookOpen color={COLORS.purple} size={22} />} label="Estudo" value={`${(todayStats.studyMinutes / 60).toFixed(1)}h`} color={COLORS.purple} />
            <StatCard icon={<Dumbbell color={COLORS.orange} size={22} />} label="Treino" value={`${todayStats.workoutMinutes}m`} color={COLORS.orange} />
          </View>
        </View>

        {/* Financial Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Financas do Mes</Text>
            <TouchableOpacity style={styles.seeAllButton} onPress={() => router.push('/(tabs)/finance')}>
              <Text style={styles.seeAllText}>Ver tudo</Text>
              <ChevronRight color={COLORS.gray500} size={16} />
            </TouchableOpacity>
          </View>
          <View style={styles.financialRow}>
            <LinearGradient colors={[COLORS.success + '12', COLORS.success + '08']} style={styles.financialCard}>
              <View style={[styles.financialIcon, { backgroundColor: COLORS.success + '20' }]}>
                <TrendingUp color={COLORS.success} size={18} />
              </View>
              <Text style={styles.financialLabel}>Receitas</Text>
              <Text style={[styles.financialValue, { color: COLORS.success }]}>R$ {monthlyStats.totalIncome.toLocaleString('pt-BR')}</Text>
            </LinearGradient>
            <LinearGradient colors={[COLORS.error + '12', COLORS.error + '08']} style={styles.financialCard}>
              <View style={[styles.financialIcon, { backgroundColor: COLORS.error + '20' }]}>
                <TrendingUp color={COLORS.error} size={18} />
              </View>
              <Text style={styles.financialLabel}>Despesas</Text>
              <Text style={[styles.financialValue, { color: COLORS.error }]}>R$ {monthlyStats.totalExpenses.toLocaleString('pt-BR')}</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Desempenho Semanal</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartBars}>
              {weekData.map((day, index) => {
                const barHeight = Math.max((day.score / 100) * 80, 6)
                return (
                  <View key={index} style={styles.chartBarContainer}>
                    <Text style={styles.chartValue}>{day.score}</Text>
                    <View style={styles.chartBarWrapper}>
                      <View style={[styles.chartBar, { height: barHeight, backgroundColor: getScoreColor(day.score) }]} />
                    </View>
                    <Text style={styles.chartLabel}>{day.day}</Text>
                  </View>
                )
              })}
            </View>
          </View>
        </View>

        {/* Active Goals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Metas Ativas</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>Ver tudo</Text>
              <ChevronRight color={COLORS.gray500} size={16} />
            </TouchableOpacity>
          </View>
          {goals.filter(g => g.status === 'in_progress').slice(0, 3).map((goal) => {
            const progress = goal.target_value ? Math.min((goal.current_value || 0) / goal.target_value, 1) : 0
            const categoryColors: Record<string, string> = { gym: COLORS.orange, finance: COLORS.success, health: COLORS.purple, studies: COLORS.blue, career: COLORS.yellow }
            return (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <View style={[styles.goalIndicator, { backgroundColor: categoryColors[goal.category] || COLORS.blue }]} />
                  <View style={styles.goalContent}>
                    <Text style={styles.goalTitle} numberOfLines={1}>{goal.title}</Text>
                    {goal.deadline && <Text style={styles.goalDeadline}>Prazo: {format(parseISO(goal.deadline), "d MMM", { locale: ptBR })}</Text>}
                  </View>
                  <Text style={[styles.goalProgress, { color: categoryColors[goal.category] || COLORS.blue }]}>{Math.round(progress * 100)}%</Text>
                </View>
                <View style={styles.goalProgressBar}>
                  <View style={[styles.goalProgressFill, { width: `${progress * 100}%`, backgroundColor: categoryColors[goal.category] || COLORS.blue }]} />
                </View>
              </View>
            )
          })}
          {goals.filter(g => g.status === 'in_progress').length === 0 && (
            <View style={styles.emptyGoals}>
              <Award color={COLORS.gray600} size={36} />
              <Text style={styles.emptyText}>Nenhuma meta ativa</Text>
              <Text style={styles.emptySubtext}>Defina metas para alcançar seus objetivos</Text>
            </View>
          )}
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  )
}

function StatCard({ icon, label, value, color, onPress }: { icon: React.ReactNode; label: string; value: string | number; color: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={[styles.statCard, { borderColor: color + '25' }]} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingBottom: SPACING.lg
  },
  header: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  headerLeft: {
    flex: 1
  },
  greeting: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.gray500,
    marginBottom: 2
  },
  userName: {
    ...TYPOGRAPHY.h1,
    color: COLORS.white
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: SPACING.smd,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray300
  },
  manScoreCard: {
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.lg
  },
  manScoreContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  manScoreLeft: {
    flex: 1
  },
  manScoreLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs
  },
  manScoreLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.gray400
  },
  manScoreValue: {
    ...TYPOGRAPHY.score,
    color: COLORS.white
  },
  manScoreBar: {
    height: 6,
    backgroundColor: COLORS.gray800,
    borderRadius: 3,
    marginTop: SPACING.smd,
    overflow: 'hidden'
  },
  manScoreProgress: {
    height: '100%',
    borderRadius: 3
  },
  manScoreRight: {
    marginLeft: SPACING.lg
  },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center'
  },
  scoreCircleText: {
    fontSize: 22,
    fontWeight: '800'
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingTop: SPACING.smd,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray800
  },
  streakItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs
  },
  streakText: {
    fontSize: 12,
    color: COLORS.gray400,
    fontWeight: '500'
  },
  streakDivider: {
    width: 1,
    height: 12,
    backgroundColor: COLORS.gray700,
    marginHorizontal: SPACING.lg
  },
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.smd
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.white,
    marginBottom: SPACING.smd
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.smd
  },
  seeAllText: {
    fontSize: 13,
    color: COLORS.gray500
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.smd
  },
  statCard: {
    width: (SCREEN_WIDTH - SPACING.lg * 2 - SPACING.smd) / 2,
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.smd,
    borderWidth: 1
  },
  statIcon: {
    marginBottom: SPACING.sm
  },
  statValue: {
    ...TYPOGRAPHY.largeNumber,
    color: COLORS.white,
    marginBottom: 2
  },
  statLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.gray500
  },
  financialRow: {
    flexDirection: 'row',
    gap: SPACING.smd
  },
  financialCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.smd,
    borderWidth: 1,
    borderColor: COLORS.gray800
  },
  financialIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm
  },
  financialLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.gray500,
    marginBottom: 2
  },
  financialValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white
  },
  chartCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.smd
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between'
  },
  chartBarContainer: {
    flex: 1,
    alignItems: 'center'
  },
  chartValue: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.gray600,
    marginBottom: SPACING.xs
  },
  chartBarWrapper: {
    height: 80,
    width: '70%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: SPACING.xs
  },
  chartBar: {
    width: '100%',
    borderRadius: 3,
    minHeight: 6
  },
  chartLabel: {
    fontSize: 11,
    color: COLORS.gray500,
    textTransform: 'capitalize'
  },
  goalCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.smd,
    marginBottom: SPACING.sm
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  goalIndicator: {
    width: 4,
    height: '100%',
    borderRadius: 2,
    marginRight: SPACING.smd,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0
  },
  goalContent: {
    flex: 1,
    marginLeft: SPACING.smd
  },
  goalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 2
  },
  goalDeadline: {
    fontSize: 11,
    color: COLORS.gray500
  },
  goalProgress: {
    fontSize: 16,
    fontWeight: '700'
  },
  goalProgressBar: {
    height: 4,
    backgroundColor: COLORS.gray800,
    borderRadius: 2,
    overflow: 'hidden',
    marginLeft: SPACING.smd
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: 2
  },
  emptyGoals: {
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.gray400,
    marginTop: SPACING.smd
  },
  emptySubtext: {
    fontSize: 13,
    color: COLORS.gray600,
    marginTop: SPACING.xs
  }
})
