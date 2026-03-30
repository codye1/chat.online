import api from "@api/api";
import type { User } from "@utils/types";

interface GetUserResponse {
  user: User;
  directConversationId: string | null;
}

const userSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    updateUser: builder.mutation<User, Partial<User>>({
      query: (body) => ({
        url: "user",
        method: "PATCH",
        body,
      }),
    }),
    getUser: builder.query<GetUserResponse, string>({
      query: (id) => `user/${id}`,
    }),
  }),
});

export type { GetUserResponse };
export const { useUpdateUserMutation, useGetUserQuery } = userSlice;
export default userSlice;
