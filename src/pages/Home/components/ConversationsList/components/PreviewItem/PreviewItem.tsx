import clsx from "clsx";
import styles from "./PreviewItem.module.css";
import userIcon from "@assets/user.svg";

interface IPreviewItem {
  avatarUrl: string | null;
  title: string;
  description: string;
  meta?: {
    lastMessageTime: string;
    unreadMessages: number;
  };
  onClick?: () => void;
  onMouseDown?: () => void;
  isActive?: boolean;
}

const PreviewItem = ({
  avatarUrl,
  title,
  description,
  meta,
  onClick,
  onMouseDown,
  isActive,
}: IPreviewItem) => {
  return (
    <div
      className={clsx(styles.previewItem, { [styles.active]: isActive })}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      <div className={styles.icon}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="Conversation Icon" />
        ) : (
          <div className={styles.placeholderIcon}>
            <img src={userIcon} alt="User icon" />
          </div>
        )}
      </div>
      <div className={styles.details}>
        <div className={styles.mainInfo}>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        {meta && (
          <div className={styles.meta}>
            <p>
              {new Date(meta.lastMessageTime).toLocaleString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
            {meta.unreadMessages > 0 && (
              <span className={styles.unreadMessages}>
                {meta.unreadMessages}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewItem;
