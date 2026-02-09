import { useEffect, useState } from "react";
import clsx from "clsx";
import chevron from "@assets/chevron.svg";
import styles from "./ScrollToBottom.module.css";

interface IScrollToBottom {
  component: HTMLDivElement | null;
  unreadCount: number;
  onClick: () => void;
}

const ScrollToBottom = ({
  component,
  unreadCount,
  onClick,
}: IScrollToBottom) => {
  const [isScrollToBottomVisible, setScrollToBottomVisible] = useState(false);
  useEffect(() => {
    if (!component) return;
    const onScroll = (event: Event) => {
      const el = event.currentTarget;
      if (!(el instanceof HTMLElement)) return;

      if (
        !isScrollToBottomVisible &&
        (el.scrollTop < -100 || unreadCount > 0)
      ) {
        setScrollToBottomVisible(true);
      }

      if (isScrollToBottomVisible && el.scrollTop > -100) {
        setScrollToBottomVisible(false);
      }
    };
    component.addEventListener("scroll", onScroll);
    return () => {
      component.removeEventListener("scroll", onScroll);
    };
  }, [component, isScrollToBottomVisible]);

  return (
    <div className={styles.scrollAnchor}>
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
    </div>
  );
};

export default ScrollToBottom;
