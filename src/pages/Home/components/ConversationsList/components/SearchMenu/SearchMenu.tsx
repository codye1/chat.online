import { useAppDispatch } from "@hooks/hooks";
import { setConversation, setRecipient } from "@redux/global";
import PreviewItem from "../PreviewItem/PreviewItem";
import type { SearchResponse } from "@utils/types";
import styles from "./SearchMenu.module.css";
import noSearchResults from "@assets/noSearchResult.svg";
import { useConversationsQuery } from "@api/slices/Chat/chatSlice";
import connectToConversation from "@utils/socket/actions/conversationActions/connectToConversation";

const SearchMenu = ({ searchResults }: { searchResults?: SearchResponse }) => {
  const dispatch = useAppDispatch();
  const { data: conversationsState } = useConversationsQuery();
  if (!searchResults) {
    return (
      <div className={styles.noResultsContainer}>
        <img
          src={noSearchResults}
          alt="No search results"
          className={styles.noResultsImage}
        />
      </div>
    );
  }

  const onMouseDown = (newConversationId: string) => {
    connectToConversation([newConversationId]);
    dispatch(setConversation({ conversationId: newConversationId }));
  };

  const onUserClick = (recipientId: string) => {
    const existingConversation = Object.values(
      conversationsState?.byId || {},
    ).find(
      (conv) =>
        conv.type === "DIRECT" && conv.otherParticipant.id === recipientId,
    );

    if (existingConversation) {
      connectToConversation([existingConversation.id]);
      dispatch(setConversation({ conversationId: existingConversation.id }));
    } else {
      dispatch(setRecipient({ recipientId }));
    }
  };

  return (
    <>
      {searchResults.conversations.map((item) => (
        <PreviewItem
          key={item.id}
          avatarUrl={item.avatarUrl}
          title={item.title}
          description={item.lastMessage?.text ?? ""}
          meta={{
            lastMessageTime: item.lastMessage?.createdAt.toString() || "",
            unreadMessagesCount: item.unreadMessages,
          }}
          onMouseDown={() => onMouseDown(item.id)}
        />
      ))}

      {searchResults.global.length > 0 && (
        <>
          <div className={styles.globalResults}>Global</div>
          {searchResults.global.map((global) => {
            if (global.type === "user") {
              return (
                <PreviewItem
                  key={global.id}
                  avatarUrl={global.avatarUrl}
                  title={global.nickname}
                  description={"@" + global.nickname}
                  onMouseDown={() => onUserClick(global.id)}
                />
              );
            }
          })}
        </>
      )}
    </>
  );
};

export default SearchMenu;
