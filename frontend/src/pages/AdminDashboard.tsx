import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchDoctors,
  fetchNurses,
  fetchAuditLogs,
  createDoctor,
  createNurse,
  deleteDoctor,
} from "../api/admin";

type Doctor = {
  id: string;
  name: string;
  email: string;
};

type Nurse = {
  id: string;
  name: string;
  email: string;
  doctor?: Doctor;
};

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

export default function AdminDashboard() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const {
    data: doctors = [],
    isLoading: loadingDoctors,
    isError: errorDoctors,
  } = useQuery<Doctor[]>({
    queryKey: ["doctors"],
    staleTime: 1000 * 60,
    queryFn: fetchDoctors,
  });

  const {
    data: nurses = [],
    isLoading: loadingNurses,
    isError: errorNurses,
  } = useQuery<Nurse[]>({
    queryKey: ["nurses"],
    staleTime: 1000 * 60,
    queryFn: fetchNurses,
  });

  const {
    data: auditLogs = [],
    isLoading: loadingLogs,
    isError: errorLogs,
  } = useQuery<AuditLog[]>({
    queryKey: ["auditLogs", page],
    staleTime: 1000 * 60,
    queryFn: () => fetchAuditLogs({ page, limit: 50 }),
  });
  const totalPages = Math.ceil(auditLogs.length / pageSize);

  const doctorMutation = useMutation({
    mutationFn: createDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctors"] });
      setDoctorForm({ name: "", email: "", password: "" });
    },
    onError: (err: any) => {
      if (err.response?.data?.message?.includes("already")) {
        alert("A doctor with this email is already in use.");
      } else {
        alert("Failed to create doctor. Please try again.");
      }
    },
  });
  const nurseMutation = useMutation({
    mutationFn: createNurse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nurses"] }),
    onError: (err: any) => {
      if (err.response?.data?.message?.includes("already")) {
        alert("A nurse with this email is already in use.");
      } else {
        alert("Failed to create nurse. Please try again.");
      }
    },
  });

  const deleteDoctorMutation = useMutation({
    mutationFn: deleteDoctor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["doctors"] }),
  });

  const [doctorForm, setDoctorForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [nurseForm, setNurseForm] = useState({
    name: "",
    email: "",
    password: "",
    doctorId: "",
  });

  const handleCreateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    doctorMutation.mutate(doctorForm);
    setDoctorForm({ name: "", email: "", password: "" });
  };

  const handleCreateNurse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nurseForm.doctorId) {
      alert("Please select a doctor to assign the nurse to.");
      return;
    }
    nurseMutation.mutate(nurseForm);
    setNurseForm({ name: "", email: "", password: "", doctorId: "" });
  };

  if (loadingDoctors || loadingNurses || loadingLogs) {
    return <div>Loading admin data...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <section className="mb-8 p-4 bg-white rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Manage Doctors</h2>

        <form
          onSubmit={handleCreateDoctor}
          className="mb-4 flex flex-wrap gap-2"
        >
          <input
            placeholder="Name"
            value={doctorForm.name}
            onChange={(e) =>
              setDoctorForm({ ...doctorForm, name: e.target.value })
            }
            className="border p-2 rounded grow"
            required
          />
          <input
            placeholder="Email"
            type="email"
            value={doctorForm.email}
            onChange={(e) =>
              setDoctorForm({ ...doctorForm, email: e.target.value })
            }
            className="border p-2 rounded grow"
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={doctorForm.password}
            onChange={(e) =>
              setDoctorForm({ ...doctorForm, password: e.target.value })
            }
            className="border p-2 rounded grow"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            disabled={doctorMutation.isPending}
          >
            {doctorMutation.isPending ? "Adding..." : "Add Doctor"}
          </button>
        </form>

        {errorDoctors && (
          <p className="text-red-500">Failed to load doctors.</p>
        )}

        <ul className="space-y-2">
          {doctors.map((doctor) => (
            <li
              key={doctor.id}
              className="flex justify-between items-center border p-3 rounded bg-gray-50"
            >
              <span>
                <strong>{doctor.name}</strong> ({doctor.email})
              </span>
              <button
                onClick={() => deleteDoctorMutation.mutate(doctor.id)}
                className="text-red-500 hover:text-red-700 font-medium"
                disabled={deleteDoctorMutation.isPending}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8 p-4 bg-white rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Manage Nurses</h2>

        <form
          onSubmit={handleCreateNurse}
          className="mb-4 flex flex-wrap gap-2"
        >
          <input
            placeholder="Name"
            value={nurseForm.name}
            onChange={(e) =>
              setNurseForm({ ...nurseForm, name: e.target.value })
            }
            className="border p-2 rounded grow"
            required
          />
          <input
            placeholder="Email"
            type="email"
            value={nurseForm.email}
            onChange={(e) =>
              setNurseForm({ ...nurseForm, email: e.target.value })
            }
            className="border p-2 rounded grow"
            required
          />
          <input
            placeholder="Password"
            type="password"
            value={nurseForm.password}
            onChange={(e) =>
              setNurseForm({ ...nurseForm, password: e.target.value })
            }
            className="border p-2 rounded grow"
            required
          />
          <select
            value={nurseForm.doctorId}
            onChange={(e) =>
              setNurseForm({ ...nurseForm, doctorId: e.target.value })
            }
            className="border p-2 rounded grow"
            required
          >
            <option value="" disabled>
              -- Assign to Doctor --
            </option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            disabled={nurseMutation.isPending}
          >
            {nurseMutation.isPending ? "Adding..." : "Add Nurse"}
          </button>
        </form>

        {errorNurses && <p className="text-red-500">Failed to load nurses.</p>}

        <ul className="space-y-2">
          {nurses.map((nurse) => (
            <li
              key={nurse.id}
              className="border p-3 rounded bg-gray-50 flex justify-between items-center"
            >
              <div>
                <strong>{nurse.name}</strong> ({nurse.email})
                {nurse.doctor && (
                  <p className="text-sm text-gray-600">
                    Assigned Doctor: {nurse.doctor.name} ({nurse.doctor.id})
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="p-4 bg-white rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Audit Logs</h2>

        {errorLogs && (
          <p className="text-red-500">Failed to load audit logs.</p>
        )}

        <ul className="space-y-3 max-h-96 overflow-y-auto border p-3 rounded">
          {auditLogs.length === 0 && <p>No audit logs found.</p>}
          {auditLogs.map((log) => (
            <li key={log.id} className="border-b pb-2 text-sm">
              <p>
                <strong>Action:</strong>{" "}
                <span className="font-mono text-blue-700">{log.action}</span>
              </p>
              <p>
                <strong>Actor:</strong> {log.actorId || "N/A"} (
                {log.actorRole || "N/A"})
              </p>
              <p>
                <strong>Target:</strong> {log.targetId || "N/A"} (
                {log.targetType || "N/A"})
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {log.success ? "✅ Success" : "❌ Failed"}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(log.timestamp).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
        <div className="flex justify-between mt-4">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
          >
            Next
          </button>
        </div>
      </section>
    </div>
  );
}
