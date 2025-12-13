import { useQuery } from "@tanstack/react-query";
import { getDoctorPatients } from "../api/doctor";

export default function PatientList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["doctorPatients"],
    queryFn: getDoctorPatients,
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <p className="text-[#4B5563]">Loading patients...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="p-3 bg-[#E74C3C]/10 border border-[#E74C3C] rounded-lg">
          <p className="text-[#E74C3C] font-medium">Error loading patients</p>
        </div>
      </div>
    );
  }

  const patients = data || [];

  return (
    <div className="mt-6">
      <h2 className="text-2xl font-semibold text-[#1F2937] mb-6">Your Patients</h2>
      {patients.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-[#4B5563] text-lg">No patients yet.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {patients.map((p: any) => (
            <li
              key={p.id}
              className="p-6 border border-[#D1D5DB] rounded-lg shadow-md bg-white hover:shadow-lg transition-shadow space-y-3"
            >
              <div className="pb-4 border-b border-[#D1D5DB]">
                <p className="font-semibold text-xl text-[#1F2937]">{p.name}</p>
                <p className="text-sm text-[#4B5563] mt-1">{p.email}</p>
                <p className="text-sm text-[#1F2937] mt-2">
                  <span className="font-medium">Diagnosis:</span> <span className="text-[#4B5563]">{p.diagnosis || "N/A"}</span>
                </p>
              </div>

              {p.patientRecord && (
                <div className="mt-4 space-y-4">
                  <p className="text-sm text-[#4B5563]">
                    <span className="font-medium text-[#1F2937]">Record created:</span>{" "}
                    {new Date(p.patientRecord.createdAt).toLocaleString()}
                  </p>

                  {p.patientRecord.doctorNotes?.length > 0 && (
                    <div>
                      <p className="font-semibold text-[#1F2937] mb-3">Doctor Notes:</p>
                      <ul className="space-y-2">
                        {p.patientRecord.doctorNotes.map((note: any) => (
                          <li key={note.id} className="bg-[#ADE8F4]/20 p-3 rounded-lg border border-[#ADE8F4]">
                            <p className="text-sm text-[#1F2937]">
                              <strong className="font-semibold">{note.doctor.name}:</strong> {note.note}{" "}
                              <span className="text-[#4B5563] text-xs">
                                ({new Date(note.createdAt).toLocaleDateString()})
                              </span>
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {p.patientRecord.medications?.length > 0 && (
                    <div>
                      <p className="font-semibold text-[#1F2937] mb-3">Medications:</p>
                      <ul className="space-y-2">
                        {p.patientRecord.medications.map((m: any) => (
                          <li key={m.id} className="bg-[#7DD87D]/20 p-3 rounded-lg border border-[#7DD87D]">
                            <p className="text-sm text-[#1F2937]">
                              <strong className="font-semibold">{m.name}</strong> — {m.dosage}, {m.schedule}
                            </p>
                            {m.nurseChecks?.length > 0 && (
                              <ul className="ml-4 mt-2 space-y-1">
                                {m.nurseChecks.map((check: any) => (
                                  <li key={check.id} className="text-xs text-[#4B5563]">
                                    Checked by {check.nurse.name} on{" "}
                                    {new Date(
                                      check.checkedAt
                                    ).toLocaleDateString()}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
