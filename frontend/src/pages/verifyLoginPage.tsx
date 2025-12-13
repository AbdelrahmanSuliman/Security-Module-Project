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
    <div className="flex items-center justify-center h-screen bg-[#F7F9FC]">
      <div className="border border-[#D1D5DB] p-8 md:p-10 rounded-lg shadow-md w-full max-w-md bg-white">
        <h1 className="text-3xl font-bold text-[#1F2937] mb-6 text-center">Enter 2FA Code</h1>

        <input
          className="border border-[#D1D5DB] p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0096C7] focus:border-transparent text-[#1F2937] placeholder:text-[#4B5563] transition-all"
          placeholder="6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          maxLength={6}
          required
        />

        <button
          onClick={() => verifyMutation.mutate({ email, code })}
          className="bg-[#0096C7] hover:bg-[#023E8A] text-white w-full p-3 rounded-lg mt-5 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          disabled={verifyMutation.isPending || !code}
        >
          {verifyMutation.isPending ? "Verifying..." : "Verify"}
        </button>

        {error && (
          <div className="mt-5 p-3 bg-[#E74C3C]/10 border border-[#E74C3C] rounded-lg">
            <p className="text-[#E74C3C] text-center text-sm font-medium">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyLoginPage;
