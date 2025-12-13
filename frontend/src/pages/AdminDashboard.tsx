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
import { LogoutButton } from "../components/LogoutButton";

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
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-[#4B5563] text-lg">Loading admin data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-[#1F2937] mb-8">
          Admin Dashboard
        </h1>
        <LogoutButton />
        <section className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-[#1F2937] mb-6">
            Manage Doctors
          </h2>

          <form
            onSubmit={handleCreateDoctor}
            className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <input
              placeholder="Name"
              value={doctorForm.name}
              onChange={(e) =>
                setDoctorForm({ ...doctorForm, name: e.target.value })
              }
              className="border border-[#D1D5DB] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0096C7] focus:border-transparent text-[#1F2937] placeholder:text-[#4B5563] transition-all"
              required
            />
            <input
              placeholder="Email"
              type="email"
              value={doctorForm.email}
              onChange={(e) =>
                setDoctorForm({ ...doctorForm, email: e.target.value })
              }
              className="border border-[#D1D5DB] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0096C7] focus:border-transparent text-[#1F2937] placeholder:text-[#4B5563] transition-all"
              required
            />
            <input
              placeholder="Password"
              type="password"
              value={doctorForm.password}
              onChange={(e) =>
                setDoctorForm({ ...doctorForm, password: e.target.value })
              }
              className="border border-[#D1D5DB] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0096C7] focus:border-transparent text-[#1F2937] placeholder:text-[#4B5563] transition-all"
              required
            />
            <button
              type="submit"
              className="bg-[#0096C7] hover:bg-[#023E8A] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              disabled={doctorMutation.isPending}
            >
              {doctorMutation.isPending ? "Adding..." : "Add Doctor"}
            </button>
          </form>

          {errorDoctors && (
            <div className="mb-4 p-3 bg-[#E74C3C]/10 border border-[#E74C3C] rounded-lg">
              <p className="text-[#E74C3C] text-sm font-medium">
                Failed to load doctors.
              </p>
            </div>
          )}

          <ul className="space-y-3">
            {doctors.length === 0 ? (
              <li className="text-[#4B5563] text-center py-8">
                No doctors found.
              </li>
            ) : (
              doctors.map((doctor) => (
                <li
                  key={doctor.id}
                  className="flex justify-between items-center border border-[#D1D5DB] p-4 rounded-lg bg-[#F7F9FC] hover:bg-[#E9EEF5] transition-colors"
                >
                  <span className="text-[#1F2937]">
                    <strong className="font-semibold">{doctor.name}</strong>{" "}
                    <span className="text-[#4B5563]">({doctor.email})</span>
                  </span>
                  <button
                    onClick={() => deleteDoctorMutation.mutate(doctor.id)}
                    className="text-[#E74C3C] hover:text-[#C0392B] font-medium px-4 py-2 rounded-lg hover:bg-[#E74C3C]/10 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={deleteDoctorMutation.isPending}
                  >
                    Delete
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-[#1F2937] mb-6">
            Manage Nurses
          </h2>

          <form
            onSubmit={handleCreateNurse}
            className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4"
          >
            <input
              placeholder="Name"
              value={nurseForm.name}
              onChange={(e) =>
                setNurseForm({ ...nurseForm, name: e.target.value })
              }
              className="border border-[#D1D5DB] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0096C7] focus:border-transparent text-[#1F2937] placeholder:text-[#4B5563] transition-all"
              required
            />
            <input
              placeholder="Email"
              type="email"
              value={nurseForm.email}
              onChange={(e) =>
                setNurseForm({ ...nurseForm, email: e.target.value })
              }
              className="border border-[#D1D5DB] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0096C7] focus:border-transparent text-[#1F2937] placeholder:text-[#4B5563] transition-all"
              required
            />
            <input
              placeholder="Password"
              type="password"
              value={nurseForm.password}
              onChange={(e) =>
                setNurseForm({ ...nurseForm, password: e.target.value })
              }
              className="border border-[#D1D5DB] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0096C7] focus:border-transparent text-[#1F2937] placeholder:text-[#4B5563] transition-all"
              required
            />
            <select
              value={nurseForm.doctorId}
              onChange={(e) =>
                setNurseForm({ ...nurseForm, doctorId: e.target.value })
              }
              className="border border-[#D1D5DB] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0096C7] focus:border-transparent text-[#1F2937] bg-white transition-all"
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
              className="bg-[#7DD87D] hover:bg-[#48B7A5] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              disabled={nurseMutation.isPending}
            >
              {nurseMutation.isPending ? "Adding..." : "Add Nurse"}
            </button>
          </form>

          {errorNurses && (
            <div className="mb-4 p-3 bg-[#E74C3C]/10 border border-[#E74C3C] rounded-lg">
              <p className="text-[#E74C3C] text-sm font-medium">
                Failed to load nurses.
              </p>
            </div>
          )}

          <ul className="space-y-3">
            {nurses.length === 0 ? (
              <li className="text-[#4B5563] text-center py-8">
                No nurses found.
              </li>
            ) : (
              nurses.map((nurse) => (
                <li
                  key={nurse.id}
                  className="border border-[#D1D5DB] p-4 rounded-lg bg-[#F7F9FC] hover:bg-[#E9EEF5] transition-colors"
                >
                  <div className="text-[#1F2937]">
                    <strong className="font-semibold">{nurse.name}</strong>{" "}
                    <span className="text-[#4B5563]">({nurse.email})</span>
                    {nurse.doctor && (
                      <p className="text-sm text-[#4B5563] mt-2">
                        Assigned Doctor:{" "}
                        <span className="font-medium">{nurse.doctor.name}</span>{" "}
                        ({nurse.doctor.id})
                      </p>
                    )}
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-[#1F2937] mb-6">
            Audit Logs
          </h2>

          {errorLogs && (
            <div className="mb-4 p-3 bg-[#E74C3C]/10 border border-[#E74C3C] rounded-lg">
              <p className="text-[#E74C3C] text-sm font-medium">
                Failed to load audit logs.
              </p>
            </div>
          )}

          <div className="border border-[#D1D5DB] rounded-lg p-4 max-h-96 overflow-y-auto bg-[#F7F9FC]">
            {auditLogs.length === 0 ? (
              <p className="text-[#4B5563] text-center py-8">
                No audit logs found.
              </p>
            ) : (
              <ul className="space-y-4">
                {auditLogs.map((log) => (
                  <li
                    key={log.id}
                    className="border-b border-[#D1D5DB] pb-4 last:border-b-0 bg-white p-4 rounded-lg"
                  >
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong className="text-[#1F2937]">Action:</strong>{" "}
                        <span className="font-mono text-[#0096C7] bg-[#ADE8F4]/20 px-2 py-1 rounded">
                          {log.action}
                        </span>
                      </p>
                      <p className="text-[#4B5563]">
                        <strong className="text-[#1F2937]">Actor:</strong>{" "}
                        {log.actorId || "N/A"} ({log.actorRole || "N/A"})
                      </p>
                      <p className="text-[#4B5563]">
                        <strong className="text-[#1F2937]">Target:</strong>{" "}
                        {log.targetId || "N/A"} ({log.targetType || "N/A"})
                      </p>
                      <p>
                        <strong className="text-[#1F2937]">Status:</strong>{" "}
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                            log.success
                              ? "bg-[#2ECC71]/10 text-[#2ECC71]"
                              : "bg-[#E74C3C]/10 text-[#E74C3C]"
                          }`}
                        >
                          {log.success ? "✅ Success" : "❌ Failed"}
                        </span>
                      </p>
                      <p className="text-xs text-[#4B5563] mt-2">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              className="px-6 py-2 bg-[#E9EEF5] hover:bg-[#023E8A] hover:text-white text-[#1F2937] rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span className="text-[#4B5563] font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="px-6 py-2 bg-[#E9EEF5] hover:bg-[#023E8A] hover:text-white text-[#1F2937] rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
