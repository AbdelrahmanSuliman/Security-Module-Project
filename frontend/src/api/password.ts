import api from "../lib/axios";

export const requestPasswordReset = async (email: string) => {
  const res = await api.post("/auth/request-password-reset", { email });
  return res.data;
}

export const resetPassword = async (email: string, code: string, newPassword: string) => {
    const res = await api.post("/auth/reset-password", { email, code, newPassword });
    return res.data;
}
