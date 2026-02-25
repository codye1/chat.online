import {
  combineReducers,
  configureStore,
  type Action,
  type ThunkDispatch,
} from "@reduxjs/toolkit";
import api from "../api/api";
import auth from "./auth";
import { listenerMiddleware } from "@api/listenerMiddleware";
import globalSlice from "./global";
import imageSlice from "@api/slices/imageSlice";

export const rootReducer = combineReducers({
  global: globalSlice.reducer,
  auth: auth.reducer,
  [api.reducerPath]: api.reducer,
  [imageSlice.reducerPath]: imageSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export type AppDispatch = ThunkDispatch<RootState, undefined, Action>;

export default configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      listenerMiddleware.middleware,
      api.middleware,
      imageSlice.middleware,
    ),
});
