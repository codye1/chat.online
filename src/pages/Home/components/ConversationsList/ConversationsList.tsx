import ResizebleSection from "@components/ResizebleSection/ResizebleSection";
import vwToPx from "@utils/vwToPx";
import styles from "./ConversationsList.module.css";
import Input from "@components/Input/Input";
import { useEffect, useState } from "react";
import AllConversations from "./components/AllConversations/AllConversations";
import { useSearchQuery } from "@api/slices/chatSlice";
import Button from "@components/Button/Button";
import closeIcon from "@assets/close.svg";
import SearchMenu from "./components/SearchMenu/SearchMenu";

const ConversationsList = () => {
  const [searchFocus, setSearchFocus] = useState(false);
  const [search, setSearch] = useState("");

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

      {searchFocus && <SearchMenu searchResults={searchResults} />}
      {!searchFocus && <AllConversations />}
    </ResizebleSection>
  );
};

export default ConversationsList;
