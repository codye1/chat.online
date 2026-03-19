import clsx from "clsx";
import styles from "./Message.module.css";
import Check from "@assets/check.svg";
import { useRef, useState } from "react";
import Reactions from "./components/Reactions/Reactions";
import type { MessageMedia, Message as MessageType } from "@utils/types";
import MessageContextMenu from "./components/MessageContextMenu/MessageContextMenu";
import MediaContainer from "./components/MediaContainer/MediaContainer";
import getDisplayName from "@utils/helpers/getDisplayName";

export interface IMessage {
  message: MessageType;
  isSentByCurrentUser: boolean;
  read: boolean;
  ref: (node: Element | null | undefined) => void;
  "data-index": number;
  style?: React.CSSProperties;
  onDoubleClick?: () => void;
}

const Message = ({
  message,
  isSentByCurrentUser,
  read,
  ref,
  "data-index": dataIndex,
  style,
  onDoubleClick,
}: IMessage) => {
  const popoverAnchorRef = useRef<HTMLDivElement | null>(null);
  const [contextMenu, setContextMenu] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mediaForContextMenu, setMediaForContextMenu] =
    useState<MessageMedia>();

  return (
    <>
      <div
        id={message.id}
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
            setContextMenu(true);
          }}
          className={clsx(styles.message, {
            [styles.sentByCurrentUser]: isSentByCurrentUser,
          })}
        >
          {/*TODO: make scroll on click (with better messageList)*/}
          {message.replyTo && (
            <div className={styles.rplyContainer}>
              <h3 className={styles.rplyAuthor}>
                {getDisplayName(message.replyTo.sender)}
              </h3>
              <span className={styles.rplyText}>{message.replyTo.text}</span>
            </div>
          )}
          {message.media && (
            <MediaContainer
              mediaItems={message.media}
              onMediaItemContextMenu={(e, media) => {
                e.preventDefault();
                setMousePosition({ x: e.clientX, y: e.clientY });
                setContextMenu(true);
                setMediaForContextMenu(media);
              }}
            />
          )}

          <div className={styles.textContainer}>
            {message.text}
            <div className={styles.metaContainer}>
              <span className={styles.createdAt}>
                {new Date(message.createdAt).toLocaleString(undefined, {
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
          <Reactions reactions={message.reactions} messageId={message.id} />
        </div>
      </div>
      <MessageContextMenu
        isContextMenuOpen={contextMenu}
        setIsContextMenuOpen={setContextMenu}
        mousePosition={mousePosition}
        setMediaForContextMenu={setMediaForContextMenu}
        mediaForContextMenu={mediaForContextMenu}
        message={{ ...message, sentByCurrentUser: isSentByCurrentUser }}
      />
    </>
  );
};

export default Message;
