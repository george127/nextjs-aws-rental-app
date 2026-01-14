"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Building2,
  CreditCard,
  Wrench,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const tenantSidebarItems = [
  { name: "Dashboard", href: "/tenant/dashboard", icon: Home },
  { name: "My Property", href: "/tenant/property", icon: Building2 },
  { name: "Rent & Payments", href: "/tenant/payments", icon: CreditCard },
  { name: "Maintenance", href: "/tenant/maintenance", icon: Wrench },
  { name: "Notifications", href: "/tenant/notifications", icon: Bell },
];

export default function TenantSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  /* ===================== RESPONSIVE DETECTION ===================== */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsMobileOpen(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ===================== LOGOUT ===================== */
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  };

  const toggleSidebar = () => {
    isMobile ? setIsMobileOpen(!isMobileOpen) : setIsCollapsed(!isCollapsed);
  };

  /* ===================== SIDEBAR CONTENT ===================== */
  const SidebarContent = () => (
    <>
      {/* HEADER */}
      <div
        className={`flex items-center mb-8 ${
          isCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!isCollapsed && (
          <h2 className="text-lg font-semibold tracking-tight">
            Tenant Panel
          </h2>
        )}

        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-muted transition"
        >
          {isMobile ? (
            <X className="w-5 h-5" />
          ) : isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-1">
        {tenantSidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => isMobile && setIsMobileOpen(false)}
              className={`
                group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition
                ${
                  isActive
                    ? "bg-primary text-white shadow"
                    : "text-muted-foreground hover:bg-muted"
                }
              `}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon
                className={`flex-shrink-0 transition-all
                  ${isCollapsed ? "w-4 h-4" : "w-5 h-5"}`}
              />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className={`
          mt-6 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium
          text-red-600 hover:bg-red-50 transition
          ${isCollapsed ? "justify-center" : ""}
        `}
      >
        <LogOut className="w-5 h-5" />
        {!isCollapsed && <span>Logout</span>}
      </button>
    </>
  );

  /* ===================== RENDER ===================== */
  return (
    <>
      {/* MOBILE MENU BUTTON */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-40 p-2 rounded-lg bg-primary text-white md:hidden shadow"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* MOBILE OVERLAY */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* DESKTOP SIDEBAR */}
      <aside
        className={`
          hidden md:flex flex-col
          sticky top-0 h-screen
          border-r bg-background/80 backdrop-blur
          px-4 py-10 transition-all duration-300
          ${isCollapsed ? "w-16" : "w-64"}
        `}
      >
        <SidebarContent />
      </aside>

      {/* MOBILE SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64
          border-r bg-background px-4 py-6
          transition-transform duration-300 md:hidden
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
