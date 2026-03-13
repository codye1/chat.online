import {
  useConversationsQuery,
  useLazyGetConversationsQuery,
} from "@api/slices/chatSlice";
import getConversationsSlice from "@utils/getConversationsSlice";
import { useEffect, useMemo, useRef, useState } from "react";

const useFolderConversations = (activeFolderId: string) => {
  const {
    data: conversationsState,
    isLoading: conversationsLoading,
    isFetching: conversationsFetching,
    error: conversationsError,
  } = useConversationsQuery(undefined, { refetchOnMountOrArgChange: true });

  const [fetchConversations] = useLazyGetConversationsQuery();
  const [slices, setSlices] = useState<Record<string, number>>({});

  const { pinnedConversations, unpinnedConversations, missing, hasMore } =
    useMemo(
      () =>
        getConversationsSlice({
          activeFolderId,
          conversationsState: conversationsState!,
          take: slices[activeFolderId] || 20,
        }),
      [conversationsState, slices, activeFolderId],
    );

  const canChangeSliceRef = useRef(true);

  useEffect(() => {
    fetchConversations({ ids: missing })
      .unwrap()
      .then(() => {
        canChangeSliceRef.current = true;
      });
  }, [missing, fetchConversations]);

  const loadMore = () => {
    if (!canChangeSliceRef.current) return;
    canChangeSliceRef.current = false;
    setSlices((prev) => ({
      ...prev,
      [activeFolderId]: (prev[activeFolderId] || 20) + 20,
    }));
  };

  return {
    pinnedConversations,
    unpinnedConversations,
    conversationsState: {
      ...conversationsState,
      loading: conversationsLoading,
      error: conversationsError,
      fetching: conversationsFetching,
      loadMore,
      hasMore,
    },
  };
};

export default useFolderConversations;
