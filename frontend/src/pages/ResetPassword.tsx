import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { requestPasswordReset, resetPassword } from "../api/password";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"request" | "reset">("request");
  const [backendMessage, setBackendMessage] = useState<string | null>(null);
  const [backendErrors, setBackendErrors] = useState<string[]>([]);

  const navigate = useNavigate();

  const requestResetMutation = useMutation({
    mutationFn: requestPasswordReset,
    onSuccess: () => {
      setBackendMessage("A reset code has been sent to your email.");
      setBackendErrors([]);
      setStep("reset");
    },
    onError: (error: any) => {
      console.error(error);
      if (error.response?.data?.message) {
        setBackendMessage(error.response.data.message);
      } else {
        setBackendMessage("Failed to send reset code. Please try again.");
      }
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: () => resetPassword(email, code, newPassword),
    onSuccess: () => {
      setBackendMessage("Password reset successful! Redirecting to login...");
      setBackendErrors([]);
      setTimeout(() => navigate("/login"), 1500);
    },
    onError: (error: any) => {
      console.error(error);
      const data = error.response?.data;

      if (Array.isArray(data?.errors)) {
        // Extract Zod validation messages
        setBackendErrors(data.errors.map((err: any) => `${err.field}: ${err.message}`));
      } else if (data?.message) {
        setBackendMessage(data.message);
      } else {
        setBackendMessage("An unknown error occurred.");
      }
    },
  });

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setBackendMessage(null);
    setBackendErrors([]);
    requestResetMutation.mutate(email);
  };

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setBackendMessage(null);
    setBackendErrors([]);
    resetPasswordMutation.mutate();
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#F7F9FC]">
      <div className="border border-[#D1D5DB] rounded-lg shadow-md w-full max-w-md p-8 md:p-10 bg-white">
        <h1 className="text-3xl font-bold text-[#1F2937] text-center mb-8">
          Reset Password
        </h1>

        {step === "request" ? (
          <form onSubmit={handleRequest} className="flex flex-col gap-5">
            <input
              type="email"
              placeholder="Enter your email"
              className="border border-[#D1D5DB] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#0096C7] focus:border-transparent text-[#1F2937] placeholder:text-[#4B5563] transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={requestResetMutation.isPending}
              className="bg-[#0096C7] hover:bg-[#023E8A] text-white rounded-lg p-3 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {requestResetMutation.isPending
                ? "Sending..."
                : "Request Reset Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-5">
            <input
              type="text"
              placeholder="Enter reset code"
              className="border border-[#D1D5DB] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#0096C7] focus:border-transparent text-[#1F2937] placeholder:text-[#4B5563] transition-all"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="New password"
              className="border border-[#D1D5DB] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#0096C7] focus:border-transparent text-[#1F2937] placeholder:text-[#4B5563] transition-all"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="bg-[#7DD87D] hover:bg-[#48B7A5] text-white rounded-lg p-3 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {resetPasswordMutation.isPending
                ? "Resetting..."
                : "Reset Password"}
            </button>
          </form>
        )}

        {backendMessage && (
          <div className={`mt-5 p-3 rounded-lg ${
            backendMessage.includes("successful")
              ? "bg-[#2ECC71]/10 border border-[#2ECC71]"
              : "bg-[#E74C3C]/10 border border-[#E74C3C]"
          }`}>
            <p className={`text-center text-sm font-medium ${
              backendMessage.includes("successful")
                ? "text-[#2ECC71]"
                : "text-[#E74C3C]"
            }`}>
              {backendMessage}
            </p>
          </div>
        )}

        {backendErrors.length > 0 && (
          <div className="mt-5 p-3 bg-[#E74C3C]/10 border border-[#E74C3C] rounded-lg">
            <div className="text-[#E74C3C] text-sm space-y-1">
              {backendErrors.map((err, idx) => (
                <p key={idx}>• {err}</p>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          className="text-center text-[#0096C7] hover:text-[#023E8A] mt-6 cursor-pointer font-medium transition-colors duration-200"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
