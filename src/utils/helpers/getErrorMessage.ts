import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const getErorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined,
) => {
  if (!error) return undefined;
  if (
    "data" in error &&
    error.data &&
    typeof error.data === "object" &&
    "error" in error.data &&
    error.data.error &&
    typeof error.data.error === "object" &&
    "message" in error.data.error
  ) {
    return (error.data.error as { message?: string }).message;
  }
  if ("message" in error && typeof error.message === "string") {
    return error.message;
  }
  return undefined;
};

export default getErorMessage;
