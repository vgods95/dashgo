import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenError";

export function withSSRAuth<T>(fn: GetServerSideProps<T>) {
    return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<T>> => {
        var cookies = parseCookies(ctx);

        if (!cookies['dashgo.token']) {
            return {
                redirect: {
                    destination: '/',
                    permanent: false,
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