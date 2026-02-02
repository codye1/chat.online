import clsx from "clsx";
import styles from "./Message.module.css";
import Check from "@assets/check.svg";

export interface IMessage {
  text: string;
  isSentByCurrentUser: boolean;
  read: boolean;
  createdAt: string;
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
        {new Date(createdAt).toLocaleString(undefined, {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
      {isSentByCurrentUser && (
        <img
          className={clsx(styles.check, { [styles.read]: read })}
          src={Check}
          alt=""
        />
      )}
    </div>
  );
};

export default Message;
