import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";

export function withSSRGuest<T>(fn: GetServerSideProps<T>) {
    return async (ctx: GetServerSidePropsContext) :  Promise<GetServerSidePropsResult<T>> => {
        var cookies = parseCookies(ctx);

        if (cookies['dashgo.token']) {
            return {
                redirect: {
                    destination: '/dashboard',
                    permanent: false,
                }
            }
        }

        return await fn(ctx);
    }
}