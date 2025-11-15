import api from "../lib/axios";

export const getDoctorPatients = async () => {
  const response = await api.get("/doctors/patients");
  console.log(response)
  return response.data.data; 
};

export const createPatient = async (patientData: {
  name: string;
  email: string;
  password: string;
  diagnosis?: string;
}) => {
  const response = await api.post("/doctors/patients", patientData);
  return response.data.data;
};
