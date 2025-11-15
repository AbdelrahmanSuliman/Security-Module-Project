import CreatePatientForm from "../components/CreatePatientForm";
import PatientList from "../components/PatientList";

export default function DoctorDashboard() {
  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Doctor Dashboard
      </h1>
      <CreatePatientForm />
      <PatientList />
    </div>
  );
}
