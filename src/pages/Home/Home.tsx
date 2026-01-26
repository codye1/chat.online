import { useGetProtectedQuery } from "@api/api";
import { useLogoutMutation } from "@api/slices/authSlice";
import Button from "@components/Button/Button";

const Home = () => {
  const [logout] = useLogoutMutation();
  const { data, error, isLoading, refetch } = useGetProtectedQuery();
  return (
    <main>
      <h1>Home Page</h1>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error loading protected data</p>}
      {data && <p>Protected Message: {data.message}</p>}
      <Button onClick={() => refetch()}>Refetch Protected Data</Button>
      <Button onClick={() => logout()}>Logout</Button>
    </main>
  );
};

export default Home;
