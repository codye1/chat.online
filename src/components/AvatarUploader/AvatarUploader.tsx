import styles from "./AvatarUploader.module.css";
import InputFile, { type LoadedFile } from "@components/InputFile/InputFile";
import photoCamera from "@assets/photoCamera.svg";
import clsx from "clsx";

interface IAvatarUploader {
  onLoaded: ({ src }: LoadedFile) => void;
  className?: string;
}

const AvatarUploader = ({ onLoaded, className }: IAvatarUploader) => {
  return (
    <button className={clsx(styles.avatarButton, className)}>
      <img src={photoCamera} alt="photo camera icon" />
      <InputFile allow={["image"]} onLoaded={onLoaded} />
    </button>
  );
};

export default AvatarUploader;
