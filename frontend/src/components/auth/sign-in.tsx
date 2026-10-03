import { Descope } from "@descope/react-sdk";
import { useNavigate } from "react-router";

function SignInComponent() {
  const navigate = useNavigate();

  return (
    <div className="descope-wrap">
      <Descope
        flowId="sign-up-or-in"
        autoFocus="skipFirstScreen"
        onSuccess={() => navigate("/dashboard", { replace: true })}
        onError={(event) => console.error("sign in failed", event.detail)}
      />
    </div>
  );
}

export default SignInComponent;
