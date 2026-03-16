import type { MessageMedia } from "@utils/types";
import styles from "./MediaContainer.module.css";
import { useAppDispatch } from "@hooks/hooks";
import { openModal } from "@redux/global";

interface IMediaContainer {
  mediaItems: MessageMedia[];
}

const MediaContainer = ({ mediaItems }: IMediaContainer) => {
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
