import { useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { verifyLoginRequest } from "../api/auth";

function VerifyLoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const verifyMutation = useMutation({
    mutationFn: verifyLoginRequest,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role.toUpperCase());
      navigate(`/${data.role.toLowerCase()}`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Invalid code");
    },
  });

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="border p-8 rounded shadow w-96">
        <h1 className="text-xl mb-4 text-center">Enter 2FA Code</h1>

        <input
          className="border p-2 w-full rounded"
          placeholder="6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <button
          onClick={() => verifyMutation.mutate({ email, code })}
          className="bg-blue-500 text-white w-full p-2 rounded mt-4"
        >
          Verify
        </button>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
}

export default VerifyLoginPage;
