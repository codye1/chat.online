import api from "@api/api";
import type { User } from "@utils/types";

const userSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    updateUser: builder.mutation<User, Partial<User>>({
      query: (body) => ({
        url: "user",
        method: "PATCH",
        body,
      }),
    }),
    getUser: builder.query<User, string>({
      query: (id) => `user/${id}`,
    }),
  }),
});

export const { useUpdateUserMutation, useGetUserQuery } = userSlice;

export default userSlice;
