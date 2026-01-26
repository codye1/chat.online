import api from "@api/api";
import type { User } from "@utils/definitions";

export interface AuthResponse {
  accessToken: string;
  user: User;
}

const authSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    googleLogin: builder.mutation<AuthResponse, { credential: string }>({
      query: (body) => ({
        url: "auth/google",
        method: "POST",
        body,
      }),
    }),

    login: builder.mutation<AuthResponse, { email: string; password: string }>({
      query: (user) => ({
        url: "auth/login",
        method: "POST",
        body: user,
      }),
    }),

    register: builder.mutation<
      AuthResponse,
      { email: string; password: string; nickname: string }
    >({
      query: (user) => ({
        url: "auth/register",
        method: "POST",
        body: user,
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: "auth/logout",
        method: "POST",
      }),
    }),

    refresh: builder.mutation<AuthResponse, void>({
      query: () => ({
        url: "auth/refresh",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGoogleLoginMutation,
  useRefreshMutation,
} = authSlice;

export default authSlice;
