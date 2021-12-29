import Router, { useRouter } from "next/router";
import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/apiClient";
import { destroyCookie, parseCookies, setCookie } from "nookies";
import { GetServerSidePropsContext } from "next";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SingInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn(credentials: SingInCredentials): Promise<void>;
  user: User;
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

type Context = undefined | GetServerSidePropsContext;

export const AuthContext = createContext({} as AuthContextData);

export function signOut(ctx: Context = undefined) {
  destroyCookie(ctx, "nextauth.token");
  destroyCookie(ctx, "nextauth.refreshToken");
  if (process.browser) {
    Router.push("/");
  }
}

export async function setCookies(
  ctx = undefined,
  token: string,
  refreshToken: string
) {
  setCookie(ctx, "nextauth.token", token, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
  setCookie(ctx, "nextauth.refreshToken", refreshToken, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User>({} as User);
  const isAuthenticated = !!user;

  useEffect(() => {
    const { "nextauth.token": token } = parseCookies();

    if (token) {
      api
        .get("/me")
        .then((response) => {
          const { email, permissions, roles } = response.data;
          setUser({
            email,
            permissions,
            roles,
          });
        })
        .catch((error) => {
          signOut();
        });
    }
  }, []);

  async function signIn({ email, password }: SingInCredentials) {
    try {
      const response = await api.post("sessions", {
        email,
        password,
      });

      const { token, refreshToken, permissions, roles } = response.data;

      await setCookies(undefined, token, refreshToken);

      setUser({
        email,
        permissions,
        roles,
      });

      api.defaults.headers["Authorization"] = `Bearer ${token}`;

      router.push("/dashboard");
    } catch (err) {
      console.log("services|api|SignIn => ", err);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}
