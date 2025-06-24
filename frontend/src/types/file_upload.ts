export enum FileStatus {
    DRAFT = 'draft',
    PENDING = 'pending',
    PROCESSED = 'processed',
}
// Type Definitions
export interface UploadedFile {
    id: string;
    user: number;
    file: string;
    created_at: string;
    updated_at: string;
    file_type: string;
    file_size: number;
    file_name: string;
    file_path: string;
    file_extension: string;
    file_hash: string;
    file_url: string;
    file_status: FileStatus;
    file_metadata: Record<string, string>;
    file_tags: string[];
}

export interface FileUploadRequest {
    file: File;
}

export interface FileDownloadResponse {
    download_url: string;
}

export interface UpdateFileMetadataRequest {
    file_id: string;
    file_name: string;
    file_metadata: Record<string, string>;
    file_tags: string[];
}

export interface UpdateFileStatusRequest {
    file_id: string;
    file_status: FileStatus;
}

export interface BulkUpdateFileMetadataRequest {
    file_ids: string[];
    file_status: FileStatus;
    number_of_files: number;
}