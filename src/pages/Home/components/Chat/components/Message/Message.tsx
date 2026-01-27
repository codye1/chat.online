import clsx from "clsx";
import styles from "./Message.module.css";
import Check from "@assets/check.svg?react";

export interface IMessage {
  text: string;
  isSentByCurrentUser: boolean;
  read: boolean;
  createdAt: Date;
  id: string;
  ref?: (node: HTMLElement | null) => void;
}

const Message = ({
  text,
  isSentByCurrentUser,
  read,
  createdAt,
  id,
  ref,
}: IMessage) => {
  return (
    <div
      id={id}
      className={clsx(styles.message, {
        [styles.sentByCurrentUser]: isSentByCurrentUser,
      })}
      role="message"
      ref={ref}
    >
      <span>{text}</span>
      <span className={styles.createdAt}>
        {createdAt.toLocaleTimeString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
      {isSentByCurrentUser && (
        <Check
          className={clsx(styles.check, {
            [styles.read]: read,
          })}
        />
      )}
    </div>
  );
};

export default Message;
