import api from "@api/api";
import type { ConversationsState } from "@utils/types";
import buildConversationEndpoints from "./endpoints/conversationEndpoints";
import type {
  BaseQueryFn,
  EndpointBuilder,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import buildMessageEndpoints from "./endpoints/messageEndpoints";
import buildReactionsEndpoints from "./endpoints/reactionsEndpoints";
import buildFolderEndpoints from "./endpoints/folderEndpoints";

export type Builder = EndpointBuilder<
  BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>,
  never,
  "api"
>;

const chatSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    ...buildConversationEndpoints(builder),
    ...buildMessageEndpoints(builder),
    ...buildReactionsEndpoints(builder),
    ...buildFolderEndpoints(builder),
  }),
});

export const {
  useSearchQuery,
  useGetConversationQuery,
  useGetConversationsQuery,
  useLazyGetConversationsQuery,
  useGetMessagesQuery,
  useGetReactorsQuery,
  useCreateFolderMutation,
  useUpdatePinnedPositionMutation,
  useUpdateConversationSettingsMutation,
} = chatSlice;

const DEFAULT_CONVERSATIONS_STATE: ConversationsState = {
  byId: {},
  activeIds: { pinned: [], unpinned: [] },
  archivedIds: { pinned: [], unpinned: [] },
  folders: [],
};

export const useConversationsQuery = (
  args?: { ids?: string[] },
  options?: { refetchOnMountOrArgChange?: boolean },
) =>
  useGetConversationsQuery(args ?? undefined, {
    ...options,
    selectFromResult: ({ data, ...rest }) => ({
      data: data ?? DEFAULT_CONVERSATIONS_STATE,
      ...rest,
    }),
  });

export default chatSlice;
