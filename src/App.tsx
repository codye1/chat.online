import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { useAppDispatch, useAppSelector } from "./hooks/hooks";
import { increment } from "./redux/counterSlice";
import { useGetUsersQuery } from "./api/api";

function App() {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();
  const { data, error, isLoading } = useGetUsersQuery();
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => dispatch(increment())}>count is {count}</button>
        <p>
          {isLoading
            ? "Loading..."
            : error
              ? `Error occurred ${JSON.stringify(error)}`
              : JSON.stringify(data)}
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
