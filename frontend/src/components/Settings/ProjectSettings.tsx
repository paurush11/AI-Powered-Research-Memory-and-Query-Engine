import { useProject } from "@/api/project/projects";
import { useParams } from "react-router-dom";

const ProjectSettings = () => {
    const { projectId } = useParams();
    const { data: projectData } = useProject(projectId || '', Boolean(projectId));
    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Project Settings</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Project Name</label>
                        <input
                            type="text"
                            value={projectData?.name || ''}
                            readOnly
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            value={projectData?.description || ''}
                            readOnly
                            rows={3}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <input
                            type="text"
                            value={projectData?.status || ''}
                            readOnly
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
};

export default ProjectSettings;