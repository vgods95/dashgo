import { createContext, ReactNode, useEffect, useState } from 'react';
import { apiAuth, signOut } from '../../services/apiAuth';
import Router from 'next/router';
import { setCookie, parseCookies, destroyCookie } from 'nookies';



type SignInCredentials = {
    email: string;
    password: string;
}

type AuthContextData = {
    signIn(credentials: SignInCredentials): Promise<void>;
    isAuthenticated: boolean;
    user: User;
}

type AuthProviderProps = {
    children: ReactNode;
}

type User = {
    email: string;
    permissions: string[];
    roles: string[];
}

export const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User>(null);
    const isAuthenticated = !!user;

    useEffect(() => {
        const { 'dashgo.token': token } = parseCookies();

        if (token) {
            apiAuth.get('/me').then(response => {
                const { email, permissions, roles } = response.data;
                setUser({ email, permissions, roles });
            }).catch(() => {
                signOut();
            })
        }
    }, [])

    async function signIn({ email, password }: SignInCredentials) {
        try {
            const response = await apiAuth.post('sessions', { email, password })
            const { permissions, roles, token, refreshToken } = response.data;

            //sessionStorage - não fica disponível em outras sessões (se fechar o navegador e abrir de novo, já era rs)
            //localStorage - dura. Mesmo após sair da sessão. Porém o next ele não é apenas browser, tem o server side rendering
            //cookies - Armazena informações do browser que podem ou não ser enviadas nas requests e também ser acessados do lado do browser e do servidor.

            setCookie(undefined, 'dashgo.token', token, {
                maxAge: 60 * 60 * 24 * 30, //30 dias
                path: '/'
            });

            setCookie(undefined, 'dashgo.refreshToken', refreshToken, {
                maxAge: 60 * 60 * 24 * 30, //30 dias
                path: '/'
            });

            setUser({
                email,
                permissions,
                roles,
            })

            apiAuth.defaults.headers['Authorization'] = `Bearer ${token}`;

            Router.push('/dashboard');
        }
        catch (err) {
            console.log(err);
        }
    }

    return (
        <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
            {children}
        </AuthContext.Provider>
    )
}