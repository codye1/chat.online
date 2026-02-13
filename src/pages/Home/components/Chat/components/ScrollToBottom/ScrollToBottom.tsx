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
  const [isScrollToBottomVisible, setScrollToBottomVisible] = useState(true);
  useEffect(() => {
    if (!component) return;
    const onScroll = (event: Event) => {
      const el = event.currentTarget;
      if (!(el instanceof HTMLElement)) return;

      // Вычисляем сколько осталось до низа
      const scrolledFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight;

      // Показываем кнопку, если отскроллено от низа больше чем на 100px или есть непрочитанные
      if (scrolledFromBottom > 100 || unreadCount > 0) {
        setScrollToBottomVisible(true);
      } else {
        setScrollToBottomVisible(false);
      }

      if (scrolledFromBottom < 100) {
        setScrollToBottomVisible(false);
      }
    };
    component.addEventListener("scroll", onScroll);
    return () => {
      component.removeEventListener("scroll", onScroll);
    };
  }, [component, unreadCount]);

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
