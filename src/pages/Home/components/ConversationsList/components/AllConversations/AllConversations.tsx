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
import getArchiveDescription from "@utils/getArchiveDescription";
import type { views } from "../../ConversationsList";
import ContextMenu from "@components/ContextMenu/ContextMenu";

interface IAllConversations {
  setView: (view: views) => void;
}

const AllConversations = ({ setView }: IAllConversations) => {
  const [activeFolderId, setActiveFolderId] = useState("ACTIVE");
  const { pinnedConversations, unpinnedConversations, conversationsState } =
    useFolderConversations(activeFolderId);

  const dispatch = useAppDispatch();
  const { conversationId } = useAppSelector((state) => state.global);

  const showArchive = useMemo(() => {
    return (
      activeFolderId === "ACTIVE" &&
      (conversationsState.archivedIds.pinned.length > 0 ||
        conversationsState.archivedIds.unpinned.length > 0)
    );
  }, [activeFolderId, conversationsState.archivedIds]);

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
    </>
  );
};

export default AllConversations;
