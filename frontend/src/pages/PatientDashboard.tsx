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
      <div className="flex items-center justify-center h-screen text-xl font-semibold">
        Loading your records...
      </div>
    );

  if (isError)
    return (
      <div className="flex items-center justify-center h-screen text-red-500 text-xl font-semibold">
        Failed to load records. Please try again later.
      </div>
    );

  if (!data || data.length === 0)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 text-xl font-semibold">
        No medical records found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Your Medical Records
      </h1>

      <div className="grid gap-6">
        {data.map((record: any) => (
          <div
            key={record.id}
            className="bg-white rounded-2xl shadow p-6 border border-gray-100"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">
                Record #{record.id}
              </h2>
              <span className="text-gray-500 text-sm">
                {new Date(record.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="mb-2 text-gray-700">
              <p>
                <span className="font-medium">Doctor:</span>{" "}
                {record.doctor?.name || "N/A"}
              </p>
              <p>
                <span className="font-medium">Diagnosis:</span>{" "}
                {record.patient?.diagnosis || "N/A"}
              </p>
            </div>

            {record.doctorNotes.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Doctor Notes
                </h3>
                <div className="space-y-2">
                  {record.doctorNotes.map((note: any) => (
                    <div
                      key={note.id}
                      className="bg-blue-50 p-3 rounded-lg border border-blue-100"
                    >
                      <p className="text-gray-700">{note.note}</p>
                      <p className="text-sm text-gray-500 mt-1">
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
                <h3 className="font-semibold text-gray-700 mb-2">
                  Medications
                </h3>
                <div className="space-y-3">
                  {record.medications.map((med: any) => (
                    <div
                      key={med.id}
                      className="bg-green-50 p-3 rounded-lg border border-green-100"
                    >
                      <div className="flex justify-between">
                        <p className="text-gray-800 font-medium">{med.name}</p>
                        <p className="text-gray-600 text-sm">
                          {med.dosage} - {med.schedule}
                        </p>
                      </div>

                      {med.nurseChecks.length > 0 && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p className="font-medium mb-1">Nurse Checks:</p>
                          <ul className="list-disc pl-5">
                            {med.nurseChecks.map((check: any) => (
                              <li key={check.id}>
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
  );
}
