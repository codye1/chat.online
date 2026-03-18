import Modal from "@components/Modal/Modal";
import { useAppDispatch } from "@hooks/hooks";
import { closeModal } from "@redux/global";
import type { MessageMedia } from "@utils/types";
import styles from "./Lightbox.module.css";
import closeIcon from "@assets/close.svg";

interface ILightbox {
  media: MessageMedia;
}

const Lightbox = ({ media }: ILightbox) => {
  const dispatch = useAppDispatch();

  return (
    <Modal
      onClickOutside={() => {
        dispatch(closeModal());
      }}
    >
      <div className={styles.header}>
        <button
          onClick={() => {
            dispatch(closeModal());
          }}
        >
          <img src={closeIcon} alt="Close" />
        </button>
      </div>
      <div className={styles.lightbox}>
        {media.type === "image" ? (
          <img src={media.src} alt={media.filename} className={styles.image} />
        ) : (
          <video src={media.src} controls className={styles.video} autoPlay />
        )}
      </div>
    </Modal>
  );
};

export default Lightbox;
export type { ILightbox };
