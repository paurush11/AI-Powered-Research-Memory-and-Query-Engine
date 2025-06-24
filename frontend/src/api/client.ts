import axios, { AxiosError } from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface ApiError {
    errors?: Record<string, string[]>;
    message?: string;
}


export interface QueryOptions {
    showErrorToast?: boolean;
    errorMessage?: string;
    [key: string]: any;
}

function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }
    return null;
}

const getCsrfToken = () => getCookie('csrftoken') ?? null;
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
    if (config.method !== 'get') {
        const csrfToken = getCsrfToken();
        if (csrfToken) {
            config.headers['X-CSRFToken'] = csrfToken;
        }
    }
    return config;
});
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiError>) => {
        const errorMessage = getErrorMessage(error)
        return Promise.reject(error)
    }
)
const getErrorMessage = (error: AxiosError<ApiError>) => {
    if (error.response?.data?.errors) {
        const errors = error.response.data.errors
        return Object.values(errors).flat().join(', ');
    }
    if (error.response?.data?.message) {
        return error.response.data.message
    }
    return errorMessages[error.response?.status || 500] || 'An unexpected error occurred'
}

const errorMessages: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized - Please login again',
    403: 'Forbidden - You do not have permission',
    404: 'Resource not found',
    409: 'Conflict - Resource already exists',
    422: 'Validation Error',
    429: 'Too many requests - Please try again later',
    500: 'Server Error - Please try again later',
};

export interface MutationOptions<TData, TVariables> {
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: AxiosError<ApiError>, variables: TVariables, formattedError: { message: string; fieldErrors?: Record<string, string[]> }) => void;
    invalidateQueries?: readonly unknown[] | undefined;
    [key: string]: any;
}

export interface FormattedError {
    message: string;
    fieldErrors?: Record<string, string[]>;
}

export default apiClient;