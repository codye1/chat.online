import styles from "./ParticipantsPicker.module.css";
import { useState } from "react";
import useDebounce from "@hooks/useDebounce";
import { useSearchQuery } from "@api/slices/Chat/chatSlice";
import type { UserSearchPreview } from "@utils/types";
import Avatar from "@components/Avatar/Avatar";
import InputWithLabel from "@components/InputWithLabel/InputWithLabel";
import ListItem from "@components/ListItem/ListItem";
import removeFromSelectedIcon from "@assets/close.svg";

interface IParticipantsPicker {
  selectedUsers: UserSearchPreview[];
  usersInConversation?: UserSearchPreview[];
  onSelectedUsersChange: (users: UserSearchPreview[]) => void;
}

const ParticipantsPicker = ({
  selectedUsers,
  usersInConversation,
  onSelectedUsersChange,
}: IParticipantsPicker) => {
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 500);
  const { data: searchResults } = useSearchQuery(
    { query: debouncedSearchValue, type: "users" },
    {
      skip: debouncedSearchValue.trim().length === 0,
      refetchOnMountOrArgChange: true,
    },
  );

  return (
    <div className={styles.participantsPicker}>
      <div className={styles.selectedUsers}>
        {selectedUsers.map((user) => (
          <div key={user.id} className={styles.selectedUser}>
            <Avatar avatarUrl={user.avatarUrl} width={30} height={30} />
            <span>{user.nickname}</span>
            <img
              src={removeFromSelectedIcon}
              className={styles.removeIcon}
              alt="Remove"
              onClick={() =>
                onSelectedUsersChange(
                  selectedUsers.filter((u) => u.id !== user.id),
                )
              }
            />
          </div>
        ))}
      </div>
      <InputWithLabel
        label="Add participants"
        name="participants"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <ul className={styles.searchResults}>
        {searchResults?.global.length ? (
          searchResults.global.map(
            (user) =>
              user.type === "user" && (
                <ListItem
                  key={user.id}
                  className={styles.searchResult}
                  onClick={() => {
                    if (!selectedUsers.find((u) => u.id === user.id)) {
                      onSelectedUsersChange([...selectedUsers, user]);
                    }
                  }}
                >
                  <Avatar
                    avatarUrl={user.avatarUrl}
                    selected={
                      !!selectedUsers.find((u) => u.id === user.id) ||
                      !!usersInConversation?.find((u) => u.id === user.id)
                    }
                    selectedColor={
                      usersInConversation?.find((u) => u.id === user.id)
                        ? "var(--c-muted)"
                        : undefined
                    }
                  />
                  <span>{user.nickname}</span>
                </ListItem>
              ),
          )
        ) : (
          <p>No results</p>
        )}
      </ul>
    </div>
  );
};

export default ParticipantsPicker;
