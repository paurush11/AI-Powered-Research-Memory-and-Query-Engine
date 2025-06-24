import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    setCollapsed: (isCollapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
    persist(
        (set) => ({
            isCollapsed: true, // Default to collapsed
            toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
            setCollapsed: (isCollapsed) => set({ isCollapsed }),
        }),
        {
            name: 'sidebar-storage', // name of the item in the storage (must be unique)
        }
    )
); 