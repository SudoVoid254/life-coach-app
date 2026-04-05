import { create } from 'zustand'
import { initializeDB, saveToDB, loadFromDB, deleteFromDB } from '../utils/storage'

export const useAppStore = create((set, get) => ({
  // State
  habits: [],
  moods: [],
  journalEntries: [],
  feedItems: [],
  isLoading: true,
  error: null,

  // Initialize
  initialize: async () => {
    try {
      await initializeDB()
      const habits = await loadFromDB('habits')
      const moods = await loadFromDB('moods')
      const journalEntries = await loadFromDB('journalEntries')
      let feedItems = await loadFromDB('feedItems')

      // Auto-add default sources on first load
      if (!feedItems || feedItems.length === 0) {
        const defaultSources = [
          { title: 'BBC News', url: 'https://bbc.com', source: 'Default' },
          { title: 'The New York Times', url: 'https://nytimes.com', source: 'Default' },
          { title: 'The Guardian', url: 'https://theguardian.com', source: 'Default' },
          { title: 'Reuters', url: 'https://reuters.com', source: 'Default' },
          { title: 'CNN', url: 'https://cnn.com', source: 'Default' },
          { title: 'The Washington Post', url: 'https://washingtonpost.com', source: 'Default' },
        ]
        feedItems = defaultSources.map((item) => (({
          id: Date.now().toString() + Math.random(),
          createdAt: new Date().toISOString(),
          notes: '',
          ...item,
        })))
        await saveToDB('feedItems', feedItems)
      }

      set({
        habits: habits || [],
        moods: moods || [],
        journalEntries: journalEntries || [],
        feedItems: feedItems || [],
        isLoading: false,
      })
    } catch (err) {
      set({ error: err.message, isLoading: false })
      console.error('Failed to initialize:', err)
    }
  },

  // Habits
  addHabit: (habit) => {
    const newHabit = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...habit,
    }
    set((state) => {
      const updated = [...state.habits, newHabit]
      saveToDB('habits', updated)
      return { habits: updated }
    })
    return newHabit
  },

  updateHabit: (id, updates) => {
    set((state) => {
      const updated = state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h))
      saveToDB('habits', updated)
      return { habits: updated }
    })
  },

  deleteHabit: (id) => {
    set((state) => {
      const updated = state.habits.filter((h) => h.id !== id)
      saveToDB('habits', updated)
      return { habits: updated }
    })
  },

  // Moods
  addMood: (mood) => {
    const newMood = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...mood,
    }
    set((state) => {
      const updated = [...state.moods, newMood]
      saveToDB('moods', updated)
      return { moods: updated }
    })
    return newMood
  },

  deleteMood: (id) => {
    set((state) => {
      const updated = state.moods.filter((m) => m.id !== id)
      saveToDB('moods', updated)
      return { moods: updated }
    })
  },

  // Journal
  addJournalEntry: (entry) => {
    const newEntry = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...entry,
    }
    set((state) => {
      const updated = [...state.journalEntries, newEntry]
      saveToDB('journalEntries', updated)
      return { journalEntries: updated }
    })
    return newEntry
  },

  updateJournalEntry: (id, updates) => {
    set((state) => {
      const updated = state.journalEntries.map((e) =>
        e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
      )
      saveToDB('journalEntries', updated)
      return { journalEntries: updated }
    })
  },

  deleteJournalEntry: (id) => {
    set((state) => {
      const updated = state.journalEntries.filter((e) => e.id !== id)
      saveToDB('journalEntries', updated)
      return { journalEntries: updated }
    })
  },

  // Feed
  addFeedItem: (item) => {
    const newItem = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...item,
    }
    set((state) => {
      const updated = [...state.feedItems, newItem]
      saveToDB('feedItems', updated)
      return { feedItems: updated }
    })
    return newItem
  },

  deleteFeedItem: (id) => {
    set((state) => {
      const updated = state.feedItems.filter((f) => f.id !== id)
      saveToDB('feedItems', updated)
      return { feedItems: updated }
    })
  },

  // Export/Import
  exportData: () => {
    const state = get()
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      habits: state.habits,
      moods: state.moods,
      journalEntries: state.journalEntries,
      feedItems: state.feedItems,
    }
  },

  importData: async (data) => {
    try {
      if (data.version !== '1.0') {
        throw new Error('Invalid backup version')
      }
      set({
        habits: data.habits || [],
        moods: data.moods || [],
        journalEntries: data.journalEntries || [],
        feedItems: data.feedItems || [],
      })
      // Save to DB
      await saveToDB('habits', data.habits || [])
      await saveToDB('moods', data.moods || [])
      await saveToDB('journalEntries', data.journalEntries || [])
      await saveToDB('feedItems', data.feedItems || [])
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  clearAllData: async () => {
    try {
      await deleteFromDB('habits')
      await deleteFromDB('moods')
      await deleteFromDB('journalEntries')
      await deleteFromDB('feedItems')
      set({
        habits: [],
        moods: [],
        journalEntries: [],
        feedItems: [],
      })
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },
}))
