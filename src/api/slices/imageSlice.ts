import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;

interface ImgbbUploadResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: number;
    height: number;
    size: number;
    time: number;
    expiration: number;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

const imageSlice = createApi({
  reducerPath: "imageApi",
  baseQuery: fetchBaseQuery({ baseUrl: "https://api.imgbb.com/1" }),
  endpoints: (builder) => ({
    uploadImage: builder.mutation<ImgbbUploadResponse, string>({
      query: (imageBase64) => {
        const formData = new FormData();
        // Remove data:image/...;base64, prefix if present
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        formData.append("image", base64Data);

        return {
          url: `/upload?key=${IMGBB_API_KEY}`,
          method: "POST",
          body: formData,
        };
      },
    }),
  }),
});

export const { useUploadImageMutation } = imageSlice;
export default imageSlice;
