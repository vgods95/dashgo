import axios, { AxiosError } from 'axios';
import Router from 'next/router';
import { destroyCookie, parseCookies, setCookie } from 'nookies';

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestsQueue = [];

export const apiAuth = axios.create({
    baseURL: 'http://localhost:3333',
    headers: {
        Authorization: `Bearer ${cookies['dashgo.token']}`
    }
});

export function signOut() {
    destroyCookie(undefined, 'dashgo.token')
    destroyCookie(undefined, 'dashgo.refreshToken')

    Router.push('/');
}

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

                    setCookie(undefined, 'dashgo.token', token, {
                        maxAge: 60 * 60 * 24 * 30, //30 dias
                        path: '/'
                    });

                    setCookie(undefined, 'dashgo.refreshToken', response.data.refreshToken, {
                        maxAge: 60 * 60 * 24 * 30, //30 dias
                        path: '/'
                    });

                    apiAuth.defaults.headers['Authorization'] = `Bearer ${token}`;
                    failedRequestsQueue.forEach(request => request.onSuccess(token));
                    failedRequestsQueue = [];
                }).catch(err => {
                    failedRequestsQueue.forEach(request => request.onFailure(err));
                    failedRequestsQueue = [];
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
            signOut();
        }
    }

    return Promise.reject(error);
})