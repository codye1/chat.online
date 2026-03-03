import Modal from "@components/Modal/Modal";
import { useAppDispatch } from "@hooks/hooks";
import { closeModal } from "@redux/global";
import type { GroupedReactions } from "@utils/types";
import styles from "./ReactorsList.module.css";
import heart from "@assets/heart.svg";
import { useState } from "react";
import getDisplayName from "@utils/getDisplayName";
import Avatar from "@components/Avatar/Avatar";
import formatDate from "@utils/formatDate";
import clsx from "clsx";

interface IReactorsList {
  messageId: string;
  conversationId: string;
  groupedReactions: GroupedReactions;
}

const ReactorsList = ({
  messageId,
  conversationId,
  groupedReactions,
}: IReactorsList) => {
  const dispatch = useAppDispatch();
  // TODO make pagination work for reactors list
  //const { data: reactors } = useGetReactorsQuery({ messageId, conversationId });

  const allReactors = Object.values(groupedReactions).flatMap(
    (group) => group.users,
  );

  const [selectedTab, setSelectedTab] = useState<string>("All");

  const displayedReactors =
    selectedTab === "All"
      ? allReactors
      : groupedReactions[selectedTab]?.users || [];

  return (
    <Modal
      onClickOutside={() => {
        dispatch(closeModal());
      }}
    >
      <menu className={styles.content}>
        <ul className={styles.reactionsList}>
          <li
            className={clsx(styles.reaction, {
              [styles.selected]: selectedTab === "All",
            })}
            onClick={() => setSelectedTab("All")}
          >
            <img
              className={styles.reactionIcon}
              src={heart}
              alt="Reaction icon"
            />
            <div className={styles.count}>{allReactors.length}</div>
          </li>
          {Object.entries(groupedReactions).map(([key, group]) => (
            <li
              className={clsx(styles.reaction, {
                [styles.selected]: selectedTab === key,
              })}
              key={key}
              onClick={() => setSelectedTab(key)}
            >
              <div>{key}</div>
              <div className={styles.count}>{group.count}</div>
            </li>
          ))}
        </ul>
        <ul className={styles.reactorsList}>
          {displayedReactors.map((reactor) => (
            <li className={styles.reactor} key={reactor.id}>
              <Avatar
                avatarUrl={reactor.avatarUrl}
                width={"50px"}
                height={"50px"}
              />
              <div className={styles.info}>
                <h3 className={styles.displayName}>
                  {getDisplayName(reactor)}
                </h3>
                <h4>{formatDate(reactor.reactedAt)}</h4>
              </div>
            </li>
          ))}
        </ul>
      </menu>
    </Modal>
  );
};

export default ReactorsList;
export type { IReactorsList };
