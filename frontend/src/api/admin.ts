import api from "../lib/axios";

export interface User {
  id: string;
  name: string;
  email: string;
}
type AuditLog = {
  id: string;
  action: string;
  actorId?: string;
  actorRole?: string;
  targetId?: string;
  targetType?: string;
  success: boolean;
  timestamp: string; 
};

export const fetchDoctors = async (): Promise<User[]> => {
  const res = await api.get("/admin/doctors");
  return res.data.data ?? [];
};

export const fetchNurses = async () => {
  const res = await api.get("/admin/nurses");
  const nurses = res.data.data ?? [];

  return nurses.map((nurse: any) => ({
    ...nurse,
    doctor: nurse.assignedDoctors?.[0]
      ? { id: nurse.assignedDoctors[0].id, name: nurse.assignedDoctors[0].name }
      : undefined,
  }));
};


export const fetchAuditLogs = async ({
  page = 1,
  limit = 50,
}: {
  page?: number;
  limit?: number;
}) => {
  const res = await api.get("/admin/audit-logs", {
    params: { page, limit },
  });
  return res.data.data as AuditLog[]; 
};

export const createDoctor = async (doctor: {
  name: string;
  email: string;
  password: string;
}): Promise<User> => {
  const res = await api.post("/admin/doctor", doctor);
  return res.data.data;
};

export const createNurse = async (nurse: {
  name: string;
  email: string;
  password: string;
  doctorId: string;
}): Promise<User> => {
  const res = await api.post("/admin/nurse", nurse);
  return res.data.data;
};

export const deleteDoctor = async (id: string): Promise<void> => {
  await api.delete(`/admin/doctor/${id}`);
};
