import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Sidebar } from "./components/layout/Sidebar";
import { TopBar } from "./components/layout/TopBar";
import { ToastContainer } from "./components/ui/Toast";
import { LoginPage } from "./pages/LoginPage";
import { TenantRegistrationPage } from "./pages/TenantRegistrationPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AuditLogPage } from "./pages/AuditLogPage";
function AppContent() {
  const { currentUser, currentPage, sessionChecked } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!currentUser) {
    return (
      <>
        {currentPage === "register" ? (
          <TenantRegistrationPage />
        ) : (
          <LoginPage />
        )}
        <ToastContainer />
      </>
    );
  }
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex">
      <Sidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col lg:pl-60 min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {currentPage === "dashboard" && <DashboardPage />}
            {currentPage === "settings" && <SettingsPage />}
            {currentPage === "audit" && <AuditLogPage />}
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}
export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
