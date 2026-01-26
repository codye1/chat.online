import "./Auth.css";
import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";

const Auth = () => {
  const [haveAccount, setHaveAccount] = useState<boolean>(true);

  return (
    <main className="auth-menu">
      {haveAccount ? (
        <Login
          onHaveAccount={() => {
            setHaveAccount(false);
          }}
        />
      ) : (
        <Register
          onHaveAccount={() => {
            setHaveAccount(true);
          }}
        />
      )}
    </main>
  );
};

export default Auth;
