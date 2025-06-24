import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useDownloadFile, useFile, useUpdateFileMetadata } from '@/api/file_upload/file_upload'
import { toast } from 'react-hot-toast'
import { HiArrowLeft, HiPencil, HiX, HiPlus, HiTag, HiInformationCircle, HiDocument, HiDownload, HiExternalLink, HiCheck } from 'react-icons/hi'
import FileViewer from './FileViewer'
import PageLayout from '../PageLayout'

const FileMetadata = () => {
    const { fileId, projectId } = useParams()
    const navigate = useNavigate()
    const [isEditing, setIsEditing] = useState(false)
    const [metadata, setMetadata] = useState<Record<string, any>>({})
    const [tags, setTags] = useState<string[]>([])
    const [fileName, setFileName] = useState('')
    const [activeTab, setActiveTab] = useState<'preview' | 'details'>('preview')
    const [newMetadataKey, setNewMetadataKey] = useState('')
    const [newMetadataValue, setNewMetadataValue] = useState('')
    const [newTag, setNewTag] = useState('')

    if (!fileId) return <div className="p-6 text-center text-gray-500">File not found</div>

    const { data: file, isLoading, refetch } = useFile(fileId)
    const updateMetadataMutation = useUpdateFileMetadata()
    const downloadFileMutation = useDownloadFile()

    // Initialize form data when file loads
    useEffect(() => {
        if (file && !isEditing) {
            setMetadata(file.file_metadata || {})
            setTags(file.file_tags || [])
            setFileName(file.file_name || '')
        }
    }, [file, isEditing])

    if (isLoading) return (
        <div className="p-6">
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
            </div>
        </div>
    )

    if (!file) return <div className="p-6 text-center text-gray-500">File not found</div>

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString()
    }

    const handleSave = async () => {
        if (!fileId) return

        try {
            await updateMetadataMutation.mutateAsync({
                file_id: fileId,
                file_name: fileName,
                file_metadata: metadata,
                file_tags: tags
            })
            setIsEditing(false)
            refetch()
            toast.success('File metadata updated successfully')
        } catch (error) {
            console.error('Failed to update metadata:', error)
            toast.error('Failed to update metadata')
        }
    }



    const handleCancel = () => {
        setMetadata(file.file_metadata || {})
        setTags(file.file_tags || [])
        setFileName(file.file_name || '')
        setIsEditing(false)
        setNewMetadataKey('')
        setNewMetadataValue('')
        setNewTag('')
    }

    const addMetadataField = () => {
        if (newMetadataKey.trim() && newMetadataValue.trim()) {
            setMetadata({ ...metadata, [newMetadataKey.trim()]: newMetadataValue.trim() })
            setNewMetadataKey('')
            setNewMetadataValue('')
        }
    }

    const removeMetadataField = (key: string) => {
        const newMetadata = { ...metadata }
        delete newMetadata[key]
        setMetadata(newMetadata)
    }

    const updateMetadataField = (key: string, value: string) => {
        setMetadata({ ...metadata, [key]: value })
    }

    const addTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()])
            setNewTag('')
        }
    }

    const removeTag = (index: number) => {
        setTags(tags.filter((_, i) => i !== index))
    }

    const updateTag = (index: number, value: string) => {
        const newTags = [...tags]
        newTags[index] = value
        setTags(newTags)
    }

    const handleDownload = async () => {
        const blob = await downloadFileMutation.mutateAsync({ file_id: fileId })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = file.file_name
        a.click()
        URL.revokeObjectURL(url)
    }
    const renderActionButton = (icon: React.ReactNode, text: string, onClick: () => void) => {
        return (
            <button onClick={onClick} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                {icon}
                {text}
            </button>
        )
    }

    const actions = (
        <div className="flex items-center space-x-4">
            {renderActionButton(<HiArrowLeft className="h-4 w-4" />, 'Back', () => navigate(`/projects/${projectId}`))}
            {renderActionButton(<HiDownload className="h-4 w-4" />, 'Download', handleDownload)}
            {renderActionButton(<HiExternalLink className="h-4 w-4" />, 'Open', () => window.open(file.file_url, '_blank', 'noopener,noreferrer'))}
            {renderActionButton(<HiPencil className="h-4 w-4" />, 'Edit', () => setIsEditing(!isEditing))}
        </div>
    )



    return (
        <PageLayout title={file.file_name} subtitle={file.file_type + ' • ' + formatFileSize(file.file_size)} icon={<HiDocument className="h-8 w-8 text-blue-500" />} actions={actions}>
            <div className="space-y-4 flex flex-col flex-1 h-full">
                {/* Tabs */}
                <div className="bg-white rounded-lg border border-gray-200 flex flex-col flex-1 h-full">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-4">
                            <button
                                onClick={() => setActiveTab('preview')}
                                className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'preview'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <HiDocument className="h-4 w-4" />
                                <span>Preview</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('details')}
                                className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === 'details'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                <HiInformationCircle className="h-4 w-4" />
                                <span>Details</span>
                            </button>
                        </nav>
                    </div>

                    <div className="p-4 flex flex-col flex-1 h-full">
                        {activeTab === 'preview' && (
                            <FileViewer file={file} />
                        )}

                        {activeTab === 'details' && (
                            <div className="space-y-6 flex flex-col flex-1 h-full">
                                {/* Basic Information */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                File Name
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={fileName}
                                                    onChange={(e) => setFileName(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <p className="text-gray-900">{file.file_name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                File Type
                                            </label>
                                            <p className="text-gray-900">{file.file_type}</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                File Size
                                            </label>
                                            <p className="text-gray-900">{formatFileSize(file.file_size)}</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Created
                                            </label>
                                            <p className="text-gray-900">{formatDate(file.created_at)}</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Last Modified
                                            </label>
                                            <p className="text-gray-900">{formatDate(file.updated_at)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Metadata</h3>
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            {/* Add new metadata field */}
                                            <div className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    value={newMetadataKey}
                                                    onChange={(e) => setNewMetadataKey(e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Field name"
                                                />
                                                <input
                                                    type="text"
                                                    value={newMetadataValue}
                                                    onChange={(e) => setNewMetadataValue(e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Value"
                                                />
                                                <button
                                                    onClick={addMetadataField}
                                                    disabled={!newMetadataKey.trim() || !newMetadataValue.trim()}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                                >
                                                    <HiPlus className="h-4 w-4" />
                                                    <span>Add</span>
                                                </button>
                                            </div>

                                            {/* Existing metadata fields */}
                                            {Object.entries(metadata).map(([key, value]) => (
                                                <div key={key} className="flex space-x-2">
                                                    <input
                                                        type="text"
                                                        value={key}
                                                        onChange={(e) => {
                                                            const newMetadata = { ...metadata }
                                                            delete newMetadata[key]
                                                            newMetadata[e.target.value] = value
                                                            setMetadata(newMetadata)
                                                        }}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Field name"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={value}
                                                        onChange={(e) => updateMetadataField(key, e.target.value)}
                                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Value"
                                                    />
                                                    <button
                                                        onClick={() => removeMetadataField(key)}
                                                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                    >
                                                        <HiX className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {Object.keys(metadata).length > 0 ? (
                                                Object.entries(metadata).map(([key, value]) => (
                                                    <div key={key} className="flex justify-between py-2 border-b border-gray-200">
                                                        <span className="font-medium text-gray-700">{key}:</span>
                                                        <span className="text-gray-900">{String(value)}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 italic">No custom metadata</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Tags */}
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                        <HiTag className="h-5 w-5" />
                                        <span>Tags</span>
                                    </h3>
                                    {isEditing ? (
                                        <div className="space-y-4">
                                            {/* Add new tag */}
                                            <div className="flex space-x-2">
                                                <input
                                                    type="text"
                                                    value={newTag}
                                                    onChange={(e) => setNewTag(e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Enter new tag"
                                                />
                                                <button
                                                    onClick={addTag}
                                                    disabled={!newTag.trim() || tags.includes(newTag.trim())}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1"
                                                >
                                                    <HiPlus className="h-4 w-4" />
                                                    <span>Add</span>
                                                </button>
                                            </div>

                                            {/* Existing tags */}
                                            <div className="space-y-2">
                                                {tags.map((tag, index) => (
                                                    <div key={index} className="flex space-x-2">
                                                        <input
                                                            type="text"
                                                            value={tag}
                                                            onChange={(e) => updateTag(index, e.target.value)}
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Tag name"
                                                        />
                                                        <button
                                                            onClick={() => removeTag(index)}
                                                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                                        >
                                                            <HiX className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {tags.length > 0 ? (
                                                tags.map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 italic">No tags</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Save/Cancel buttons for editing mode */}
                                {isEditing && (
                                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={handleCancel}
                                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={updateMetadataMutation.isPending}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                                        >
                                            {updateMetadataMutation.isPending ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    <span>Saving...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <HiCheck className="h-4 w-4" />
                                                    <span>Save Changes</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageLayout>
    )
}

export default FileMetadata