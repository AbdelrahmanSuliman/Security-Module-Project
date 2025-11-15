import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPatient } from "../api/doctor";
import { useState } from "react";

export default function CreatePatientForm() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    diagnosis: "",
    notes: [""],
    medications: [{ name: "", dosage: "", schedule: "" }],
  });
  const [backendErrors, setBackendErrors] = useState<
    { field: string; message: string }[]
  >([]);

  const { mutate, isPending } = useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doctorPatients"] });
      setFormData({
        name: "",
        email: "",
        password: "",
        diagnosis: "",
        notes: [""],
        medications: [{ name: "", dosage: "", schedule: "" }],
      });
      setBackendErrors([]);
    },
    onError: (error: any) => {
      const errors = error.response?.data?.errors;
      if (Array.isArray(errors)) {
        setBackendErrors(errors);
      } else {
        setBackendErrors([
          {
            field: "general",
            message: error.response?.data?.message || "Error creating patient",
          },
        ]);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBackendErrors([]);

    const formattedData = {
      ...formData,
      notes: formData.notes
        .filter((note) => note.trim() !== "")
        .map((note) => ({ note })),
      medications: formData.medications.filter(
        (med) => med.name || med.dosage || med.schedule
      ),
    };

    mutate(formattedData);
  };

  const handleNoteChange = (index: number, value: string) => {
    const updatedNotes = [...formData.notes];
    updatedNotes[index] = value;
    setFormData({ ...formData, notes: updatedNotes });
  };

  const addNoteField = () =>
    setFormData({ ...formData, notes: [...formData.notes, ""] });

  const handleMedicationChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedMedications = [...formData.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value,
    };
    setFormData({ ...formData, medications: updatedMedications });
  };

  const addMedicationField = () =>
    setFormData({
      ...formData,
      medications: [
        ...formData.medications,
        { name: "", dosage: "", schedule: "" },
      ],
    });

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border rounded-lg shadow-md space-y-3"
    >
      <h2 className="text-xl font-semibold">Create New Patient</h2>

      <input
        type="text"
        placeholder="Name"
        className="w-full border p-2 rounded"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <input
        type="email"
        placeholder="Email"
        className="w-full border p-2 rounded"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full border p-2 rounded"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />
      <input
        type="text"
        placeholder="Diagnosis (optional)"
        className="w-full border p-2 rounded"
        value={formData.diagnosis}
        onChange={(e) =>
          setFormData({ ...formData, diagnosis: e.target.value })
        }
      />

      <div>
        <h3 className="font-medium mt-3">Doctor Notes</h3>
        {formData.notes.map((note, idx) => (
          <input
            key={idx}
            type="text"
            placeholder={`Note ${idx + 1}`}
            className="w-full border p-2 rounded mt-2"
            value={note}
            onChange={(e) => handleNoteChange(idx, e.target.value)}
          />
        ))}
        <button
          type="button"
          onClick={addNoteField}
          className="text-blue-600 text-sm mt-1 hover:underline"
        >
          + Add another note
        </button>
      </div>

      <div>
        <h3 className="font-medium mt-3">Medications</h3>
        {formData.medications.map((med, idx) => (
          <div key={idx} className="grid grid-cols-3 gap-2 mt-2">
            <input
              type="text"
              placeholder="Name"
              className="border p-2 rounded"
              value={med.name}
              onChange={(e) =>
                handleMedicationChange(idx, "name", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Dosage"
              className="border p-2 rounded"
              value={med.dosage}
              onChange={(e) =>
                handleMedicationChange(idx, "dosage", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Schedule"
              className="border p-2 rounded"
              value={med.schedule}
              onChange={(e) =>
                handleMedicationChange(idx, "schedule", e.target.value)
              }
            />
          </div>
        ))}
        <button
          type="button"
          onClick={addMedicationField}
          className="text-blue-600 text-sm mt-1 hover:underline"
        >
          + Add another medication
        </button>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {isPending ? "Creating..." : "Create Patient"}
      </button>

      {backendErrors.length > 0 && (
        <div className="mt-3 text-red-500 text-sm space-y-1">
          {backendErrors.map((err, idx) => (
            <p key={idx}>
              <strong>{err.field}:</strong> {err.message}
            </p>
          ))}
        </div>
      )}
    </form>
  );
}
