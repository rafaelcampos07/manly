import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { Task, Habit, HabitLog, Finance, Goal, Workout, WorkoutLog, PomodoroSession, StudySession, PersonalEvolution, TaskCategory, TaskStatus, GoalCategory, FinanceType } from '@/types/database'
import { format, startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth, subDays, isWithinInterval, parseISO } from 'date-fns'

interface DataState {
  tasks: Task[]
  habits: Habit[]
  habitLogs: HabitLog[]
  finances: Finance[]
  goals: Goal[]
  workouts: Workout[]
  workoutLogs: WorkoutLog[]
  pomodoroSessions: PomodoroSession[]
  studySessions: StudySession[]
  personalEvolution: PersonalEvolution[]
  isLoading: boolean
  error: string | null

  fetchAllData: (userId: string) => Promise<void>

  // Tasks
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  completeTask: (id: string) => Promise<void>

  // Habits
  addHabit: (habit: Omit<Habit, 'id' | 'created_at'>) => Promise<void>
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
  logHabit: (habitId: string, userId: string, count?: number) => Promise<void>

  // Finances
  addFinance: (finance: Omit<Finance, 'id' | 'created_at'>) => Promise<void>
  updateFinance: (id: string, updates: Partial<Finance>) => Promise<void>
  deleteFinance: (id: string) => Promise<void>

