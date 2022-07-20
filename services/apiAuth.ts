import axios, { AxiosError } from 'axios';
import Router from 'next/router';
import { destroyCookie, parseCookies, setCookie } from 'nookies';
import { signOut } from '../src/contexts/AuthContext';
import { AuthTokenError } from './errors/AuthTokenError';

let isRefreshing = false;
let failedRequestsQueue = [];

export function setupAPIClient(ctx = undefined) {
    let cookies = parseCookies(ctx);

    const apiAuth = axios.create({
        baseURL: 'http://localhost:3333',
        headers: {
            Authorization: `Bearer ${cookies['dashgo.token']}`
        }
    });

    apiAuth.interceptors.response.use(response => {
        return response; //se der certo a request.
    }, (error: AxiosError) => {
        //se der erro a request
        if (error.response.status === 401) {
            if (error.code === 'token.expired') {
                //Renovar o token
                cookies = parseCookies();

                const { 'dashgo.refreshToken': refreshToken } = cookies;
                const originalConfig = error.config;

                if (!isRefreshing) {
                    isRefreshing = true;
                    apiAuth.post('/refresh', { refreshToken }).then(response => {
                        const { token } = response.data;

                        setCookie(ctx, 'dashgo.token', token, {
                            maxAge: 60 * 60 * 24 * 30, //30 dias
                            path: '/'
                        });

                        setCookie(ctx, 'dashgo.refreshToken', response.data.refreshToken, {
                            maxAge: 60 * 60 * 24 * 30, //30 dias
                            path: '/'
                        });

                        apiAuth.defaults.headers['Authorization'] = `Bearer ${token}`;
                        failedRequestsQueue.forEach(request => request.onSuccess(token));
                        failedRequestsQueue = [];
                    }).catch(err => {
                        failedRequestsQueue.forEach(request => request.onFailure(err));
                        failedRequestsQueue = [];

                        if (process.browser) {
                            signOut();
                        }
                        else {
                            return Promise.reject(new AuthTokenError())
                        }
                    }).finally(() => {
                        isRefreshing = false;
                    });
                }

                return new Promise((resolve, reject) => {
                    failedRequestsQueue.push({
                        onSuccess: (token: string) => {
                            originalConfig.headers['Authorization'] = `Bearer ${token}`;
                            resolve(apiAuth(originalConfig));
                        },
                        onFailure: (err: AxiosError) => {
                            reject(err);
                        },
                    })
                })
            }
            else {
                //deslogar o usuário
                if (process.browser) {
                    signOut();
                }
            }
        }

        return Promise.reject(error);
    })

    return apiAuth;
}