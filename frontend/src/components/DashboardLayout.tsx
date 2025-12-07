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
    <div className="flex h-screen bg-neutral-background">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col bg-primary-dark-blue text-white">
        <div className="h-16 flex items-center justify-center text-2xl font-bold">
          HealthCureAlpha
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2">
          {/* Navigation items can be dynamically rendered based on role */}
          <a
            href="#"
            className="flex items-center px-4 py-2 rounded-md hover:bg-primary-blue"
          >
            Dashboard
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-2 rounded-md hover:bg-primary-blue"
          >
            Patients
          </a>
          <a
            href="#"
            className="flex items-center px-4 py-2 rounded-md hover:bg-primary-blue"
          >
            Settings
          </a>
        </nav>
        <div className="p-4 border-t border-primary-blue">
          <p className="text-center text-sm">Logged in as:</p>
          <p className="text-center font-bold">{role.toUpperCase()}</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-neutral-white shadow-sm flex items-center justify-between px-8">
          <h1 className="text-2xl font-bold text-neutral-text-dark">{title}</h1>
          <button
            onClick={handleLogout}
            className="bg-primary-blue text-white px-4 py-2 rounded-md hover:bg-primary-dark-blue transition-colors"
          >
            Logout
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
