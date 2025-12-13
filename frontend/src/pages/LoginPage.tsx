import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { loginRequest } from "../api/auth";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [backendErrors, setBackendErrors] = useState<string[]>([]);

  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      console.log("Login step result:", data);

      if (data.step === "VERIFY_CODE") {
        navigate("/verify-login", { state: { email } });
        return;
      }


      switch (data.role.toUpperCase()) {
        case "ADMIN":
          navigate("/admin");
          break;
        case "DOCTOR":
          navigate("/doctor");
          break;
        case "NURSE":
          navigate("/nurse");
          break;
        case "PATIENT":
          navigate("/patient");
          break;
        default:
          navigate("/login");
      }
    },

    onError: (error: any) => {
      console.error("Login failed:", error);

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        if (status === 401) {
          setBackendErrors(["Invalid email or password."]);
        } else if (Array.isArray(data?.errors)) {
          setBackendErrors(
            data.errors.map((err: any) => `${err.field}: ${err.message}`)
          );
        } else if (data?.message) {
          setBackendErrors([data.message]);
        } else {
          setBackendErrors(["An unknown error occurred."]);
        }
      } else {
        setBackendErrors(["Unable to connect to the server."]);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBackendErrors([]);
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#F7F9FC]">
      <div className="border border-[#D1D5DB] rounded-lg w-full max-w-md shadow-md bg-white p-8 md:p-10">
        <h1 className="text-3xl font-bold text-[#1F2937] mb-8 text-center">HealthCureAlpha Login</h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col space-y-5"
        >
          <input
            type="email"
            placeholder="Email"
            className="border border-[#D1D5DB] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0096C7] focus:border-transparent text-[#1F2937] placeholder:text-[#4B5563] transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="border border-[#D1D5DB] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0096C7] focus:border-transparent text-[#1F2937] placeholder:text-[#4B5563] transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="bg-[#0096C7] hover:bg-[#023E8A] text-white p-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </button>
        </form>

        {backendErrors.length > 0 && (
          <div className="mt-5 p-3 bg-[#E74C3C]/10 border border-[#E74C3C] rounded-lg">
            <div className="text-[#E74C3C] text-sm space-y-1 text-center">
              {backendErrors.map((err, idx) => (
                <p key={idx}>{err}</p>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          className="text-center text-[#0096C7] hover:text-[#023E8A] p-4 mt-6 cursor-pointer font-medium transition-colors duration-200"
          onClick={() => navigate("/reset-password")}
        >
          Forgot Password?
        </button>
      </div>
    </div>
  );
}

export default LoginPage;
