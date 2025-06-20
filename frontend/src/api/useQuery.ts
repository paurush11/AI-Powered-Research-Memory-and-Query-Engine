// src/hooks/useQuery.ts
import { useQuery as useTanstackQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'react-hot-toast';
import { ApiError, QueryOptions } from './client';

export function useQuery<TData = unknown, TError = AxiosError<ApiError>>(
    queryKey: readonly unknown[],
    queryFn: () => Promise<TData>,
    options?: QueryOptions,
) {
    const { showErrorToast = true, errorMessage, ...restOptions } = options || {};

    const result = useTanstackQuery<TData, TError>({
        queryKey,
        queryFn,
        ...restOptions,
    });
    if (showErrorToast) {
        const axiosError = result.error as AxiosError<ApiError>;
        const errorData = axiosError.response?.data;

        let errorMessageToShow = errorMessage;
        if (!errorMessageToShow && errorData) {
            const fieldErrors = Object.entries(errorData)
                .map(([field, errors]) => {
                    if (Array.isArray(errors)) {
                        return `${field}: ${errors.join(', ')}`;
                    }
                    return `${field}: ${errors}`;
                })
                .join('\n');

            errorMessageToShow = fieldErrors || axiosError.message || 'An error occurred';
        } else {
            errorMessageToShow = axiosError.message || 'An error occurred';
        }

        toast.error(errorMessageToShow);
    }
    if (restOptions.onError) {
        restOptions.onError(result.error as AxiosError<ApiError>);
    }

    return result;
}