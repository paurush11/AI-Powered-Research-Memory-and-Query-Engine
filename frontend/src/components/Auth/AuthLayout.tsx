import React from 'react'
import { Link, useLocation } from 'react-router-dom'

interface AuthLayoutProps {
    children: React.ReactNode
    title: string
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
    const location = useLocation()
    const isLogin = location.pathname === '/login'

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {title}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {isLogin ? (
                            <>
                                Don't have an account?{' '}
                                <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                                    Sign up
                                </Link>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                                    Sign in
                                </Link>
                            </>
                        )}
                    </p>
                </div>
                <div className="bg-white shadow rounded-lg p-6">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default AuthLayout 