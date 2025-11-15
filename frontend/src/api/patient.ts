import api from "../lib/axios";

export const getPatientData = async () => {
  const res = await api.get("/patients/records");
  return res.data;
}
