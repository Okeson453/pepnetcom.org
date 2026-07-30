import { create } from "zustand";

export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsState {
  items: NotificationItem[];
  unreadCount: number;
  setItems: (items: NotificationItem[]) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

/**
 * Client-side cache for the notification bell across Admin/Client/Writer
 * dashboards. Populated from `trpc.notifications.list` and kept in sync
 * with optimistic read-state updates so the bell badge doesn't need a
 * refetch on every click.
 */
export const useNotificationsStore = create<NotificationsState>((set) => ({
  items: [],
  unreadCount: 0,
  setItems: (items) =>
    set({ items, unreadCount: items.filter((item) => !item.read).length }),
  markRead: (id) =>
    set((state) => {
      const items = state.items.map((item) =>
        item.id === id ? { ...item, read: true } : item
      );
      return { items, unreadCount: items.filter((item) => !item.read).length };
    }),
  markAllRead: () =>
    set((state) => ({
      items: state.items.map((item) => ({ ...item, read: true })),
      unreadCount: 0,
    })),
}));
