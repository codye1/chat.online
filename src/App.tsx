import { BrowserRouter } from "react-router-dom";
import Routing from "./router/routing";
import { useRefreshMutation } from "@api/slices/authSlice";
import { useEffect, useRef } from "react";
import { useSocketConnection } from "@hooks/useSocketConnection";

function App() {
  const [refreshToken] = useRefreshMutation();
  const hasRefreshed = useRef(false);

  useSocketConnection();

  useEffect(() => {
    if (hasRefreshed.current) return;
    hasRefreshed.current = true;

    refreshToken();
  }, [refreshToken]);

  return (
    <BrowserRouter>
      <Routing />
    </BrowserRouter>
  );
}

export default App;
