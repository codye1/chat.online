import { useEffect, useState } from "react";
import clsx from "clsx";
import chevron from "@assets/chevron.svg";
import styles from "./ScrollToBottom.module.css";

interface IScrollToBottom {
  componentRef: React.RefObject<HTMLElement | null>;
  unreadCount: number;
}

const ScrollToBottom = ({ componentRef, unreadCount }: IScrollToBottom) => {
  const [isScrollToBottomVisible, setScrollToBottomVisible] = useState(false);

  useEffect(() => {
    const component = componentRef.current;
    if (!component) return;
    const onScroll = (event: Event) => {
      const el = event.currentTarget;
      if (!(el instanceof HTMLElement)) return;

      if (!isScrollToBottomVisible && el.scrollTop < -100) {
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
  }, [componentRef, isScrollToBottomVisible]);

  const scrollToBottom = () => {
    const component = componentRef.current;
    component?.scrollTo({ top: component.scrollHeight, behavior: "smooth" });
  };
  return (
    <div
      onClick={scrollToBottom}
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
