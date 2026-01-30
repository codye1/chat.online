import type { FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getErrorCode = (
  error: FetchBaseQueryError | undefined,
): string | undefined => {
  if (!error || !isRecord(error)) return undefined;

  const data = (error as FetchBaseQueryError).data;
  if (!isRecord(data)) return undefined;

  const nestedError = data.error;
  if (!isRecord(nestedError)) return undefined;

  const code = nestedError.code;
  return typeof code === "string" ? code : undefined;
};

export default getErrorCode;
