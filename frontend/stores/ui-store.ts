import { create } from "zustand";

interface UIState {
  /** Whether the dashboard sidebar is collapsed to icon-only width. */
  sidebarCollapsed: boolean;
  /** Whether a global full-screen loading overlay should render. */
  globalLoading: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setGlobalLoading: (loading: boolean) => void;
}

/** App-shell UI state that isn't worth threading through props (sidebar, global overlays). */
export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  globalLoading: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
}));
