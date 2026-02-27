import clsx from "clsx";
import styles from "./Message.module.css";
import Check from "@assets/check.svg";
import { useRef, useState } from "react";
import MessagePopover from "./components/MessagePopover/MessagePopover";
import Reactions from "./components/Reactions/Reactions";

export interface IMessage {
  text: string;
  isSentByCurrentUser: boolean;
  read: boolean;
  createdAt: string;
  id: string;
  ref: (node: Element | null | undefined) => void;
  "data-index": number;
  style?: React.CSSProperties;
  reactions: {
    id: string;
    userId: string;
    content: string;
  }[];
  onDoubleClick?: () => void;
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
  reactions,
  onDoubleClick,
}: IMessage) => {
  const popoverAnchorRef = useRef<HTMLDivElement | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  return (
    <div
      id={id}
      className={styles.messageWrapper}
      ref={ref}
      data-index={dataIndex}
      style={style}
    >
      <div
        ref={popoverAnchorRef}
        onDoubleClick={onDoubleClick}
        onContextMenu={(e) => {
          e.preventDefault();
          setMousePosition({ x: e.clientX, y: e.clientY });
          setIsPopoverOpen(true);
        }}
        className={clsx(styles.message, {
          [styles.sentByCurrentUser]: isSentByCurrentUser,
        })}
      >
        <div className={styles.textContainer}>
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
        <Reactions reactions={reactions} />
        <MessagePopover
          messageId={id}
          anchorRef={popoverAnchorRef}
          isPopoverOpen={isPopoverOpen}
          text={text}
          setIsPopoverOpen={setIsPopoverOpen}
          mousePosition={mousePosition}
          sentByCurrentUser={isSentByCurrentUser}
        />
      </div>
    </div>
  );
};

export default Message;
