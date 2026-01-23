import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000" }),
  endpoints: (build) => ({
    getUsers: build.query<{ message: string }, void>({
      query: () => `health`,
    }),
  }),
});

export const { useGetUsersQuery } = api;

export default api;
