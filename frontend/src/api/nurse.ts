import api from "../lib/axios";

export const getAssignedPatients = async () => {
  const res = await api.get("/nurse/patients");
  return res.data.data;
};
