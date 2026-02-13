import clsx from "clsx";
import styles from "./Message.module.css";
import Check from "@assets/check.svg";

export interface IMessage {
  text: string;
  isSentByCurrentUser: boolean;
  read: boolean;
  createdAt: string;
  id: string;
  ref: (node: Element | null | undefined) => void;
  "data-index": number;
  style?: React.CSSProperties;
}

const Message = ({
  text,
  isSentByCurrentUser,
  read,
  createdAt,
  id,
  ref,
  "data-index": dataIndex,
  style,
}: IMessage) => {
  return (
    <div
      id={id}
      className={styles.messageWrapper}
      role="message"
      ref={ref}
      data-index={dataIndex}
      style={style}
    >
      <div
        className={clsx(styles.message, {
          [styles.sentByCurrentUser]: isSentByCurrentUser,
        })}
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
    </div>
  );
};

export default Message;
