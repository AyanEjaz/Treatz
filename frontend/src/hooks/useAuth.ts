"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useApolloClient } from "@apollo/client";
import { ME_QUERY } from "@/graphql/queries/user.queries";
import { LOGIN_MUTATION, REGISTER_MUTATION, GOOGLE_AUTH_MUTATION } from "@/graphql/mutations/user.mutations";
import { AuthPayload } from "@/types/user.types";

export function useAuth() {
  const client = useApolloClient();
  const { data, loading } = useQuery(ME_QUERY, {
    skip: typeof window === "undefined" || !localStorage.getItem("treatz_token"),
  });

  const [loginMutation, { loading: loginLoading }] = useMutation(LOGIN_MUTATION);
  const [registerMutation, { loading: registerLoading }] = useMutation(REGISTER_MUTATION);
  const [googleAuthMutation, { loading: googleLoading }] = useMutation(GOOGLE_AUTH_MUTATION);

  const saveToken = useCallback((payload: AuthPayload) => {
    localStorage.setItem("treatz_token", payload.token);
  }, []);

  const login = useCallback(
    async (emailOrUsername: string, password: string) => {
      const { data } = await loginMutation({ variables: { emailOrUsername, password } });
      saveToken(data.login);
      return data.login;
    },
    [loginMutation, saveToken]
  );

  const register = useCallback(
    async (password: string, name: string, username: string) => {
      const { data } = await registerMutation({ variables: { password, name, username } });
      saveToken(data.register);
      return data.register;
    },
    [registerMutation, saveToken]
  );

  const googleAuth = useCallback(
    async (idToken: string) => {
      const { data } = await googleAuthMutation({ variables: { idToken } });
      saveToken(data.googleAuth);
      return data.googleAuth;
    },
    [googleAuthMutation, saveToken]
  );

  const logout = useCallback(() => {
    localStorage.removeItem("treatz_token");
    client.clearStore();
    window.location.href = "/login";
  }, [client]);

  return {
    currentUser: data?.me ?? null,
    loading,
    loginLoading,
    registerLoading,
    googleLoading,
    login,
    register,
    googleAuth,
    logout,
  };
}
