import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logoutRequest } from "../api/auth";

export function LogoutButton() {
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      navigate("/login");
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      navigate("/login");
    },
  });

  return (
    <button
      onClick={() => logoutMutation.mutate()}
      disabled={logoutMutation.isPending}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium disabled:opacity-50"
    >
      {logoutMutation.isPending ? "Logging out..." : "Logout"}
    </button>
  );
}
