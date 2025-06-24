import apiClient from '@/api/client'
import { Project, CreateProjectRequest, UpdateProjectRequest } from '@/types/projects'
import { useQuery } from '@/api/useQuery'
import { useMutation } from '@/api/useMutation'
import { UploadedFile } from '@/types/file_upload'

// Raw API request helpers
export const fetchProjectsRequest = async (): Promise<Project[]> => {
    const { data } = await apiClient.get<Project[]>('/projects/')
    return data
}

export const fetchProjectRequest = async (id: string): Promise<Project> => {
    const { data } = await apiClient.get<Project>(`/projects/${id}/`)
    return data
}

export const createProjectRequest = async (payload: CreateProjectRequest): Promise<Project> => {
    const { data } = await apiClient.post<Project>('/projects/', payload)
    return data
}

export const bulkCreateProjectsRequest = async (payload: {
    name: string;
    description?: string;
    user_id: string | null;
    number_of_projects: number;
    status?: 'draft' | 'published' | 'archived';
}): Promise<Project[]> => {
    const { data } = await apiClient.post<Project[]>('/projects/bulk_create/', payload)
    return data
}

export const updateProjectRequest = async (payload: UpdateProjectRequest): Promise<Project> => {
    const { data } = await apiClient.patch<Project>(`/projects/${payload.id}/`, payload)
    return data
}

export const deleteProjectRequest = async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}/`)
}

export const togglePinProjectRequest = async (id: string): Promise<Project> => {
    const { data } = await apiClient.patch<Project>(`/projects/${id}/toggle-pin/`)
    return data
}

export const toggleFavoriteProjectRequest = async (id: string): Promise<Project> => {
    const { data } = await apiClient.patch<Project>(`/projects/${id}/toggle-favorite/`)
    return data
}

export const toggleShareProjectRequest = async (id: string): Promise<Project> => {
    const { data } = await apiClient.patch<Project>(`/projects/${id}/toggle-share/`)
    return data
}

export const updateProjectStatusRequest = async (payload: { id: string, status: string }): Promise<Project> => {
    const { data } = await apiClient.patch<Project>(`/projects/${payload.id}/update-status/`, { status: payload.status })
    return data
}

export const fetchProjectFilesRequest = async (id: string): Promise<UploadedFile[]> => {
    const { data } = await apiClient.get<UploadedFile[]>(`/projects/${id}/files/`)
    return data
}

// --- BULK ACTIONS ---
export const bulkDeleteProjectsRequest = async (payload: { project_ids: string[] }): Promise<void> => {
    await apiClient.post('/projects/bulk-delete/', payload)
}

export const bulkUpdateProjectsRequest = async (payload: { project_ids: string[], action: string, action_value?: boolean, status?: string }): Promise<void> => {
    await apiClient.post('/projects/bulk-update/', payload)
}

// React Query hooks
export const useProjects = (enabled = true) =>
    useQuery(['projects', 'list'], fetchProjectsRequest, {
        enabled,
        staleTime: 5 * 60 * 1000,
        errorMessage: 'Failed to fetch projects',
    })

export const useProject = (id: string, enabled = true) =>
    useQuery(['projects', 'detail', id], () => fetchProjectRequest(id), {
        enabled,
        staleTime: 5 * 60 * 1000,
        errorMessage: 'Failed to fetch project',
    })

export const useCreateProject = () =>
    useMutation(createProjectRequest, {
        successMessage: 'Project created successfully',
        errorMessage: 'Failed to create project',
        invalidateQueries: ['projects', 'list'],
    })

export const useBulkCreateProjects = () =>
    useMutation(bulkCreateProjectsRequest, {
        successMessage: 'Projects created successfully',
        errorMessage: 'Failed to create projects',
        invalidateQueries: ['projects', 'list'],
    })

export const useBulkDeleteProjects = () =>
    useMutation(bulkDeleteProjectsRequest, {
        successMessage: 'Projects deleted successfully',
        errorMessage: 'Failed to delete projects',
        invalidateQueries: ['projects', 'list'],
    })

export const useBulkUpdateProjects = () =>
    useMutation(bulkUpdateProjectsRequest, {
        successMessage: 'Projects updated successfully',
        errorMessage: 'Failed to update projects',
        invalidateQueries: ['projects', 'list'],
    })

export const useUpdateProject = () =>
    useMutation(updateProjectRequest, {
        successMessage: 'Project updated successfully',
        errorMessage: 'Failed to update project',
        invalidateQueries: ['projects', 'list'],
    })

export const useDeleteProject = () =>
    useMutation(deleteProjectRequest, {
        successMessage: 'Project deleted successfully',
        errorMessage: 'Failed to delete project',
        invalidateQueries: ['projects', 'list'],
    })

export const useTogglePinProject = () =>
    useMutation(togglePinProjectRequest, {
        successMessage: 'Project pin status updated',
        errorMessage: 'Failed to update pin status',
        invalidateQueries: ['projects', 'list'],
    })

export const useToggleFavoriteProject = () =>
    useMutation(toggleFavoriteProjectRequest, {
        successMessage: 'Project favorite status updated',
        errorMessage: 'Failed to update favorite status',
        invalidateQueries: ['projects', 'list'],
    })

export const useToggleShareProject = () =>
    useMutation(toggleShareProjectRequest, {
        successMessage: 'Project share status updated',
        errorMessage: 'Failed to update share status',
        invalidateQueries: ['projects', 'list'],
    })

export const useUpdateProjectStatus = () =>
    useMutation(updateProjectStatusRequest, {
        successMessage: 'Project status updated successfully',
        errorMessage: 'Failed to update project status',
        invalidateQueries: ['projects', 'list'],
    })


export const useFetchProjectFiles = (id: string, enabled = true) =>
    useQuery(['projects', 'files', id], () => fetchProjectFilesRequest(id), {
        enabled,
        staleTime: 5 * 60 * 1000,
        errorMessage: 'Failed to fetch project files',
    })