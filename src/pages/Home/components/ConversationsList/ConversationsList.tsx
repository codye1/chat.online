import ResizebleSection from "@components/ResizebleSection/ResizebleSection";
import vwToPx from "@utils/vwToPx";
import styles from "./ConversationsList.module.css";
import Input from "@components/Input/Input";
import { useEffect, useState } from "react";
import AllConversations from "./components/AllConversations/AllConversations";
import PreviewItem from "./components/PreviewItem/PreviewItem";
import { connectToConversation } from "@utils/socket";
import { useAppDispatch, useAppSelector } from "@hooks/hooks";
import { setConversation, setRecipient } from "@redux/global";
import { useSearchQuery } from "@api/slices/chatSclice";

const ConversationsList = () => {
  const [searchFocus, setSearchFocus] = useState(false);
  const [search, setSearch] = useState("");
  const dispatch = useAppDispatch();
  const { conversationId } = useAppSelector((state) => state.global);
  const { data: searchResults, refetch } = useSearchQuery(
    { query: search },
    { skip: search.trim().length === 0, refetchOnMountOrArgChange: true },
  );
  useEffect(() => {
    if (search.trim().length > 0) {
      refetch();
    }
  }, [search, refetch]);

  return (
    <ResizebleSection
      maxWidth={vwToPx(65)}
      className={styles.conversationsList}
    >
      <Input
        className={styles.searchInput}
        placeholder="Search conversations..."
        type="text"
        name="search"
        onFocusChange={(isFocused) => {
          setSearchFocus(isFocused);
          setSearch("");
        }}
        trackValue={{
          value: search,
          onChange: (e) => setSearch(e.target.value),
        }}
      />
      {searchFocus && searchResults && (
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
                  connectToConversation(item.id, conversationId);
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
      )}
      {!searchFocus && <AllConversations />}
    </ResizebleSection>
  );
};

export default ConversationsList;
