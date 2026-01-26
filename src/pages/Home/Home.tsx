import { useLogoutMutation } from "@api/slices/authSlice";
import Button from "@components/Button/Button";

const Home = () => {
  const [logout] = useLogoutMutation();

  return (
    <div>
      <h1>Home Page</h1>
      <Button onClick={() => logout()}>Logout</Button>
    </div>
  );
};

export default Home;
