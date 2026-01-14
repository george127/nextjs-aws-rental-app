import React from "react";
import TenantSidebar from "@/components/tenant/TenantSidebar";
const Tenantlayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      <TenantSidebar />
      <main className="flex-1 p-6 bg-muted/30">{children}</main>
    </div>
  );
};

export default Tenantlayout;
