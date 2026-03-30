import ListItem from "@components/ListItem/ListItem";
import { useAppDispatch, useAppSelector } from "@hooks/hooks";
import clsx from "clsx";
import styles from "./Toasts.module.css";
import { createPortal } from "react-dom";
import closeIcon from "@assets/close.svg";
import { removeToast, setConversation } from "@redux/global";
import infoIcon from "@assets/info.svg";

const Toasts = () => {
  const toasts = useAppSelector((state) => state.global.toasts);
  const dispatch = useAppDispatch();

  const icons = {
    success: infoIcon,
    error: infoIcon,
    info: infoIcon,
  };

  return createPortal(
    <ul className={styles.toasts}>
      {toasts.map((toast) => {
        switch (toast.type) {
          case "newMessage":
            return (
              <ListItem
                key={toast.id}
                onClick={() => {
                  dispatch(
                    setConversation({
                      conversationId: toast.newMessage.conversationId,
                    }),
                  );
                }}
                className={clsx(styles.toast, styles[toast.type])}
              >
                <div className={styles.message}>
                  <strong>{toast.newMessage.sender}</strong>
                  {toast.newMessage.text}
                </div>
                <button
                  className={styles.closeButton}
                  onClick={() => dispatch(removeToast({ id: toast.id }))}
                >
                  <img src={closeIcon} alt="Close" />
                </button>
              </ListItem>
            );
          default:
            return (
              <ListItem
                key={toast.id}
                onClick={() => {
                  dispatch(removeToast({ id: toast.id }));
                }}
                className={clsx(styles.toast, styles[toast.type])}
              >
                <img
                  src={icons[toast.type]}
                  alt={toast.type}
                  className={styles.icon}
                />
                {toast.message}
                <button
                  className={styles.closeButton}
                  onClick={() => dispatch(removeToast({ id: toast.id }))}
                >
                  <img src={closeIcon} alt="Close" />
                </button>
              </ListItem>
            );
        }
      })}
    </ul>,
    document.body,
  );
};

export default Toasts;
