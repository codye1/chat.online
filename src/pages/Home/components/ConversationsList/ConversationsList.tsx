import vwToPx from "@utils/helpers/vwToPx";
import styles from "./ConversationsList.module.css";
import Input from "@components/Input/Input";
import { useState } from "react";
import AllConversations from "./components/AllConversations/AllConversations";
import { useSearchQuery } from "@api/slices/Chat/chatSlice";
import closeIcon from "@assets/close.svg";
import SearchMenu from "./components/SearchMenu/SearchMenu";
import ResizableSection from "@components/ResizableSection/ResizableSection";
import burgerIcon from "@assets/burger.svg";
import NavigationDrawer from "../Sidebar/components/NavigationDrawer/NavigationDrawer";
import back from "@assets/back.svg";
import ArchivedConversations from "./components/ArchivedConversations/ArchivedConversations";
import useDebounce from "@hooks/useDebounce";
export type views = "CONVERSATIONS" | "SEARCH" | "ARCHIVED";

const ConversationsList = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [showDrawer, setShowDrawer] = useState(false);
  const { data: searchResults } = useSearchQuery(
    { query: debouncedSearch },
    {
      skip: debouncedSearch.trim().length === 0,
      refetchOnMountOrArgChange: true,
    },
  );
  const [view, setView] = useState<views>("CONVERSATIONS");

  const onCloseClick = () => {
    setView("CONVERSATIONS");
    setSearch("");
  };

  const onBurgerClick = () => {
    setShowDrawer(true);
  };

  return (
    <ResizableSection
      maxWidth={vwToPx(65)}
      className={styles.conversationsList}
    >
      {view === "ARCHIVED" ? (
        <div
          className={styles.archivedHeader}
          onClick={() => setView("CONVERSATIONS")}
        >
          <img className={styles.icon} src={back} alt="" />
          <h2>Archived chats</h2>
        </div>
      ) : (
        <span className={styles.searchWrapper}>
          {view === "SEARCH" ? (
            <button className={styles.icon} onClick={onCloseClick}>
              <img src={closeIcon} alt="Close" />
            </button>
          ) : (
            <button className={styles.icon} onClick={onBurgerClick}>
              <img src={burgerIcon} alt="Close" />
            </button>
          )}
          <Input
            className={styles.searchInput}
            placeholder="Search"
            type="text"
            name="search"
            onFocusChange={(isFocused) => {
              if (isFocused) {
                setView("SEARCH");
              } else {
                setView("CONVERSATIONS");
              }
              setSearch("");
            }}
            trackValue={{
              value: search,
              onChange: (e) => setSearch(e.target.value),
            }}
          />
        </span>
      )}
      {(() => {
        switch (view) {
          case "SEARCH":
            return <SearchMenu searchResults={searchResults} />;
          case "CONVERSATIONS":
            return <AllConversations setView={setView} />;
          case "ARCHIVED":
            return <ArchivedConversations />;
          default:
            return null;
        }
      })()}
      {showDrawer && (
        <NavigationDrawer onClickOutside={() => setShowDrawer(false)} />
      )}
    </ResizableSection>
  );
};

export default ConversationsList;
