import Cropper from "react-easy-crop";
import Button from "@components/Button/Button";
import type { Area } from "react-easy-crop";
import { useUploadImageMutation } from "@api/slices/imageSlice";
import getCroppedImg from "@utils/getCroppedImg";
import { useState } from "react";
import Modal from "@components/Modal/Modal";
import styles from "./AvatarWithUploader.module.css";
import Avatar from "@components/Avatar/Avatar";

import photoCamera from "@assets/photoCamera.svg";
import { useAppSelector } from "@hooks/hooks";
import { useUpdateUserMutation } from "@api/slices/userSlice";
import Spinner from "@components/Spinner/Spinner";

const AvatarWithUploader = () => {
  const [loadedImage, setLoadedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const [updateUser] = useUpdateUserMutation();
  const user = useAppSelector((state) => state.auth.user);
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
      console.log("Image uploaded successfully:", result.data.url);

      // TODO: Update user avatar with result.data.url
      await updateUser({ avatarUrl: result.data.url }).unwrap();

      setLoadedImage(null);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };
  return (
    <>
      <Avatar avatarUrl={user.avatarUrl} width={"100px"} height={"100px"}>
        <div className={styles.avatarButton}>
          <img src={photoCamera} alt="photo camera icon" />
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const imageDataUrl = e.target?.result as string;
                  setLoadedImage(imageDataUrl);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        </div>
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
                classes={{
                  containerClassName: styles.cropper,
                  cropAreaClassName: styles.cropArea,
                }}
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
