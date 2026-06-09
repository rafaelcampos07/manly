export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          photo_url: string | null
          age: number | null
          weight: number | null
          height: number | null
          goals: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          photo_url?: string | null
          age?: number | null
          weight?: number | null
          height?: number | null
          goals?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          photo_url?: string | null
          age?: number | null
          weight?: number | null
          height?: number | null
          goals?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          status: string
          priority: number
          due_date: string | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category?: string
          status?: string
          priority?: number
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string
          status?: string
          priority?: number
          due_date?: string | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          icon: string
          color: string
          daily_goal: number
          weekly_goal: number
          streak: number
          best_streak: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          icon?: string
          color?: string
          daily_goal?: number
          weekly_goal?: number
          streak?: number
          best_streak?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          icon?: string
          color?: string
          daily_goal?: number
          weekly_goal?: number
          streak?: number
          best_streak?: number
          is_active?: boolean
          created_at?: string
        }
      }
      habit_logs: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          completed_at: string
          count: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          completed_at?: string
          count?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          habit_id?: string
          user_id?: string
          completed_at?: string
          count?: number
          notes?: string | null
          created_at?: string
        }
      }
      finance_categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          icon: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          icon?: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          icon?: string
          color?: string
          created_at?: string
        }
      }
      finances: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          description: string
          amount: number
          type: string
          date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          description: string
          amount: number
          type: string
          date?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          description?: string
          amount?: number
          type?: string
          date?: string
          notes?: string | null
          created_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          name: string
          muscle_group: string | null
          exercises: Json
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          muscle_group?: string | null
          exercises?: Json
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          muscle_group?: string | null
          exercises?: Json
          notes?: string | null
          created_at?: string
        }
      }
      workout_logs: {
        Row: {
          id: string
          workout_id: string | null
          user_id: string
          date: string
          duration_minutes: number | null
          exercises: Json
          notes: string | null
          rating: number | null
          created_at: string
        }
        Insert: {
          id?: string
          workout_id?: string | null
          user_id: string
          date?: string
          duration_minutes?: number | null
          exercises?: Json
          notes?: string | null
          rating?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          workout_id?: string | null
          user_id?: string
          date?: string
          duration_minutes?: number | null
          exercises?: Json
          notes?: string | null
          rating?: number | null
          created_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          target_value: number | null
          current_value: number | null
          unit: string | null
          deadline: string | null
          status: string
          priority: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category: string
          target_value?: number | null
          current_value?: number | null
          unit?: string | null
          deadline?: string | null
          status?: string
          priority?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string
          target_value?: number | null
          current_value?: number | null
          unit?: string | null
          deadline?: string | null
          status?: string
          priority?: number
          created_at?: string
          updated_at?: string
        }
      }
      pomodoro_sessions: {
        Row: {
          id: string
          user_id: string
          type: string
          duration_minutes: number
          started_at: string
          ended_at: string | null
          completed: boolean
          category: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          duration_minutes: number
          started_at: string
          ended_at?: string | null
          completed?: boolean
          category?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          duration_minutes?: number
          started_at?: string
          ended_at?: string | null
          completed?: boolean
          category?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          subject: string
          description: string | null
          duration_minutes: number
          date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          description?: string | null
          duration_minutes: number
          date?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          description?: string | null
          duration_minutes?: number
          date?: string
          notes?: string | null
          created_at?: string
        }
      }
      personal_evolution: {
        Row: {
          id: string
          user_id: string
          date: string
          weight: number | null
          body_fat_percentage: number | null
          muscle_mass: number | null
          chest_measure: number | null
          waist_measure: number | null
          arm_measure: number | null
          thigh_measure: number | null
          mood: number | null
          energy_level: number | null
          sleep_quality: number | null
          sleep_hours: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date?: string
          weight?: number | null
          body_fat_percentage?: number | null
          muscle_mass?: number | null
          chest_measure?: number | null
          waist_measure?: number | null
          arm_measure?: number | null
          thigh_measure?: number | null
          mood?: number | null
          energy_level?: number | null
          sleep_quality?: number | null
          sleep_hours?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          weight?: number | null
          body_fat_percentage?: number | null
          muscle_mass?: number | null
          chest_measure?: number | null
          waist_measure?: number | null
          arm_measure?: number | null
          thigh_measure?: number | null
          mood?: number | null
          energy_level?: number | null
          sleep_quality?: number | null
          sleep_hours?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string | null
          type: string
          reference_id: string | null
          scheduled_for: string | null
          sent: boolean
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message?: string | null
          type: string
          reference_id?: string | null
          scheduled_for?: string | null
          sent?: boolean
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string | null
          type?: string
          reference_id?: string | null
          scheduled_for?: string | null
          sent?: boolean
          read?: boolean
          created_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Habit = Database['public']['Tables']['habits']['Row']
export type HabitLog = Database['public']['Tables']['habit_logs']['Row']
export type FinanceCategory = Database['public']['Tables']['finance_categories']['Row']
export type Finance = Database['public']['Tables']['finances']['Row']
export type Workout = Database['public']['Tables']['workouts']['Row']
export type WorkoutLog = Database['public']['Tables']['workout_logs']['Row']
export type Goal = Database['public']['Tables']['goals']['Row']
export type PomodoroSession = Database['public']['Tables']['pomodoro_sessions']['Row']
export type StudySession = Database['public']['Tables']['study_sessions']['Row']
export type PersonalEvolution = Database['public']['Tables']['personal_evolution']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

export type TaskCategory = 'work' | 'gym' | 'health' | 'studies' | 'finance'
export type TaskStatus = 'pending' | 'in_progress' | 'completed'
export type GoalCategory = 'health' | 'gym' | 'finance' | 'career' | 'studies'
export type GoalStatus = 'in_progress' | 'completed' | 'overdue'
export type FinanceType = 'income' | 'expense'
export type PomodoroType = 'focus' | 'break'
