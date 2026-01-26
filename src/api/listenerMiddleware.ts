import { createListenerMiddleware } from "@reduxjs/toolkit";
import { addAuthListeners } from "./listeners/authListener";
import type { AppDispatch, RootState } from "@redux/store";

export const listenerMiddleware = createListenerMiddleware<
  RootState,
  AppDispatch
>();
export type AppStartListening = typeof listenerMiddleware.startListening;

addAuthListeners(listenerMiddleware.startListening);
