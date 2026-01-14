// src/app/manager/layout.tsx
import React from "react";
import ManagerSidebar from "@/components/manager/ManagerSidebar";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar with logout */}
      <ManagerSidebar />
      {/* Main content */}
      <main className="flex-1 p-6 bg-muted/30">
        {children}
      </main>
    </div>
  );
}
