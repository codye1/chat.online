import clsx from "clsx";
import styles from "./Message.module.css";
import Check from "@assets/check.svg";
import { useRef, useState, type CSSProperties } from "react";
import Reactions from "./components/Reactions/Reactions";
import type { MessageMedia, Message as MessageType } from "@utils/types";
import MediaContainer from "./components/MediaContainer/MediaContainer";
import getDisplayName from "@utils/helpers/getDisplayName";
import ContextMenu from "@components/ContextMenu/ContextMenu";
import MessageContextMenu from "./components/MessageContextMenu/MessageContextMenu";

export interface IMessage {
  message: MessageType;
  isSentByCurrentUser: boolean;
  read: boolean;
  ref: (node: Element | null | undefined) => void;
  "data-index": number;
  style?: CSSProperties;
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
  const [showContextMenu, setShowContextMenu] = useState(false);
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
            setShowContextMenu(true);
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
                setShowContextMenu(true);
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
              {isSentByCurrentUser && message.status !== "sending" && (
                <img
                  className={clsx(styles.check, { [styles.read]: read })}
                  src={Check}
                  alt=""
                />
              )}
            </div>
          </div>
          <Reactions
            reactions={message.reactions}
            messageId={message.id}
            conversationId={message.conversationId}
          />
        </div>
      </div>
      {showContextMenu && (
        <ContextMenu
          isOpen={showContextMenu}
          onClose={() => setShowContextMenu(false)}
          position={mousePosition}
        >
          <MessageContextMenu
            message={{ ...message, sentByCurrentUser: isSentByCurrentUser }}
            mediaForContextMenu={mediaForContextMenu}
            setMediaForContextMenu={setMediaForContextMenu}
          />
        </ContextMenu>
      )}
    </>
  );
};

export default Message;
