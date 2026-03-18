import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { MessageMedia } from "@utils/types";

interface UploadMediaResponse {
  public_id: string;
  secure_url: string;
  resource_type: string;
  original_filename: string;
}

const CLOUD_NAME = import.meta.env.VITE_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_UPLOAD_PRESET;

export const mediaSlice = createApi({
  reducerPath: "mediaSlice",
  baseQuery: fetchBaseQuery({
    baseUrl: `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/`,
  }),
  endpoints: (builder) => ({
    uploadMedia: builder.mutation<MessageMedia[], File[]>({
      async queryFn(files, _queryApi, _extraOptions, fetchWithBQ) {
        const uploadPromises = files.map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", UPLOAD_PRESET);

          const resourceType = file.type.startsWith("video")
            ? "video"
            : "image";

          const result = await fetchWithBQ({
            url: `${resourceType}/upload`,
            method: "POST",
            body: formData,
          });

          if (result.error) throw result.error;

          const data = result.data as UploadMediaResponse;

          return {
            id: data.public_id,
            src: data.secure_url,
            type: resourceType,
            filename: data.original_filename || file.name,
          } as MessageMedia;
        });

        const results = await Promise.all(uploadPromises);
        return { data: results };
      },
    }),

    uploadImage: builder.mutation<UploadMediaResponse, string>({
      async queryFn(base64String, _queryApi, _extraOptions, fetchWithBQ) {
        const formData = new FormData();
        formData.append("file", base64String);
        formData.append("upload_preset", UPLOAD_PRESET);

        const isVideo = base64String.startsWith("data:video");
        const resourceType = isVideo ? "video" : "image";

        const result = await fetchWithBQ({
          url: `${resourceType}/upload`,
          method: "POST",
          body: formData,
        });

        if (result.error) return { error: result.error };

        return { data: result.data as UploadMediaResponse };
      },
    }),
  }),
});

export const { useUploadMediaMutation, useUploadImageMutation } = mediaSlice;

export default mediaSlice;
