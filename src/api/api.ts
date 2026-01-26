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

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  const error = result.error;
  const isUnauthorized =
    !!error &&
    ((typeof error.status === "number" &&
      (error.status === 401 || error.status === 403)) ||
      (error.status === "PARSING_ERROR" &&
        (error as unknown as { originalStatus?: number }).originalStatus ===
          401));

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
