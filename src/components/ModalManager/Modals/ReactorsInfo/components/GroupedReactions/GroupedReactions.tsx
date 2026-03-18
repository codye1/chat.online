import clsx from "clsx";
import styles from "./GroupedReactions.module.css";
import heart from "@assets/heart.svg";
import type { GroupedReactions as GroupedReactionsType } from "@utils/types";
import { useRef } from "react";
import type { WheelEvent } from "react";

interface IGroupedReactions {
  groupedReactions: GroupedReactionsType;
  selectedTab: string;
  onTabClick: (tab: string) => void;
  allReactionsCount: number;
}

const GroupedReactions = ({
  groupedReactions,
  onTabClick,
  selectedTab,
  allReactionsCount,
}: IGroupedReactions) => {
  const listRef = useRef<HTMLUListElement>(null);

  const handleWheel = (e: WheelEvent<HTMLUListElement>) => {
    if (listRef.current) {
      listRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <ul ref={listRef} className={styles.reactionsList} onWheel={handleWheel}>
      <li
        className={clsx(styles.reaction, {
          [styles.selected]: selectedTab === "all",
        })}
        onClick={() => onTabClick("all")}
      >
        <img className={styles.reactionIcon} src={heart} alt="Reaction icon" />
        <div className={styles.count}>{allReactionsCount}</div>
      </li>

      {Object.entries(groupedReactions).map(([key, group]) => (
        <li
          className={clsx(styles.reaction, {
            [styles.selected]: selectedTab === key,
          })}
          key={key}
          onClick={() => onTabClick(key)}
        >
          <div>{key}</div>
          <div className={styles.count}>{group.count}</div>
        </li>
      ))}
    </ul>
  );
};

export default GroupedReactions;
