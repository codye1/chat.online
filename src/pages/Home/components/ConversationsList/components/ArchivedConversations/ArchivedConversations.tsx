import InfiniteScrolling from "@components/InfiniteScrolling/InfiniteScrolling";
import useFolderConversations from "@hooks/useFolderConversations";
import sortConversations from "../AllConversations/utils/sortConversations";
import { setConversation } from "@redux/global";
import { useAppDispatch, useAppSelector } from "@hooks/hooks";
import PreviewItem from "../PreviewItem/PreviewItem";
import ConversationContextMenu from "../ConversationContextMenu/ConversationContextMenu";
import ContextMenu from "@components/ContextMenu/ContextMenu";

const ArchivedConversations = () => {
  const { unpinnedConversations, pinnedConversations, conversationsState } =
    useFolderConversations("ARCHIVED");
  const dispatch = useAppDispatch();
  const { conversationId } = useAppSelector((state) => state.global);

  return (
    <InfiniteScrolling
      items={[
        ...Object.values(pinnedConversations),
        ...sortConversations(unpinnedConversations),
      ]}
      renderItem={(conversation) => {
        const pinPosition = Object.values(pinnedConversations).findIndex(
          (c) => c.id === conversation.id,
        );
        const isPinned = Number(pinPosition) >= 0;
        const nextPinPosition = Object.keys(pinnedConversations).length;
        const description = conversation.lastMessage?.text ?? "";
        const lastMessageTime =
          conversation.lastMessage?.createdAt.toString() || "";
        const foldersWhereConversationIs = conversationsState.folders.filter(
          (folder) => {
            const pinnedInFolder = folder.pinnedConversationIds.find(
              (id) => id === conversation.id,
            );
            const unpinnedInFolder = folder.unpinnedConversationIds.find(
              (id) => id === conversation.id,
            );
            return Boolean(pinnedInFolder || unpinnedInFolder);
          },
        );
        return (
          <PreviewItem
            key={conversation.id}
            avatarUrl={conversation.avatarUrl}
            title={conversation.title}
            description={description}
            meta={{
              lastMessageTime,
              unreadMessagesCount: conversation.unreadMessages,
            }}
            isArchived={conversation.isArchived}
            isActive={conversationId === conversation.id}
            onClick={() => {
              dispatch(setConversation({ conversationId: conversation.id }));
            }}
            isPinned={isPinned}
          >
            <ContextMenu.Slot>
              <ConversationContextMenu
                conversation={conversation}
                isPinned={isPinned}
                nextPinPosition={nextPinPosition}
                activeFolderId={"ARCHIVED"}
                conversationsState={conversationsState}
                foldersWhereConversationIs={foldersWhereConversationIs}
              />
            </ContextMenu.Slot>
          </PreviewItem>
        );
      }}
      hasMore={conversationsState.hasMore}
      dontShowSentinel={conversationsState.fetching}
      listId={"ARCHIVED"}
      onBottomReached={() => {
        conversationsState.loadMore();
      }}
    />
  );
};

export default ArchivedConversations;
