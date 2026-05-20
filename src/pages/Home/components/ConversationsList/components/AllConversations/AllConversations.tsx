import PreviewItem from "../PreviewItem/PreviewItem";
import PreviewItemSkeleton from "../PreviewItem/PreviewItemSkeleton";
import { useAppDispatch, useAppSelector } from "@hooks/hooks";
import { setConversation } from "@redux/global";
import sortConversations from "./utils/sortConversations";
import ConversationFoldersList from "../ConversationFoldersList/ConversationFoldersList";
import useFolderConversations from "@hooks/useFolderConversations";
import { useMemo, useState } from "react";
import InfiniteScrolling from "@components/InfiniteScrolling/InfiniteScrolling";
import styles from "./AllConversationsList.module.css";
import ConversationContextMenu from "../ConversationContextMenu/ConversationContextMenu";
import archiveAvatar from "@assets/archiveAvatar.png";
import type { views } from "../../ConversationsList";
import ContextMenu from "@components/ContextMenu/ContextMenu";
import getArchiveDescription from "@utils/helpers/getArchiveDescription";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { isSortableOperation } from "@dnd-kit/react/sortable";
import { updatePinnedPositions } from "@api/slices/helpers/ConversationsManage";

interface IAllConversations {
  setView: (view: views) => void;
}

const AllConversations = ({ setView }: IAllConversations) => {
  const [activeFolderId, setActiveFolderId] = useState("ACTIVE");
  const { pinnedConversations, unpinnedConversations, conversationsState } =
    useFolderConversations(activeFolderId);

  const dispatch = useAppDispatch();
  const conversationId = useAppSelector((state) => state.global.conversationId);

  const showArchive = useMemo(() => {
    return (
      activeFolderId === "ACTIVE" &&
      (conversationsState.archivedIds.pinned.length > 0 ||
        conversationsState.archivedIds.unpinned.length > 0)
    );
  }, [activeFolderId, conversationsState.archivedIds]);

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
      updatePinnedPositions(activeFolderId, [
        { conversationId: sourceId, newPinnedPosition: sortableIndex },
      ]);
      return;
    }

    if (!target || source.id === target.id) return;

    const targetId = String(target.id);
    const targetIndex = pinnedIds.indexOf(targetId);

    if (sourceIndex === -1 || targetIndex === -1) return;

    updatePinnedPositions(activeFolderId, [
      { conversationId: sourceId, newPinnedPosition: targetIndex },
    ]);
  };

  return (
    <>
      <ConversationFoldersList
        onFolderClick={(id: string) => {
          setActiveFolderId(id);
        }}
        activeFolder={activeFolderId}
        folders={conversationsState.folders}
      />
      {conversationsState.loading &&
        Array.from({ length: 10 }).map((_, index) => (
          <PreviewItemSkeleton key={index} />
        ))}
      {conversationsState.error && <div>Error loading conversations.</div>}
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
            const foldersWhereConversationIs =
              conversationsState.folders.filter((folder) => {
                const pinnedInFolder = folder.pinnedConversationIds.find(
                  (id) => id === conversation.id,
                );
                const unpinnedInFolder = folder.unpinnedConversationIds.find(
                  (id) => id === conversation.id,
                );
                return Boolean(pinnedInFolder || unpinnedInFolder);
              });
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
                  group={activeFolderId}
                  index={index}
                  {...props}
                >
                  <ContextMenu.Slot>
                    <ConversationContextMenu
                      conversation={conversation}
                      isPinned={isPinned}
                      nextPinPosition={nextPinPosition}
                      activeFolderId={activeFolderId}
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
                    activeFolderId={activeFolderId}
                    conversationsState={conversationsState}
                    foldersWhereConversationIs={foldersWhereConversationIs}
                  />
                </ContextMenu.Slot>
              </PreviewItem>
            );
          }}
          hasMore={conversationsState.hasMore}
          dontShowSentinel={conversationsState.fetching}
          listId={activeFolderId}
          onBottomReached={() => {
            conversationsState.loadMore();
          }}
          className={styles.conversationsList}
        >
          {showArchive && (
            <PreviewItem
              title="Archived"
              description={getArchiveDescription(conversationsState)}
              avatarUrl={archiveAvatar}
              isArchived
              isActive={false}
              onClick={() => {
                setView("ARCHIVED");
              }}
            />
          )}
        </InfiniteScrolling>
      </DragDropProvider>
    </>
  );
};

export default AllConversations;
