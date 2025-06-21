import apiClient from '@/api/client'
import { Project, CreateProjectRequest, UpdateProjectRequest } from '@/types/projects'
import { useQuery } from '@/api/useQuery'
import { useMutation } from '@/api/useMutation'

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

export const archiveProjectRequest = async (id: string): Promise<Project> => {
    const { data } = await apiClient.patch<Project>(`/projects/${id}/archive/`)
    return data
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
    })

export const useUpdateProject = () =>
    useMutation(updateProjectRequest, {
        successMessage: 'Project updated successfully',
        errorMessage: 'Failed to update project',
    })

export const useDeleteProject = () =>
    useMutation(deleteProjectRequest, {
        successMessage: 'Project deleted successfully',
        errorMessage: 'Failed to delete project',
    })

export const useTogglePinProject = () =>
    useMutation(togglePinProjectRequest, {
        successMessage: 'Project pin status updated',
        errorMessage: 'Failed to update pin status',
    })

export const useToggleFavoriteProject = () =>
    useMutation(toggleFavoriteProjectRequest, {
        successMessage: 'Project favorite status updated',
        errorMessage: 'Failed to update favorite status',
    })

export const useToggleShareProject = () =>
    useMutation(toggleShareProjectRequest, {
        successMessage: 'Project share status updated',
        errorMessage: 'Failed to update share status',
    })

export const useArchiveProject = () =>
    useMutation(archiveProjectRequest, {
        successMessage: 'Project archived successfully',
        errorMessage: 'Failed to archive project',
    })
