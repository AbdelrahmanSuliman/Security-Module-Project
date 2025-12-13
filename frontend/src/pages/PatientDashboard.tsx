import { useQuery } from "@tanstack/react-query";
import { getPatientData } from "../api/patient";

export default function PatientDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["patientRecords"],
    queryFn: async () => {
      const res = await getPatientData();
      return res.data;
    },
  });

  if (isLoading)
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-[#4B5563] text-xl font-semibold">Loading your records...</p>
        </div>
      </div>
    );

  if (isError)
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="p-3 bg-[#E74C3C]/10 border border-[#E74C3C] rounded-lg">
            <p className="text-[#E74C3C] text-xl font-semibold">Failed to load records. Please try again later.</p>
          </div>
        </div>
      </div>
    );

  if (!data || data.length === 0)
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-[#4B5563] text-xl font-semibold">No medical records found.</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-[#1F2937]">
          Your Medical Records
        </h1>

        <div className="grid gap-6">
          {data.map((record: any) => (
            <div
              key={record.id}
              className="bg-white rounded-lg shadow-md p-6 md:p-8 border border-[#D1D5DB] hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#D1D5DB]">
                <h2 className="text-2xl font-semibold text-[#1F2937]">
                  Record #{record.id}
                </h2>
                <span className="text-[#4B5563] text-sm font-medium">
                  {new Date(record.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="mb-6 space-y-2 text-[#1F2937]">
                <p>
                  <span className="font-semibold">Doctor:</span>{" "}
                  <span className="text-[#4B5563]">{record.doctor?.name || "N/A"}</span>
                </p>
                <p>
                  <span className="font-semibold">Diagnosis:</span>{" "}
                  <span className="text-[#4B5563]">{record.patient?.diagnosis || "N/A"}</span>
                </p>
              </div>

              {record.doctorNotes.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-[#1F2937] mb-4">
                    Doctor Notes
                  </h3>
                  <div className="space-y-3">
                    {record.doctorNotes.map((note: any) => (
                      <div
                        key={note.id}
                        className="bg-[#ADE8F4]/20 p-4 rounded-lg border border-[#ADE8F4]"
                      >
                        <p className="text-[#1F2937] mb-2">{note.note}</p>
                        <p className="text-sm text-[#4B5563]">
                          — Dr. {note.doctor.name},{" "}
                          {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {record.medications.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[#1F2937] mb-4">
                    Medications
                  </h3>
                  <div className="space-y-3">
                    {record.medications.map((med: any) => (
                      <div
                        key={med.id}
                        className="bg-[#7DD87D]/20 p-4 rounded-lg border border-[#7DD87D]"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-[#1F2937] font-semibold">{med.name}</p>
                          <p className="text-[#4B5563] text-sm">
                            {med.dosage} - {med.schedule}
                          </p>
                        </div>

                        {med.nurseChecks.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-[#7DD87D]">
                            <p className="font-medium text-[#1F2937] mb-2 text-sm">Nurse Checks:</p>
                            <ul className="space-y-1">
                              {med.nurseChecks.map((check: any) => (
                                <li key={check.id} className="text-sm text-[#4B5563]">
                                  {check.nurse.name} checked at{" "}
                                  {new Date(check.checkedAt).toLocaleTimeString()}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