  // Goals
  addGoal: (goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>

  // Workouts
  addWorkout: (workout: Omit<Workout, 'id' | 'created_at'>) => Promise<void>
  logWorkout: (log: Omit<WorkoutLog, 'id' | 'created_at'>) => Promise<void>

  // Pomodoro
  startPomodoro: (session: Omit<PomodoroSession, 'id' | 'created_at' | 'ended_at'>) => Promise<string | null>
  endPomodoro: (id: string) => Promise<void>

  // Study
  addStudySession: (session: Omit<StudySession, 'id' | 'created_at'>) => Promise<void>

  // Personal Evolution
  addEvolutionEntry: (entry: Omit<PersonalEvolution, 'id' | 'created_at'>) => Promise<void>
  updateEvolutionEntry: (id: string, updates: Partial<PersonalEvolution>) => Promise<void>

  clearError: () => void
}

export const useDataStore = create<DataState>((set, get) => ({
  tasks: [],
  habits: [],
  habitLogs: [],
  finances: [],
  goals: [],
  workouts: [],
  workoutLogs: [],
  pomodoroSessions: [],
  studySessions: [],
  personalEvolution: [],
  isLoading: false,
  error: null,

  fetchAllData: async (userId) => {
    set({ isLoading: true, error: null })
    try {
      const [
        tasksRes,
        habitsRes,
        habitLogsRes,
        financesRes,
        goalsRes,
        workoutsRes,
        workoutLogsRes,
        pomodoroRes,
        studyRes,
        evolutionRes
      ] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('habits').select('*').eq('user_id', userId).eq('is_active', true),
        supabase.from('habit_logs').select('*').eq('user_id', userId).order('completed_at', { ascending: false }).limit(365),
        supabase.from('finances').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('workouts').select('*').eq('user_id', userId),
        supabase.from('workout_logs').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('pomodoro_sessions').select('*').eq('user_id', userId).order('started_at', { ascending: false }).limit(100),
        supabase.from('study_sessions').select('*').eq('user_id', userId).order('date', { ascending: false }),
        supabase.from('personal_evolution').select('*').eq('user_id', userId).order('date', { ascending: false })
      ])

      set({
        tasks: tasksRes.data || [],
        habits: habitsRes.data || [],
        habitLogs: habitLogsRes.data || [],
        finances: financesRes.data || [],
        goals: goalsRes.data || [],
        workouts: workoutsRes.data || [],
        workoutLogs: workoutLogsRes.data || [],
        pomodoroSessions: pomodoroRes.data || [],
        studySessions: studyRes.data || [],
        personalEvolution: evolutionRes.data || [],
        isLoading: false
      })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  // Tasks
  addTask: async (task) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.from('tasks').insert(task).select().single()
      if (error) throw error
      set(state => ({ tasks: [data, ...state.tasks], isLoading: false }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateTask: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? data : t),
        isLoading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  deleteTask: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  completeTask: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      set(state => ({
        tasks: state.tasks.map(t => t.id === id ? data : t),
        isLoading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  // Habits
  addHabit: async (habit) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.from('habits').insert(habit).select().single()
      if (error) throw error
      set(state => ({ habits: [data, ...state.habits], isLoading: false }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateHabit: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.from('habits').update(updates).eq('id', id).select().single()
      if (error) throw error
      set(state => ({
        habits: state.habits.map(h => h.id === id ? data : h),
        isLoading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  deleteHabit: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase.from('habits').update({ is_active: false }).eq('id', id)
      if (error) throw error
      set(state => ({
        habits: state.habits.filter(h => h.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  logHabit: async (habitId, userId, count = 1) => {
    set({ isLoading: true, error: null })
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      const { data: existingLog } = await supabase
        .from('habit_logs')
        .select('*')
        .eq('habit_id', habitId)
        .eq('completed_at', today)
        .single()

      if (existingLog) {
        const { data, error } = await supabase
          .from('habit_logs')
          .update({ count: existingLog.count + count })
          .eq('id', existingLog.id)
          .select()
          .single()
        if (error) throw error
        set(state => ({
          habitLogs: state.habitLogs.map(l => l.id === existingLog.id ? data : l),
          isLoading: false
        }))
      } else {
        const { data, error } = await supabase
          .from('habit_logs')
          .insert({
            habit_id: habitId,
            user_id: userId,
            completed_at: today,
            count
          })
          .select()
          .single()
        if (error) throw error
        set(state => ({
          habitLogs: [data, ...state.habitLogs],
          isLoading: false
        }))
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  // Finances
  addFinance: async (finance) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.from('finances').insert(finance).select().single()
      if (error) throw error
      set(state => ({ finances: [data, ...state.finances], isLoading: false }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateFinance: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.from('finances').update(updates).eq('id', id).select().single()
      if (error) throw error
      set(state => ({
        finances: state.finances.map(f => f.id === id ? data : f),
        isLoading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  deleteFinance: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase.from('finances').delete().eq('id', id)
      if (error) throw error
      set(state => ({
        finances: state.finances.filter(f => f.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  // Goals
  addGoal: async (goal) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.from('goals').insert(goal).select().single()
      if (error) throw error
      set(state => ({ goals: [data, ...state.goals], isLoading: false }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateGoal: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('goals')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      set(state => ({
        goals: state.goals.map(g => g.id === id ? data : g),
        isLoading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  deleteGoal: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { error } = await supabase.from('goals').delete().eq('id', id)
      if (error) throw error
      set(state => ({
        goals: state.goals.filter(g => g.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  // Workouts
  addWorkout: async (workout) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.from('workouts').insert(workout).select().single()
      if (error) throw error
      set(state => ({ workouts: [data, ...state.workouts], isLoading: false }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  logWorkout: async (log) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.from('workout_logs').insert(log).select().single()
      if (error) throw error
      set(state => ({ workoutLogs: [data, ...state.workoutLogs], isLoading: false }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  // Pomodoro
  startPomodoro: async (session) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.from('pomodoro_sessions').insert(session).select().single()
      if (error) throw error
      set(state => ({
        pomodoroSessions: [data, ...state.pomodoroSessions],
        isLoading: false
      }))
      return data.id
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
      return null
    }
  },

  endPomodoro: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .update({
          ended_at: new Date().toISOString(),
          completed: true
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      set(state => ({
        pomodoroSessions: state.pomodoroSessions.map(p => p.id === id ? data : p),
        isLoading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  // Study
  addStudySession: async (session) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.from('study_sessions').insert(session).select().single()
      if (error) throw error
      set(state => ({ studySessions: [data, ...state.studySessions], isLoading: false }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  // Personal Evolution
  addEvolutionEntry: async (entry) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.from('personal_evolution').insert(entry).select().single()
      if (error) throw error
      set(state => ({ personalEvolution: [data, ...state.personalEvolution], isLoading: false }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateEvolutionEntry: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase.from('personal_evolution').update(updates).eq('id', id).select().single()
      if (error) throw error
      set(state => ({
        personalEvolution: state.personalEvolution.map(e => e.id === id ? data : e),
        isLoading: false
      }))
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  clearError: () => set({ error: null })
}))

// Utility functions for calculations
export const calculateManScore = (state: DataState): number => {
  const today = startOfDay(new Date())
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })

  // Tasks score (0-20)
  const todayTasks = state.tasks.filter(t => t.due_date && isWithinInterval(parseISO(t.due_date), { start: today, end: endOfDay(today) }))
  const completedTodayTasks = todayTasks.filter(t => t.status === 'completed')
  const taskScore = todayTasks.length > 0 ? (completedTodayTasks.length / todayTasks.length) * 20 : 10

  // Habits score (0-25)
  const activeHabits = state.habits.filter(h => h.is_active)
  const todayHabits = state.habitLogs.filter(l => l.completed_at === format(today, 'yyyy-MM-dd'))
  const habitsCompleted = activeHabits.filter(h => todayHabits.some(l => l.habit_id === h.id))
  const habitScore = activeHabits.length > 0 ? (habitsCompleted.length / activeHabits.length) * 25 : 12.5

  // Exercise score (0-20)
  const weekWorkouts = state.workoutLogs.filter(w => {
    const workoutDate = parseISO(w.date)
    return isWithinInterval(workoutDate, { start: weekStart, end: weekEnd })
  })
  const exerciseScore = Math.min(weekWorkouts.length * 4, 20)

  // Study score (0-20)
  const weekStudy = state.studySessions.filter(s => {
    const studyDate = parseISO(s.date)
    return isWithinInterval(studyDate, { start: weekStart, end: weekEnd })
  })
  const totalStudyHours = weekStudy.reduce((acc, s) => acc + s.duration_minutes, 0) / 60
  const studyScore = Math.min(totalStudyHours * 2, 20)

  // Goals score (0-15)
  const activeGoals = state.goals.filter(g => g.status === 'in_progress')
  const completedGoals = state.goals.filter(g => g.status === 'completed')
  const goalScore = activeGoals.length > 0 ? Math.min((completedGoals.length / (activeGoals.length + completedGoals.length)) * 15, 15) : 7.5

  return Math.round(taskScore + habitScore + exerciseScore + studyScore + goalScore)
}

export const getTodayStats = (state: DataState) => {
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayStart = startOfDay(new Date())
  const todayEnd = endOfDay(new Date())

  const completedTasks = state.tasks.filter(t => t.status === 'completed' && t.completed_at && isWithinInterval(parseISO(t.completed_at), { start: todayStart, end: todayEnd }))
  const todayHabits = state.habitLogs.filter(l => l.completed_at === today)
  const uniqueHabitsToday = new Set(todayHabits.map(l => l.habit_id)).size

  const todayStudy = state.studySessions.filter(s => s.date === today)
  const studyMinutes = todayStudy.reduce((acc, s) => acc + s.duration_minutes, 0)

  const todayWorkouts = state.workoutLogs.filter(w => w.date === today)
  const workoutMinutes = todayWorkouts.reduce((acc, w) => acc + (w.duration_minutes || 0), 0)

  const todayFinances = state.finances.filter(f => f.date === today)
  const income = todayFinances.filter(f => f.type === 'income').reduce((acc, f) => acc + f.amount, 0)
  const expenses = todayFinances.filter(f => f.type === 'expense').reduce((acc, f) => acc + f.amount, 0)

  return {
    tasksCompleted: completedTasks.length,
    habitsCompleted: uniqueHabitsToday,
    studyMinutes,
    workoutMinutes,
    todayIncome: income,
    todayExpenses: expenses
  }
}

export const getMonthlyStats = (state: DataState) => {
  const monthStart = startOfMonth(new Date())
  const monthEnd = endOfMonth(new Date())

  const monthFinances = state.finances.filter(f => {
    const date = parseISO(f.date)
    return isWithinInterval(date, { start: monthStart, end: monthEnd })
  })

  const income = monthFinances.filter(f => f.type === 'income').reduce((acc, f) => acc + f.amount, 0)
  const expenses = monthFinances.filter(f => f.type === 'expense').reduce((acc, f) => acc + f.amount, 0)

  return {
    totalIncome: income,
    totalExpenses: expenses,
    balance: income - expenses
  }
}
