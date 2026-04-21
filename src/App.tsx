import { BrowserRouter } from "react-router-dom";
import Routing from "./router/routing";
import { useRefreshMutation } from "@api/slices/authSlice";
import { useEffect, useRef } from "react";
import Toasts from "@components/Toasts/Toasts";
import ModalManager from "@components/ModalManager/ModalManager";

function App() {
  const [refreshToken] = useRefreshMutation();
  const hasRefreshed = useRef(false);

  useEffect(() => {
    if (hasRefreshed.current) return;
    hasRefreshed.current = true;

    refreshToken();
  }, [refreshToken]);

  return (
    <BrowserRouter>
      <Routing />
      <ModalManager />
      <Toasts />
    </BrowserRouter>
  );
}

export default App;
