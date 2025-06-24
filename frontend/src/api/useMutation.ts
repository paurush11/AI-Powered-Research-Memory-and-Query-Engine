import { useMutation as useTanstackMutation, useQueryClient } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { ApiError, MutationOptions, FormattedError } from './client'
import { toast } from 'react-hot-toast';


const formatErrorMessage = (errorData: any): FormattedError => {
    if (!errorData) return { message: 'An error occurred' };

    if (typeof errorData === 'object') {
        const fieldErrors = Object.entries(errorData).reduce((acc, [field, errors]) => {
            if (Array.isArray(errors)) {
                acc[field] = errors;
            } else {
                acc[field] = [errors as string];
            }
            return acc;
        }, {} as Record<string, string[]>);

        const message = Object.entries(fieldErrors)
            .map(([field, errors]) => `${field}: ${errors[0]}`)
            .join('\n');

        return {
            message,
            fieldErrors
        };
    }

    return { message: String(errorData) };
};

export function useMutation<TData = unknown, TVariables = void, TError = AxiosError<ApiError>>(
    mutationFn: (variables: TVariables) => Promise<TData>,
    options?: MutationOptions<TData, TVariables>
) {
    const queryClient = useQueryClient();
    const {
        showSuccessToast = true,
        showErrorToast = true,
        successMessage,
        errorMessage,
        onSuccess,
        onError,
        invalidateQueries,
        ...restOptions } = options || {};


    const result = useTanstackMutation<TData, TError, TVariables>({
        mutationFn,
        onSuccess: (data, variables) => {
            if (showSuccessToast && successMessage) {
                toast.success(successMessage);
            }

            if (invalidateQueries) {
                if (Array.isArray(invalidateQueries)) {
                    invalidateQueries.forEach(queryKey => {
                        queryClient.invalidateQueries({ queryKey });
                    });
                } else {
                    queryClient.invalidateQueries({ queryKey: invalidateQueries });
                }
            }

            if (onSuccess) {
                onSuccess(data, variables);
            }
        },

        onError: (error: TError, variables) => {
            if (showErrorToast) {
                const axiosError = error as AxiosError;
                const errorData = axiosError.response?.data;
                const formattedError = formatErrorMessage(errorData);

                if (onError) {
                    onError(axiosError as AxiosError<ApiError>, variables, formattedError);
                }

                toast.error(errorMessage || formattedError.message);
            }
        },

        ...restOptions,
    });

    return {
        ...result,
        formattedError: result.error
            ? formatErrorMessage((result.error as unknown as AxiosError).response?.data)
            : undefined
    }

}