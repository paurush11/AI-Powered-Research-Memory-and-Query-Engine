import { HiChartBar, HiCog, HiDocument } from "react-icons/hi";
import { useFetchProjectFiles } from "@/api/project/projects";

import PageLayout from "../PageLayout";
import { useParams } from "react-router-dom";

const Analysis = () => {
    const { projectId } = useParams();
    const { data: files } = useFetchProjectFiles(projectId || '', Boolean(projectId));
    return (
        <PageLayout title="Analysis" subtitle="Analyze your project" icon={<HiChartBar className="h-8 w-8 text-blue-500" />}>
            <div className="space-y-6">
                {/* Analysis Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <HiDocument className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Files</p>
                                <p className="text-2xl font-semibold text-gray-900">{files?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <HiChartBar className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Analysis Status</p>
                                <p className="text-2xl font-semibold text-gray-900">Ready</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <HiCog className="h-8 w-8 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Last Updated</p>
                                <p className="text-2xl font-semibold text-gray-900">Today</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analysis Actions */}
                <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Tools</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                            <h4 className="font-medium text-gray-900">Document Summarization</h4>
                            <p className="text-sm text-gray-500 mt-1">Generate summaries of your documents</p>
                        </button>
                        <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                            <h4 className="font-medium text-gray-900">Keyword Extraction</h4>
                            <p className="text-sm text-gray-500 mt-1">Extract key terms and concepts</p>
                        </button>
                        <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                            <h4 className="font-medium text-gray-900">Topic Modeling</h4>
                            <p className="text-sm text-gray-500 mt-1">Discover main topics in your documents</p>
                        </button>
                        <button className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                            <h4 className="font-medium text-gray-900">Sentiment Analysis</h4>
                            <p className="text-sm text-gray-500 mt-1">Analyze sentiment across documents</p>
                        </button>
                    </div>
                </div>

                {/* Analysis Results */}
                <div className="bg-white p-6 rounded-lg border">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Analysis</h3>
                    <div className="text-center py-8">
                        <HiChartBar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No analysis yet</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Upload files and run analysis to see results here.
                        </p>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
}
export default Analysis;