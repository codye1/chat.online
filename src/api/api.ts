import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import authSlice from "./slices/authSlice";
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
  credentials: "include",
});

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getErrorCode = (
  error: FetchBaseQueryError | undefined,
): string | undefined => {
  if (!error || !isRecord(error)) return undefined;

  const data = (error as FetchBaseQueryError).data;
  if (!isRecord(data)) return undefined;

  const nestedError = data.error;
  if (!isRecord(nestedError)) return undefined;

  const code = nestedError.code;
  return typeof code === "string" ? code : undefined;
};

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  const code = getErrorCode(result.error);
  const isUnauthorized =
    code === "UNAUTHORIZED" && result.error?.status === 401;

  if (isUnauthorized) {
    await api.dispatch(authSlice.endpoints.refresh.initiate());
    result = await baseQuery(args, api, extraOptions);
  }
  return result;
};

const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  endpoints: (build) => ({
    getUsers: build.query<{ message: string }, void>({
      query: () => `health`,
    }),

    getProtected: build.query<{ message: string }, void>({
      query: () => `protected`,
    }),
  }),
});

export const { useGetUsersQuery, useGetProtectedQuery } = api;

export default api;
