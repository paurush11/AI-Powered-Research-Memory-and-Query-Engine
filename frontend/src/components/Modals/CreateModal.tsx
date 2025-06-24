import React, { useState } from 'react';
import { HiX, HiPlus, HiCollection } from 'react-icons/hi';

export interface BulkCreatePayload {
    name: string;
    description?: string;
    user_id?: string | null;
    number_of_projects: number;
    // Allow additional properties via index signature
    [key: string]: unknown;
}

interface CreateModalProps<T = any, B = BulkCreatePayload> {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: T) => void;
    onBulkSubmit: (payload: B) => void;
    isLoading: boolean;
    entityName?: string; // e.g. "Project", "Document"
    userId?: string | null;
}

const CreateModal = <T, B extends BulkCreatePayload = BulkCreatePayload>({
    isOpen,
    onClose,
    onSubmit,
    onBulkSubmit,
    isLoading,
    entityName = 'Item',
    userId,
}: CreateModalProps<T, B>) => {
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'draft' as 'draft' | 'published' | 'archived',
        number_of_projects: 1
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        if (isBulkMode) {
            onBulkSubmit({
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                user_id: userId,
                number_of_projects: formData.number_of_projects,
            } as unknown as B);
        } else {
            onSubmit({
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                user_id: userId,
            } as unknown as T);
        }

        // Reset form
        setFormData({
            name: '',
            description: '',
            status: 'draft',
            number_of_projects: 1
        });
    };

    const handleClose = () => {
        setFormData({
            name: '',
            description: '',
            status: 'draft',
            number_of_projects: 1
        });
        setIsBulkMode(false);
        onClose();
    };

    const handleModeToggle = () => {
        setIsBulkMode(!isBulkMode);
        // Reset number of items when switching to single mode
        if (!isBulkMode) {
            setFormData(prev => ({ ...prev, number_of_projects: 1 }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                            {isBulkMode ? `Create Multiple ${entityName}s` : `Create New ${entityName}`}
                        </h3>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <HiX className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Mode Toggle */}
                    <div className="mb-4">
                        <div className="flex items-center justify-center space-x-4">
                            <button
                                type="button"
                                onClick={handleModeToggle}
                                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${!isBulkMode
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <HiPlus className="h-4 w-4 mr-2" />
                                Single
                            </button>
                            <button
                                type="button"
                                onClick={handleModeToggle}
                                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${isBulkMode
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <HiCollection className="h-4 w-4 mr-2" />
                                Bulk
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                {isBulkMode ? `Base ${entityName} Name *` : `${entityName} Name *`}
                            </label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder={isBulkMode ? `e.g., ${entityName.toLowerCase()} (will create ${entityName.toLowerCase()}_1, ...)` : `Enter ${entityName.toLowerCase()} name`}
                                required
                            />
                            {isBulkMode && (
                                <p className="mt-1 text-xs text-gray-500">
                                    {entityName}s will be named: {formData.name ? `${formData.name}_1, ${formData.name}_2, ...` : 'name_1, name_2, ...'}
                                </p>
                            )}
                        </div>

                        {isBulkMode && (
                            <div>
                                <label htmlFor="number_of_projects" className="block text-sm font-medium text-gray-700 mb-1">
                                    Number of {entityName}s *
                                </label>
                                <input
                                    type="number"
                                    id="number_of_projects"
                                    min="1"
                                    max="100"
                                    value={formData.number_of_projects}
                                    onChange={(e) => setFormData({ ...formData, number_of_projects: parseInt(e.target.value) || 1 })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Maximum 100 {entityName.toLowerCase()}s at once
                                </p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder={`Enter ${entityName.toLowerCase()} description (optional)`}
                            />
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                id="status"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' | 'archived' })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !formData.name.trim() || (isBulkMode && formData.number_of_projects < 1)}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        {isBulkMode ? 'Creating...' : 'Creating...'}
                                    </>
                                ) : (
                                    <>
                                        {isBulkMode ? <HiCollection className="h-4 w-4 mr-2" /> : <HiPlus className="h-4 w-4 mr-2" />}
                                        {isBulkMode ? `Create ${formData.number_of_projects} ${entityName}s` : `Create ${entityName}`}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateModal; 