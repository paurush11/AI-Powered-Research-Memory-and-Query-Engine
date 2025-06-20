import Layout from './components/Layout';
import { toast } from 'react-hot-toast';
import Modal from './components/Modal';
import { useModal } from './context/ModalContext';

function App() {
    const { isOpen, open, close } = useModal();
    return (
        <Layout>
            <div className="p-4 space-y-4">
                <h1 className="text-2xl font-bold">Research Memory</h1>
                <p className="text-gray-700">Welcome! Upload your documents and start asking questions.</p>

                <div className="flex gap-4">
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        onClick={() => toast.success('This is a success toast!')}
                    >
                        Show Toast
                    </button>

                    <button
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        onClick={open}
                    >
                        Open Modal
                    </button>
                </div>

                <Modal isOpen={isOpen} onClose={close} title="Sample Modal">
                    <p>This is a modal content placeholder.</p>
                </Modal>
            </div>
        </Layout>
    );
}

export default App; 