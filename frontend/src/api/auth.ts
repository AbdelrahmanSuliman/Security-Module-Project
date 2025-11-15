import api from "../lib/axios";

export const loginRequest = async (data: { email: string; password: string }) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};
