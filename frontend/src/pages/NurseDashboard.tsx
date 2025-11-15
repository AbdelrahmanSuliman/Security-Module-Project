import { useQuery } from "@tanstack/react-query";
import { getAssignedPatients } from "../api/nurse";

export function NurseDashboard() {
  const { data: patients, isLoading, isError } = useQuery({
    queryKey: ["assignedPatients"],
    queryFn: getAssignedPatients,
  });

  if (isLoading) return <div>Loading assigned patients...</div>;
  if (isError) return <div>Failed to load patients.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Nurse Dashboard</h1>

      {patients.length === 0 ? (
        <p>No assigned patients.</p>
      ) : (
        <div className="grid gap-4">
          {patients.map((p: any) => (
            <div
              key={p.recordId}
              className="border p-4 rounded-lg shadow-sm bg-white"
            >
              <p>
                <strong>Patient:</strong> {p.patientName}
              </p>
              <p>
                <strong>Email:</strong> {p.patientEmail}
              </p>
              <p>
                <strong>Diagnosis:</strong> {p.diagnosis}
              </p>
              <p>
                <strong>Doctor:</strong> {p.doctorName}
              </p>

              <div className="mt-2">
                <p className="font-semibold">Medications:</p>
                {p.medications.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {p.medications.map((m: any) => (
                      <li key={m.id}>
                        {m.name} - {m.dosage} ({m.schedule})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="italic text-gray-500">
                    No medications assigned for this patient.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NurseDashboard;
