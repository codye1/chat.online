import { GoogleLogin } from "@react-oauth/google";
import { useGoogleLoginMutation } from "@api/slices/authSlice";
const GoogleButton = () => {
  const [googleLogin] = useGoogleLoginMutation();

  return (
    <GoogleLogin
      onSuccess={async (res) => {
        await googleLogin({
          credential: res.credential!,
        }).unwrap();
      }}
      onError={() => console.log("Google login failed")}
    />
  );
};

export default GoogleButton;
