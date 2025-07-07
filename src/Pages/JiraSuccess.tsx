import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const JiraSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate(); // ✅ This was missing

  useEffect(() => {
    const token = params.get("token");
    const cloudid = params.get("cloudId");
    console.log("Redirect token received:", token, cloudid);

    if (token) {
      sessionStorage.setItem("jiraAccessToken", token);
      sessionStorage.setItem("cloudid", cloudid);
      console.log("Token stored in sessionStorage");
      setTimeout(() => {
        navigate("/");
      }, 500); // Redirect to homepage or dashboard
    }
  }, [params, navigate]); // Add dependencies for safety

  return <h2>Connecting to Jira...</h2>;
};

export default JiraSuccess;
