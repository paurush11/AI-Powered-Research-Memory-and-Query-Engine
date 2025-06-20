import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'react-hot-toast';
import { ModalProvider } from './context/ModalContext';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <ModalProvider>
                <App />
                <Toaster position="top-right" />
                {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
            </ModalProvider>
        </QueryClientProvider>
    </React.StrictMode>
); 