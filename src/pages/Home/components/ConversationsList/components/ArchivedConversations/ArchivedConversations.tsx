import InfiniteScrolling from "@components/InfiniteScrolling/InfiniteScrolling";
import useFolderConversations from "@hooks/useFolderConversations";
import sortConversations from "../AllConversations/utils/sortConversations";
import { setConversation } from "@redux/global";
import { useAppDispatch, useAppSelector } from "@hooks/hooks";
import PreviewItem from "../PreviewItem/PreviewItem";
import ConversationContextMenu from "../ConversationContextMenu/ConversationContextMenu";
import ContextMenu from "@components/ContextMenu/ContextMenu";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { isSortableOperation } from "@dnd-kit/react/sortable";
import { updatePinnedPositions } from "@api/slices/helpers/ConversationsManage";

const ArchivedConversations = () => {
  const { unpinnedConversations, pinnedConversations, conversationsState } =
    useFolderConversations("ARCHIVED");
  const dispatch = useAppDispatch();
  const { conversationId } = useAppSelector((state) => state.global);

  const handleDragEnd = ({ operation }: DragEndEvent) => {
    if (!isSortableOperation(operation)) return;

    const source = operation.source;
    const target = operation.target;

    if (!source) return;

    const pinnedIds = Object.keys(pinnedConversations);
    const sourceId = String(source.id);
    const sourceIndex = pinnedIds.indexOf(sourceId);
    const sortableIndex = source.sortable.index;
    const initialIndex = source.sortable.initialIndex;

    if (
      Number.isInteger(sortableIndex) &&
      sortableIndex !== initialIndex &&
      sortableIndex >= 0 &&
      sortableIndex < pinnedIds.length
    ) {
      updatePinnedPositions("ARCHIVED", [
        { conversationId: sourceId, newPinnedPosition: sortableIndex },
      ]);
      return;
    }

    if (!target || source.id === target.id) return;

    const targetId = String(target.id);
    const targetIndex = pinnedIds.indexOf(targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    updatePinnedPositions("ARCHIVED", [
      { conversationId: sourceId, newPinnedPosition: targetIndex },
    ]);
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <InfiniteScrolling
        items={[
          ...Object.values(pinnedConversations),
          ...sortConversations(unpinnedConversations),
        ]}
        renderItem={(conversation, index) => {
          const pinPosition = Object.values(pinnedConversations).findIndex(
            (c) => c.id === conversation.id,
          );
          const isPinned = Number(pinPosition) >= 0;
          const nextPinPosition = Object.keys(pinnedConversations).length;
          const description = conversation.lastMessage?.text ?? "";
          const lastMessageTime =
            conversation.lastMessage?.createdAt.toString() ||
            conversation.createdAt.toString();
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
          const props = {
            id: conversation.id,
            avatarUrl: conversation.avatarUrl,
            title: conversation.title,
            description,
            meta: {
              lastMessageTime,
              unreadMessagesCount: conversation.unreadMessages,
            },
            isArchived: conversation.isArchived,
            isActive: conversationId === conversation.id,
            onClick: () => {
              dispatch(setConversation({ conversationId: conversation.id }));
            },
            isPinned,
            isMuted: conversation.isMuted,
          };

          if (isPinned) {
            return (
              <PreviewItem.Sortable
                key={conversation.id}
                group={"ARCHIVED"}
                index={index}
                {...props}
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
              </PreviewItem.Sortable>
            );
          }

          return (
            <PreviewItem key={conversation.id} {...props}>
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
    </DragDropProvider>
  );
};

export default ArchivedConversations;
