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
    <div className="w-screen h-screen flex items-center justify-center bg-gray-50">
      <div className="border border-gray-300 rounded-xl shadow-lg w-96 p-8 bg-white">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Reset Password
        </h1>

        {step === "request" ? (
          <form onSubmit={handleRequest} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={requestResetMutation.isPending}
              className="bg-blue-500 text-white rounded-lg p-2 hover:bg-blue-600 transition disabled:opacity-50"
            >
              {requestResetMutation.isPending
                ? "Sending..."
                : "Request Reset Code"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Enter reset code"
              className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="New password"
              className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={resetPasswordMutation.isPending}
              className="bg-green-500 text-white rounded-lg p-2 hover:bg-green-600 transition disabled:opacity-50"
            >
              {resetPasswordMutation.isPending
                ? "Resetting..."
                : "Reset Password"}
            </button>
          </form>
        )}

        {backendMessage && (
          <p
            className={`mt-4 text-center text-sm ${
              backendMessage.includes("successful")
                ? "text-green-600"
                : "text-red-500"
            }`}
          >
            {backendMessage}
          </p>
        )}

        {backendErrors.length > 0 && (
          <div className="mt-4 text-red-500 text-sm space-y-1 text-left">
            {backendErrors.map((err, idx) => (
              <p key={idx}>• {err}</p>
            ))}
          </div>
        )}

        <p
          className="text-center text-blue-400 hover:text-blue-600 mt-6 cursor-pointer"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </p>
      </div>
    </div>
  );
}
