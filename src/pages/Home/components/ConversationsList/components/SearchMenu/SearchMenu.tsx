import { connectToConversation } from "@utils/socket";
import { useAppDispatch, useAppSelector } from "@hooks/hooks";
import { setConversation, setRecipient } from "@redux/global";
import PreviewItem from "../PreviewItem/PreviewItem";
import type { SearchResponse } from "@utils/types";
import styles from "./SearchMenu.module.css";
import noSearchResults from "@assets/noSearchResult.svg";

const SearchMenu = ({ searchResults }: { searchResults?: SearchResponse }) => {
  const dispatch = useAppDispatch();
  const { conversationId } = useAppSelector((state) => state.global);
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
    connectToConversation([newConversationId], conversationId);
    dispatch(setConversation({ conversationId: newConversationId }));
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
            unreadMessages: item.unreadMessages,
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
                  onMouseDown={() => {
                    dispatch(setRecipient({ recipientId: global.id }));
                  }}
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
