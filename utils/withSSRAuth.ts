import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from "next";
import { destroyCookie, parseCookies } from "nookies";
import { signOut } from "../context/AuthContext";
import { AuthTokenError } from "../services/errors/AuthTokenError";

export function withSSRAuth<P>(fn: GetServerSideProps<P>) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);

    if (!cookies["nextauth.token"]) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }

    try {
      return fn(ctx);
    } catch (err) {
      console.log("Catch withSSRAuth");
      if (err instanceof AuthTokenError) {
        console.log("instanceof2=>", err);
        signOut(ctx);
        /* destroyCookie(ctx, "nextauth.token");
        destroyCookie(ctx, "nextauth.refreshToken"); */

        return {
          redirect: {
            destination: "/",
            permanent: false,
          },
        };
      }
    }
  };
}
