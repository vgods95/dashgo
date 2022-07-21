import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenError";
import decode from 'jwt-decode';
import { validateUserPermissions } from "./validateUserPermissions";

type WithSSRAuthOptions = {
    permissions?: string[];
    roles?: string[];
}

export function withSSRAuth<T>(fn: GetServerSideProps<T>, options?: WithSSRAuthOptions) {
    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<T>> => {
        var cookies = parseCookies(ctx);
        const token = cookies['dashgo.token'];

        if (!token) {
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
                }
            }
        }

        if (options) {
            const user = decode<{ permissions: string[], roles: string[] }>(token);
            const { permissions, roles } = options;
            const userHasValidPermissions = validateUserPermissions({ user, permissions, roles });

            if (!userHasValidPermissions) {
                return {
                    notFound: true,
                    //redirect: {destination: '/Menu' permanent: false}
                }
            }
        }


        try {
            return await fn(ctx);
        }
        catch (err) {
            if (err instanceof AuthTokenError) {
                destroyCookie(ctx, 'dashgo.token');
                destroyCookie(ctx, 'dashgo.refreshToken');

                return {
                    redirect: {
                        destination: '/',
                        permanent: false,
                    }
                }
            }
        }

    }
}