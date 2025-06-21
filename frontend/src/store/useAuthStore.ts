import { create } from 'zustand'
import { useAuth } from '../api/auth/auth'
import { useEffect } from 'react'

interface User {
    id: string
    email: string
    username?: string
    first_name?: string
    last_name?: string
    [key: string]: any
}

interface AuthState {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    setUser: (user: User | null) => void
    setIsLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setIsLoading: (loading) => set({ isLoading: loading }),
}))

// Unified hook that keeps Zustand store and React Query auth state in sync
export const useAuthContext = () => {
    const authHook = useAuth()
    const { user, isAuthenticated, isLoading } = useAuthStore()

    // Sync Zustand store with React Query auth hook
    useEffect(() => {
        useAuthStore.setState({
            user: authHook.currentUser || null,
            isAuthenticated: authHook.isAuthenticated,
            isLoading: authHook.isLoading,
        })
    }, [authHook.currentUser, authHook.isAuthenticated, authHook.isLoading])

    return {
        // Expose all authHook methods & states first
        ...authHook,
        // Add alias to Zustand user (may be same as authHook.currentUser)
        user,
    }
} 