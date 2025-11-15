import { useQuery } from "@tanstack/react-query";
import { getDoctorPatients } from "../api/doctor";

export default function PatientList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["doctorPatients"],
    queryFn: getDoctorPatients,
  });

  if (isLoading) return <p>Loading patients...</p>;
  if (error) return <p>Error loading patients</p>;

  const patients = data || [];

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-2">Your Patients</h2>
      {patients.length === 0 ? (
        <p>No patients yet.</p>
      ) : (
        <ul className="space-y-4">
          {patients.map((p: any) => (
            <li
              key={p.id}
              className="p-4 border rounded-lg shadow-sm space-y-2"
            >
              <div>
                <p className="font-semibold text-lg">{p.name}</p>
                <p className="text-sm text-gray-500">{p.email}</p>
                <p className="text-sm">Diagnosis: {p.diagnosis || "N/A"}</p>
              </div>

              {p.patientRecord && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm text-gray-600">
                    Record created:{" "}
                    {new Date(p.patientRecord.createdAt).toLocaleString()}
                  </p>

                  {p.patientRecord.doctorNotes?.length > 0 && (
                    <div>
                      <p className="font-medium">Doctor Notes:</p>
                      <ul className="list-disc ml-6">
                        {p.patientRecord.doctorNotes.map((note: any) => (
                          <li key={note.id} className="text-sm">
                            <strong>{note.doctor.name}:</strong> {note.note}{" "}
                            <span className="text-gray-500 text-xs">
                              ({new Date(note.createdAt).toLocaleDateString()})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {p.patientRecord.medications?.length > 0 && (
                    <div>
                      <p className="font-medium">Medications:</p>
                      <ul className="list-disc ml-6">
                        {p.patientRecord.medications.map((m: any) => (
                          <li key={m.id} className="text-sm">
                            <strong>{m.name}</strong> — {m.dosage}, {m.schedule}
                            {m.nurseChecks?.length > 0 && (
                              <ul className="ml-4 list-disc text-xs text-gray-600">
                                {m.nurseChecks.map((check: any) => (
                                  <li key={check.id}>
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
