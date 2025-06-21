export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    username: string;
}

export interface ForgotPasswordCredentials {
    email: string;
}

export interface ResetPasswordCredentials {
    token: string;
    new_password: string;
}

export interface User {
    id: string;
    email: string;
    username?: string;
    first_name?: string;
    last_name?: string;
    [key: string]: any;
} 