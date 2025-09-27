import { create } from 'zustand'
import { getTasksForUser } from '../db'
import type { TaskDocType } from '../db/schemas'

interface UserState {
  currentUserId: string | null
  tasks: TaskDocType[]
  isLoadingTasks: boolean
  setCurrentUserId: (userId: string | null) => void
  getCurrentUserId: () => string | null
  fetchTasks: () => Promise<void>
  addTask: (task: TaskDocType) => void
  updateTask: (taskId: string, updates: Partial<TaskDocType>) => void
  clearTasks: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUserId: null,
  tasks: [],
  isLoadingTasks: false,
  
  setCurrentUserId: (userId) => {
    set({ currentUserId: userId })
    if (!userId) {
      get().clearTasks()
    }
  },
  
  getCurrentUserId: () => get().currentUserId,
  
  fetchTasks: async () => {
    const userId = get().currentUserId
    if (!userId) return
    
    set({ isLoadingTasks: true })
    try {
      const taskDocs = await getTasksForUser()
      const tasks = taskDocs.map(doc => doc.toJSON() as TaskDocType)
      set({ tasks, isLoadingTasks: false })
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      set({ isLoadingTasks: false })
    }
  },
  
  addTask: (task) => {
    set(state => ({ tasks: [...state.tasks, task] }))
  },
  
  updateTask: (taskId, updates) => {
    set(state => ({
      tasks: state.tasks.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      )
    }))
  },
  
  clearTasks: () => {
    set({ tasks: [], isLoadingTasks: false })
  }
}))
