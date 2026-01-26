import { BrowserRouter } from "react-router-dom";
import Routing from "./router/routing";
import { useRefreshMutation } from "@api/slices/authSlice";
import { useEffect } from "react";

function App() {
  const [refetch] = useRefreshMutation();

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <BrowserRouter>
      <Routing />
    </BrowserRouter>
  );
}

export default App;
