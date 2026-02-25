import { createListenerMiddleware } from "@reduxjs/toolkit";
import { addAuthListeners } from "./listeners/authListener";
import type { AppDispatch, RootState } from "@redux/store";
import { addUserListeners } from "./listeners/userListener";

export const listenerMiddleware = createListenerMiddleware<
  RootState,
  AppDispatch
>();
export type AppStartListening = typeof listenerMiddleware.startListening;

addAuthListeners(listenerMiddleware.startListening);
addUserListeners(listenerMiddleware.startListening);
