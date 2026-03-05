import vwToPx from "@utils/vwToPx";
import styles from "./ConversationsList.module.css";
import Input from "@components/Input/Input";
import { useState } from "react";
import AllConversations from "./components/AllConversations/AllConversations";
import { useSearchQuery } from "@api/slices/chatSlice";
import Button from "@components/Button/Button";
import closeIcon from "@assets/close.svg";
import SearchMenu from "./components/SearchMenu/SearchMenu";
import ResizableSection from "@components/ResizableSection/ResizableSection";
import ConversationFoldersList from "./components/ConversationFoldersList/ConversationFoldersList";

const ConversationsList = () => {
  const [searchFocus, setSearchFocus] = useState(false);
  const [search, setSearch] = useState("");

  const { data: searchResults } = useSearchQuery(
    { query: search },
    { skip: search.trim().length === 0, refetchOnMountOrArgChange: true },
  );

  return (
    <ResizableSection
      maxWidth={vwToPx(65)}
      className={styles.conversationsList}
    >
      <span className={styles.searchWrapper}>
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
        {searchFocus && (
          <Button
            className={styles.closeButton}
            onClick={() => {
              setSearchFocus(false);
            }}
          >
            <img src={closeIcon} alt="Close" />
          </Button>
        )}
      </span>
      <ConversationFoldersList />
      {searchFocus && <SearchMenu searchResults={searchResults} />}
      {!searchFocus && <AllConversations />}
    </ResizableSection>
  );
};

export default ConversationsList;
