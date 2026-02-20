import { useEffect, useState } from "react";
import clsx from "clsx";
import chevron from "@assets/chevron.svg";
import styles from "./ScrollToBottom.module.css";
import checkIfNearBottom from "@utils/checkIfNearBottom";

interface IScrollToBottom {
  component: HTMLDivElement | null;
  unreadCount: number;
  conversationId: string;
  onClick: () => void;
}

const ScrollToBottom = ({
  component,
  unreadCount,
  conversationId,
  onClick,
}: IScrollToBottom) => {
  const [isScrollToBottomVisible, setScrollToBottomVisible] = useState(false);

  useEffect(() => {
    if (!component) return;
    const updateVisibility = () => {
      setScrollToBottomVisible(
        !checkIfNearBottom(component, 100) ||
          (unreadCount > 0 && !checkIfNearBottom(component, 10)),
      );
    };

    updateVisibility();

    component.addEventListener("scroll", updateVisibility);
    return () => {
      component.removeEventListener("scroll", updateVisibility);
    };
  }, [component, unreadCount, conversationId]);

  return (
    <div
      onClick={onClick}
      className={clsx(styles.scrollToBottom, {
        [styles.show]: isScrollToBottomVisible,
      })}
    >
      {unreadCount > 0 && (
        <span className={styles.unreadCount}>{unreadCount}</span>
      )}
      <img src={chevron} alt="Scroll to bottom" />
    </div>
  );
};

export default ScrollToBottom;
