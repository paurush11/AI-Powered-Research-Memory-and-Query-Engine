export enum ProjectStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    status: ProjectStatus;
    is_deleted: boolean;
    is_pinned: boolean;
    is_favorite: boolean;
    is_shared: boolean;
    user_id: string;
    created_at: string;
    updated_at: string;
    is_selected?: boolean;
}

export interface CreateProjectRequest {
    name: string;
    description?: string;
    user_id: string | null;
}

export interface UpdateProjectRequest {
    id: string;
    name?: string;
    description?: string;
    status?: 'draft' | 'published' | 'archived';
    is_pinned?: boolean;
    is_favorite?: boolean;
    is_shared?: boolean;
} 