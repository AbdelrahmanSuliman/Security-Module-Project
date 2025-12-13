import { useQuery } from "@tanstack/react-query";
import { getAssignedPatients } from "../api/nurse";
import { LogoutButton } from "../components/LogoutButton";

export function NurseDashboard() {
  const { data: patients, isLoading, isError } = useQuery({
    queryKey: ["assignedPatients"],
    queryFn: getAssignedPatients,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-[#4B5563] text-lg">Loading assigned patients...</p>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="p-3 bg-[#E74C3C]/10 border border-[#E74C3C] rounded-lg">
            <p className="text-[#E74C3C] text-lg font-medium">Failed to load patients.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-[#1F2937] mb-8">Nurse Dashboard</h1>
        <LogoutButton/>
        {patients.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-[#4B5563] text-lg">No assigned patients.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {patients.map((p: any) => (
              <div
                key={p.recordId}
                className="border border-[#D1D5DB] p-6 rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow"
              >
                <div className="space-y-3 mb-4">
                  <p className="text-[#1F2937]">
                    <strong className="font-semibold">Patient:</strong> <span className="text-[#4B5563]">{p.patientName}</span>
                  </p>
                  <p className="text-[#1F2937]">
                    <strong className="font-semibold">Email:</strong> <span className="text-[#4B5563]">{p.patientEmail}</span>
                  </p>
                  <p className="text-[#1F2937]">
                    <strong className="font-semibold">Diagnosis:</strong> <span className="text-[#4B5563]">{p.diagnosis || "N/A"}</span>
                  </p>
                  <p className="text-[#1F2937]">
                    <strong className="font-semibold">Doctor:</strong> <span className="text-[#4B5563]">{p.doctorName}</span>
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-[#D1D5DB]">
                  <p className="font-semibold text-[#1F2937] mb-3">Medications:</p>
                  {p.medications.length > 0 ? (
                    <ul className="space-y-2">
                      {p.medications.map((m: any) => (
                        <li key={m.id} className="bg-[#ADE8F4]/20 p-3 rounded-lg border border-[#ADE8F4] text-[#1F2937]">
                          <span className="font-medium">{m.name}</span> - {m.dosage} <span className="text-[#4B5563]">({m.schedule})</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="italic text-[#4B5563] bg-[#E9EEF5] p-3 rounded-lg">
                      No medications assigned for this patient.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default NurseDashboard;
