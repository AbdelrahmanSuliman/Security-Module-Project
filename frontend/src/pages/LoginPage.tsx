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
      console.log("Login successful:", data);
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role.toUpperCase());

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
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="border-2 border-gray-300 rounded-lg w-96 shadow-lg h-auto p-8">
        <h1 className="text-2xl p-8 text-center">HealthCureAlpha Login</h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col space-y-4 mt-4 gap-4"
        >
          <input
            type="email"
            placeholder="Email"
            className="border border-gray-300 p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="border border-gray-300 p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 hover:cursor-pointer disabled:opacity-50"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Logging in..." : "Login"}
          </button>
        </form>

        {backendErrors.length > 0 && (
          <div className="mt-4 text-red-500 text-sm space-y-1 text-center">
            {backendErrors.map((err, idx) => (
              <p key={idx}>{err}</p>
            ))}
          </div>
        )}
        <h1
          className="text-center text-blue-400 hover:text-blue-600 p-4 hover:cursor-pointer"
          onClick={() => navigate("/reset-password")}
        >
          Forgot Password?
        </h1>
      </div>
    </div>
  );
}

export default LoginPage;
