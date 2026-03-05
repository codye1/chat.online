import clsx from "clsx";
import styles from "./ConversationFoldersList.module.css";
import { useRef } from "react";
import type { WheelEvent } from "react";

const ConversationFoldersList = () => {
  const listRef = useRef<HTMLUListElement>(null);

  const handleWheel = (e: WheelEvent<HTMLUListElement>) => {
    if (listRef.current) {
      listRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <ul className={styles.list} ref={listRef} onWheel={handleWheel}>
      <li className={clsx(styles.folder, styles.active)}>
        All <div className={styles.count}>5</div>
      </li>
      <li className={styles.folder}>
        Something <div className={styles.count}>5</div>
      </li>
      <li className={styles.folder}>
        Something <div className={styles.count}>5</div>
      </li>
      <li className={styles.folder}>
        Something <div className={styles.count}>5</div>
      </li>
      <li className={styles.folder}>
        Something <div className={styles.count}>5</div>
      </li>
      <li className={styles.folder}>
        Something <div className={styles.count}>5</div>
      </li>
      <li className={styles.folder}>
        Something <div className={styles.count}>5</div>
      </li>
      <li className={styles.folder}>
        Something <div className={styles.count}>5</div>
      </li>
      <li className={styles.folder}>
        Something <div className={styles.count}>5</div>
      </li>
      <li className={styles.folder}>
        Something <div className={styles.count}>5</div>
      </li>
    </ul>
  );
};

export default ConversationFoldersList;
