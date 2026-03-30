import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const getErorMessage = (
  error: FetchBaseQueryError | SerializedError | undefined | unknown,
) => {
  if (!error) return undefined;

  if (isObject(error) && "data" in error) {
    const data = error.data;

    if (
      isObject(data) &&
      "error" in data &&
      isObject(data.error) &&
      "message" in data.error &&
      typeof data.error.message === "string"
    ) {
      return data.error.message;
    }

    if (
      isObject(data) &&
      "message" in data &&
      typeof data.message === "string"
    ) {
      return data.message;
    }
  }

  if (
    isObject(error) &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return undefined;
};

export default getErorMessage;
