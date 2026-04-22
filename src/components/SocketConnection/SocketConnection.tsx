import Spinner from "@components/Spinner/Spinner";
import styles from "./SocketConnection.module.css";
import { useSocketConnection } from "@hooks/useSocketConnection";

const SocketConnection = () => {
  const {
    isConnected,
    reconnectAttempts,
    secondsUntilNextReconnectAttempt,
    reconnectNow,
  } = useSocketConnection();

  return (
    !isConnected && (
      <div className={styles.connectionStatus}>
        <Spinner />
        {reconnectAttempts > 0 && (
          <p>
            {reconnectAttempts}
            {secondsUntilNextReconnectAttempt !== null &&
              ` - next attempt in ${secondsUntilNextReconnectAttempt}s`}
          </p>
        )}
        <button onClick={reconnectNow}>Try now</button>
      </div>
    )
  );
};

export default SocketConnection;
