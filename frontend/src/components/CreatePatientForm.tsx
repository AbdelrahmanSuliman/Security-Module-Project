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
      className="p-6 md:p-8 border border-[#D1D5DB] rounded-lg shadow-md bg-white space-y-5"
    >
      <h2 className="text-2xl font-semibold text-[#1F2937] mb-6">Create New Patient</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Name"
          className="w-full border border-[#D1D5DB] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0096C7] focus:border-transparent text-[#1F2937] placeholder:text-[#4B5563] transition-all"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border border-[#D1D5DB] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0096C7] focus:border-transparent text-[#1F2937] placeholder:text-[#4B5563] transition-all"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border border-[#D1D5DB] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0096C7] focus:border-transparent text-[#1F2937] placeholder:text-[#4B5563] transition-all"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Diagnosis"
          className="w-full border border-[#D1D5DB] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0096C7] focus:border-transparent text-[#1F2937] placeholder:text-[#4B5563] transition-all"
          value={formData.diagnosis}
          onChange={(e) =>
            setFormData({ ...formData, diagnosis: e.target.value })
          }
        />
      </div>

      <div className="pt-4 border-t border-[#D1D5DB]">
        <h3 className="font-semibold text-[#1F2937] mb-4">Doctor Notes</h3>
        <div className="space-y-3">
          {formData.notes.map((note, idx) => (
            <input
              key={idx}
              type="text"
              placeholder={`Note ${idx + 1}`}
              className="w-full border border-[#D1D5DB] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0096C7] focus:border-transparent text-[#1F2937] placeholder:text-[#4B5563] transition-all"
              value={note}
              onChange={(e) => handleNoteChange(idx, e.target.value)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addNoteField}
          className="text-[#0096C7] hover:text-[#023E8A] text-sm mt-3 font-medium transition-colors duration-200"
        >
          + Add another note
        </button>
      </div>

      <div className="pt-4 border-t border-[#D1D5DB]">
        <h3 className="font-semibold text-[#1F2937] mb-4">Medications</h3>
        <div className="space-y-3">
          {formData.medications.map((med, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Name"
                className="border border-[#D1D5DB] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0096C7] focus:border-transparent text-[#1F2937] placeholder:text-[#4B5563] transition-all"
                value={med.name}
                onChange={(e) =>
                  handleMedicationChange(idx, "name", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Dosage"
                className="border border-[#D1D5DB] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0096C7] focus:border-transparent text-[#1F2937] placeholder:text-[#4B5563] transition-all"
                value={med.dosage}
                onChange={(e) =>
                  handleMedicationChange(idx, "dosage", e.target.value)
                }
              />
              <input
                type="text"
                placeholder="Schedule"
                className="border border-[#D1D5DB] p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0096C7] focus:border-transparent text-[#1F2937] placeholder:text-[#4B5563] transition-all"
                value={med.schedule}
                onChange={(e) =>
                  handleMedicationChange(idx, "schedule", e.target.value)
                }
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addMedicationField}
          className="text-[#0096C7] hover:text-[#023E8A] text-sm mt-3 font-medium transition-colors duration-200"
        >
          + Add another medication
        </button>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="bg-[#0096C7] hover:bg-[#023E8A] text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md w-full md:w-auto"
      >
        {isPending ? "Creating..." : "Create Patient"}
      </button>

      {backendErrors.length > 0 && (
        <div className="mt-5 p-4 bg-[#E74C3C]/10 border border-[#E74C3C] rounded-lg">
          <div className="text-[#E74C3C] text-sm space-y-2">
            {backendErrors.map((err, idx) => (
              <p key={idx}>
                <strong>{err.field}:</strong> {err.message}
              </p>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
