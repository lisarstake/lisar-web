import { create } from 'zustand'

type AppState = {
  isSidebarOpen: boolean
}

type AppActions = {
  toggleSidebar: () => void
}

export const useAppStore = create<AppState & AppActions>()((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
}))


