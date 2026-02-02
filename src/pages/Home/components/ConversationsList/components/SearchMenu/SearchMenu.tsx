import { connectToConversation } from "@utils/socket";
import { useAppDispatch, useAppSelector } from "@hooks/hooks";
import { setConversation, setRecipient } from "@redux/global";
import PreviewItem from "../PreviewItem/PreviewItem";
import type { SearchResponse } from "@utils/types";
import styles from "./SearchMenu.module.css";

const SearchMenu = ({ searchResults }: { searchResults?: SearchResponse }) => {
  const dispatch = useAppDispatch();
  const { conversationId } = useAppSelector((state) => state.global);
  if (!searchResults) {
    return <div>There is no search results</div>;
  }

  return (
    <>
      {searchResults.conversations.map((item) => {
        return (
          <PreviewItem
            key={item.id}
            avatarUrl={item.avatarUrl}
            tile={item.title}
            description={item.lastMessage?.text ?? ""}
            meta={{
              lastMessageTime: item.lastMessage?.createdAt.toString() || "",
              unreadMessages: item.unreadMessages,
            }}
            onMouseDown={() => {
              connectToConversation([item.id], conversationId);
              dispatch(setConversation({ conversationId: item.id }));
            }}
          />
        );
      })}

      {searchResults.global.length > 0 && (
        <>
          <div className={styles.globalResults}>Global</div>
          {searchResults.global.map((global) => {
            if (global.type === "user") {
              return (
                <PreviewItem
                  key={global.id}
                  avatarUrl={global.avatarUrl}
                  tile={global.nickname}
                  description={"@" + global.nickname}
                  onMouseDown={() => {
                    dispatch(setRecipient({ recipientId: global.id }));
                  }}
                />
              );
            }
            return;
          })}
        </>
      )}
    </>
  );
};

export default SearchMenu;
