import React from "react";
import { useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const role = localStorage.getItem("role") || "USER";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[#F7F9FC]">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-[#023E8A] text-white shadow-lg">
        <div className="h-16 flex items-center justify-center text-2xl font-bold bg-[#0096C7]">
          HealthCureAlpha
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2">
          {/* Navigation items can be dynamically rendered based on role */}
          <a
            href="#"
            className="flex items-center px-4 py-2 rounded-lg hover:bg-[#0096C7] transition-colors duration-200"
          >
            Dashboard
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-2 rounded-lg hover:bg-[#0096C7] transition-colors duration-200"
          >
            Patients
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-2 rounded-lg hover:bg-[#0096C7] transition-colors duration-200"
          >
            Settings
          </a>
        </nav>
        <div className="p-4 border-t border-[#0096C7] bg-[#023E8A]">
          <p className="text-center text-sm text-[#ADE8F4]">Logged in as:</p>
          <p className="text-center font-bold text-white">{role.toUpperCase()}</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 md:px-8 border-b border-[#D1D5DB]">
          <h1 className="text-2xl font-bold text-[#1F2937]">{title}</h1>
          <button
            onClick={handleLogout}
            className="bg-[#0096C7] hover:bg-[#023E8A] text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
          >
            Logout
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
