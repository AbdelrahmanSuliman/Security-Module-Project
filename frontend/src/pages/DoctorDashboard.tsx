import CreatePatientForm from "../components/CreatePatientForm";
import PatientList from "../components/PatientList";

export default function DoctorDashboard() {
  return (
    <div className="min-h-screen bg-[#F7F9FC] p-6 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-[#1F2937] mb-8 text-center">
          Doctor Dashboard
        </h1>
        <CreatePatientForm />
        <PatientList />
      </div>
    </div>
  );
}
