import apiClient from '@/api/client';
import { useMutation } from '@/api/useMutation';
import { useQuery } from '@/api/useQuery';
import { FileUploadRequest, FileDownloadResponse, UploadedFile, UpdateFileMetadataRequest, UpdateFileStatusRequest, BulkUpdateFileMetadataRequest } from '@/types/file_upload';


// Raw API Request Helpers
export const uploadFileRequest = async (payload: FileUploadRequest): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('file', payload.file);
    const { data } = await apiClient.post<UploadedFile>('/files/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data;
};

export const fetchFilesRequest = async (): Promise<UploadedFile[]> => {
    const { data } = await apiClient.get<UploadedFile[]>('/files/');
    return data;
}

export const fetchFileRequest = async (id: string): Promise<UploadedFile> => {
    const { data } = await apiClient.get<UploadedFile>(`/files/${id}/`);
    return data;
}

export const deleteFileRequest = async (id: string): Promise<void> => {
    await apiClient.delete(`/files/${id}/`);
}
export const attachFileRequest = async (id: string, file_id: string): Promise<UploadedFile> => {
    const { data } = await apiClient.post<UploadedFile>(`/projects/${id}/attach-file/`, { file_id });
    return data;
}

export const updateFileMetadataRequest = async (payload: UpdateFileMetadataRequest): Promise<void> => {
    const { file_id, ...metadataData } = payload;
    await apiClient.post(`/files/${file_id}/update-file-metadata/`, metadataData);
}

export const updateFileStatusRequest = async (payload: UpdateFileStatusRequest): Promise<void> => {
    await apiClient.post(`/files/${payload.file_id}/update-file-status/`, payload);
}

export const bulkUpdateFileMetadataRequest = async (payload: BulkUpdateFileMetadataRequest): Promise<void> => {
    await apiClient.post(`/files/bulk-update-file-metadata/`, payload);
}

export const downloadFileRequest = async (payload: { file_id: string }): Promise<Blob> => {
    const { data } = await apiClient.get(`/files/${payload.file_id}/download/`, {
        responseType: 'blob',
    });
    return data;
}

// React Query Hooks
export const useUploadFile = () =>
    useMutation(uploadFileRequest, {
        successMessage: 'File uploaded successfully',
        errorMessage: 'Failed to upload file',
    });

export const useFiles = (enabled = true) =>
    useQuery(['files', 'list'], fetchFilesRequest, {
        enabled,
        staleTime: 5 * 60 * 1000, // 5 minutes
        errorMessage: 'Failed to fetch files',
    });

export const useFile = (id: string, enabled = true) =>
    useQuery(['files', 'detail', id], () => fetchFileRequest(id), {
        enabled,
        staleTime: 5 * 60 * 1000,
        errorMessage: 'Failed to fetch file details',
    });



export const useDownloadFile = () =>
    useMutation(downloadFileRequest, {
        successMessage: '',
        errorMessage: '',
    });

export const useDeleteFile = () =>
    useMutation(deleteFileRequest, {
        successMessage: 'File deleted successfully',
        errorMessage: 'Failed to delete file',
    });

export const useUpdateFileMetadata = () =>
    useMutation(updateFileMetadataRequest, {
        successMessage: 'File metadata updated successfully',
        errorMessage: 'Failed to update file metadata',
        invalidateQueries: ['files', 'detail', 'list'],
    });

export const useUpdateFileStatus = () =>
    useMutation(updateFileStatusRequest, {
        successMessage: 'File status updated successfully',
        errorMessage: 'Failed to update file status',
        invalidateQueries: ['files', 'detail', 'list'],
    });

export const useBulkUpdateFileMetadata = () =>
    useMutation(bulkUpdateFileMetadataRequest, {
        successMessage: 'File metadata updated successfully',
        errorMessage: 'Failed to update file metadata',
        invalidateQueries: ['files', 'detail', 'list'],
    });

