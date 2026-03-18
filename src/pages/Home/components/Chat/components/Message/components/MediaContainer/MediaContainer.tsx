import type { MessageMedia } from "@utils/types";
import styles from "./MediaContainer.module.css";
import { useAppDispatch } from "@hooks/hooks";
import { openModal } from "@redux/global";

interface IMediaContainer {
  mediaItems: MessageMedia[];
  onMediaItemContextMenu: (
    e: React.MouseEvent<HTMLDivElement>,
    media: MessageMedia,
  ) => void;
}

const MediaContainer = ({
  mediaItems,
  onMediaItemContextMenu,
}: IMediaContainer) => {
  const dispatch = useAppDispatch();
  const onMediaClick = (media: MessageMedia) => {
    dispatch(openModal({ type: "lightbox", media }));
  };

  return (
    <div
      className={styles.mediaContainer}
      data-count={mediaItems.length > 4 ? 4 : mediaItems.length}
    >
      {mediaItems.map((media) => (
        <div
          key={media.id}
          className={styles.mediaItem}
          onClick={() => onMediaClick(media)}
          onContextMenu={(e) => {
            e.preventDefault();
            onMediaItemContextMenu(e, media);
          }}
          data-media-id={media.id}
        >
          {media.type === "image" ? (
            <img
              src={media.src}
              alt={media.filename}
              className={styles.image}
            />
          ) : (
            <video className={styles.video} loop autoPlay muted playsInline>
              <source src={media.src} type="video/mp4" />
            </video>
          )}
        </div>
      ))}
    </div>
  );
};

export default MediaContainer;
