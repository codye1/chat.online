import Cropper from "react-easy-crop";
import Button from "@components/Button/Button";
import type { Area } from "react-easy-crop";
import getCroppedImg from "@utils/helpers/getCroppedImg";
import { useState } from "react";
import Modal from "@components/Modal/Modal";
import styles from "./AvatarWithUploader.module.css";
import Avatar from "@components/Avatar/Avatar";
import Spinner from "@components/Spinner/Spinner";
import {
  useUploadImageMutation,
  type UploadMediaResponse,
} from "@api/slices/mediaSlice";
import AvatarUploader from "@components/AvatarUploader/AvatarUploader";
import clsx from "clsx";

interface IAvatarWithUploader {
  onUpload: (result: UploadMediaResponse) => void;
  width?: string | number;
  height?: string | number;
  defaultAvatarUrl?: string | null;
  buttonClassName?: string;
  className?: string;
  fullSizeUploader?: boolean;
}

const AvatarWithUploader = ({
  onUpload,
  width,
  height,
  defaultAvatarUrl = null,
  buttonClassName,
  className,
  fullSizeUploader,
}: IAvatarWithUploader) => {
  const [loadedImage, setLoadedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const onCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSaveCroppedImage = async () => {
    if (!loadedImage || !croppedAreaPixels) return;

    try {
      const croppedImageBase64 = await getCroppedImg(
        loadedImage,
        croppedAreaPixels,
      );

      const result = await uploadImage(croppedImageBase64).unwrap();

      onUpload(result);
      setLoadedImage(null);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };
  return (
    <>
      <Avatar
        avatarUrl={defaultAvatarUrl}
        width={width}
        height={height}
        className={clsx(styles.avatar, className)}
      >
        <AvatarUploader
          className={clsx(styles.avatarUploader, buttonClassName, {
            [styles.fullSize]: fullSizeUploader && !defaultAvatarUrl,
          })}
          onLoaded={({ src }) => {
            setLoadedImage(src);
          }}
        />
      </Avatar>
      {loadedImage && (
        <Modal onClickOutside={() => setLoadedImage(null)}>
          <div className={styles.cropperContainer}>
            <div className={styles.cropperWrapper}>
              <Cropper
                image={loadedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <span className={styles.cropperButtons}>
              <Button
                onClick={() => setLoadedImage(null)}
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveCroppedImage} disabled={isUploading}>
                {isUploading ? <Spinner /> : "Save"}
              </Button>
            </span>
          </div>
        </Modal>
      )}
    </>
  );
};

export default AvatarWithUploader;
