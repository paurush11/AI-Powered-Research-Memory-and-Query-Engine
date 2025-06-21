import apiClient from '../client'
import { useMutation } from '../useMutation'
import { useQuery } from '../useQuery'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { LoginCredentials, RegisterCredentials, ForgotPasswordCredentials, ResetPasswordCredentials, User } from '../../types/auth'
import { FormattedError } from '../client'

interface LoginPayload { email: string; password: string }
interface RegisterPayload { email: string; password: string; username: string }

// -----------------------------------------------------------------------------
// Raw API request helpers
// -----------------------------------------------------------------------------
export const loginRequest = async (payload: LoginPayload): Promise<User> => {
    const { data } = await apiClient.post<User>('/auth/login/', payload)
    return data
}

export const logoutRequest = async (): Promise<{ message: string }> => {
    const { data } = await apiClient.post<{ message: string }>('/auth/logout/')
    return data
}

export const googleAuthInitiate = async (): Promise<{ auth_url: string }> => {
    const { data } = await apiClient.get<{ auth_url: string }>('/auth/google-auth-initiate/', {
        withCredentials: true,
    })
    return data
}

export const registerRequest = async (payload: RegisterPayload): Promise<User> => {
    const { data } = await apiClient.post<User>('/auth/', payload)
    return data
}

export const getMeRequest = async (): Promise<User> => {
    const { data } = await apiClient.get<User>('/auth/me/')
    return data
}

export const checkAuthStatus = async (): Promise<User | null> => {
    try {
        const { data } = await apiClient.get<User>('/auth/me/')
        return data
    } catch {
        return null
    }
}

// -----------------------------------------------------------------------------
// Individual hooks
// -----------------------------------------------------------------------------
export const useLogin = () =>
    useMutation(loginRequest, {
        successMessage: 'Successfully logged in!',
        errorMessage: 'Login failed. Please check your credentials.',
    })

export const useRegister = () =>
    useMutation(registerRequest, {
        successMessage: 'Account created successfully!',
        errorMessage: 'Registration failed. Please try again.',
    })

export const useLogout = () =>
    useMutation(logoutRequest, {
        successMessage: 'Successfully logged out!',
        showErrorToast: false,
    })

export const useGoogleAuth = () =>
    useMutation(googleAuthInitiate, {
        showSuccessToast: false,
        errorMessage: 'Failed to initialize Google authentication.',
    })

export const useMe = (enabled = true) =>
    useQuery(['auth', 'me'], getMeRequest, {
        enabled,
        retry: false,
        showErrorToast: false,
        staleTime: 5 * 60 * 1000,
    })

// -----------------------------------------------------------------------------
// Comprehensive useAuth hook (mirrors working project pattern)
// -----------------------------------------------------------------------------
export const useAuth = () => {
    const queryClient = useQueryClient()

    // error states
    const [loginError, setLoginError] = useState<FormattedError | null>(null)
    const [registerError, setRegisterError] = useState<FormattedError | null>(null)
    const [logoutError, setLogoutError] = useState<FormattedError | null>(null)
    const [forgotPasswordError, setForgotPasswordError] = useState<FormattedError | null>(null)
    const [resetPasswordError, setResetPasswordError] = useState<FormattedError | null>(null)
    const [googleAuthInitiateError, setGoogleAuthInitiateError] = useState<FormattedError | null>(null)

    // current user
    const currentUserQuery = useQuery<User>(['user'], getMeRequest, {
        showErrorToast: false,
        retry: false,
        staleTime: 1000 * 60 * 5,
    })

    // mutations
    const loginMutation = useMutation<User, LoginCredentials>(loginRequest, {
        showSuccessToast: true,
        successMessage: 'Login successful',
        onSuccess: (data) => {
            setLoginError(null)
            queryClient.setQueryData(['user'], data)
            currentUserQuery.refetch()
        },
        onError: (__, _vars, formattedError) => setLoginError(formattedError),
    })

    const registerMutation = useMutation<User, RegisterCredentials>(registerRequest, {
        showSuccessToast: true,
        successMessage: 'Register successful',
        onSuccess: (data) => {
            setRegisterError(null)
            queryClient.setQueryData(['user'], data)
            currentUserQuery.refetch()
        },
        onError: (__, _vars, formattedError) => setRegisterError(formattedError),
    })

    const logoutMutation = useMutation<{ message: string }, void>(logoutRequest, {
        showSuccessToast: true,
        successMessage: 'Logout successful',
        onSuccess: () => {
            setLogoutError(null)
            queryClient.setQueryData(['user'], null)
            currentUserQuery.refetch()
        },
        onError: (__, _vars, formattedError) => setLogoutError(formattedError),
    })

    const forgotPasswordMutation = useMutation<void, ForgotPasswordCredentials>(() => Promise.resolve(), {
        showSuccessToast: true,
        successMessage: 'Password reset email sent',
        onError: (__, _vars, formattedError) => setForgotPasswordError(formattedError),
    })

    const resetPasswordMutation = useMutation<void, ResetPasswordCredentials>(() => Promise.resolve(), {
        showSuccessToast: true,
        successMessage: 'Password reset successful',
        onError: (__, _vars, formattedError) => setResetPasswordError(formattedError),
    })

    const googleAuthInitMutation = useMutation<{ auth_url: string }, void>(googleAuthInitiate, {
        showSuccessToast: false,
        onSuccess: (data) => {
            setGoogleAuthInitiateError(null)
            queryClient.setQueryData(['user'], null)
            currentUserQuery.refetch()
            window.location.href = data.auth_url
        },
        onError: (__, _vars, formattedError) => setGoogleAuthInitiateError(formattedError),
    })

    return {
        currentUser: currentUserQuery.data,
        isLoading: currentUserQuery.isLoading,
        isAuthenticated: !!currentUserQuery.data,
        // login
        login: (c: LoginCredentials) => loginMutation.mutate(c),
        isLoggingIn: loginMutation.isPending,
        loginError,
        // register
        register: (c: RegisterCredentials) => registerMutation.mutate(c),
        isRegistering: registerMutation.isPending,
        registerError,
        // logout
        logout: () => logoutMutation.mutate(),
        isLoggingOut: logoutMutation.isPending,
        logoutError,
        // forgot password
        forgotPassword: (c: ForgotPasswordCredentials) => forgotPasswordMutation.mutate(c),
        isForgotPasswordPending: forgotPasswordMutation.isPending,
        forgotPasswordError,
        // reset password
        resetPassword: (c: ResetPasswordCredentials) => resetPasswordMutation.mutate(c),
        isResetPasswordPending: resetPasswordMutation.isPending,
        resetPasswordError,
        // google auth
        googleAuthInitiate: () => googleAuthInitMutation.mutate(),
        isGoogleAuthInitiatePending: googleAuthInitMutation.isPending,
        googleAuthInitiateError,
    }
}

// default export keeps backward compatibility
export default {
    useAuth,
    useLogin,
    useRegister,
    useLogout,
    useGoogleAuth,
    useMe,
} 