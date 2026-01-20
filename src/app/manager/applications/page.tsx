"use client";

import { useEffect, useState } from "react";
import Mail from "lucide-react/dist/esm/icons/mail";
import Phone from "lucide-react/dist/esm/icons/phone";
import Home from "lucide-react/dist/esm/icons/home";
import MapPin from "lucide-react/dist/esm/icons/map-pin";
import MessageSquare from "lucide-react/dist/esm/icons/message-square";
import User from "lucide-react/dist/esm/icons/user";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import XCircle from "lucide-react/dist/esm/icons/x-circle";
import Clock from "lucide-react/dist/esm/icons/clock";

type Application = {
  id: string;
  tenantName: string;
  email: string;
  phone?: string;
  message?: string;
  status: string;
  property: {
    name: string;
    address: string;
    imageData?: string;
    imageUrl?: string;
  };
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/manager/applications")
      .then((res) => res.json())
      .then((data) => {
        setApplications(data.applications);
        setLoading(false);
      });
  }, []);

const updateStatus = async (id: string, status: "approved" | "rejected") => {
  const res = await fetch(`/api/manager/applications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    alert("Failed to update application status");
    return;
  }

  const data = await res.json();

  setApplications((prev) =>
    prev.map((app) =>
      app.id === id ? { ...app, status: data.application.status } : app
    )
  );
};


  if (loading) return <p>Loading applications...</p>;

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {applications.map((app) => (
        <div
          key={app.id}
          className="group overflow-hidden rounded-2xl border bg-white shadow-lg hover:shadow-2xl transition-transform duration-300 hover:-translate-y-1"
        >
          {/* PROPERTY IMAGE WITH OVERLAY STATUS */}
          {(app.property.imageUrl || app.property.imageData) && (
            <div className="relative h-44 w-full overflow-hidden">
              <img
                src={app.property.imageUrl ?? app.property.imageData}
                alt={app.property.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span
                className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full text-white
              ${
                app.status === "pending"
                  ? "bg-yellow-500"
                  : app.status === "approved"
                  ? "bg-green-600"
                  : "bg-red-600"
              }
            `}
              >
                {app.status}
              </span>
            </div>
          )}

          {/* CARD CONTENT */}
          <div className="p-5 space-y-4">
            {/* TENANT INFO */}
            <div className="flex flex-col gap-1">
              <h5 className="text-lg font-semibold flex items-center gap-3 p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all duration-200 shadow-sm">
                <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full">
                  <User className="w-4 h-4" />
                </span>
                {app.tenantName}
              </h5>

              <p className="flex items-center gap-3 text-gray-700 text-sm bg-gray-50 px-3 py-1 rounded-lg shadow-sm hover:bg-gray-100 transition-all duration-200">
                <Mail className="w-4 h-4 text-blue-500" />
                {app.email}
              </p>

              {app.phone && (
                <p className="flex items-center gap-3 text-gray-700 text-sm bg-gray-50 px-3 py-1 rounded-lg shadow-sm hover:bg-gray-100 transition-all duration-200">
                  <Phone className="w-4 h-4 text-green-500" />
                  {app.phone}
                </p>
              )}
            </div>

            {/* PROPERTY INFO */}
            <div className="rounded-xl bg-gray-50 p-4 shadow-md flex flex-col gap-2 hover:shadow-lg transition-all duration-300">
              <p className="flex items-center gap-3 font-semibold text-gray-800">
                <span className="flex items-center justify-center w-6 h-6 bg-green-500 text-white rounded-full">
                  <Home className="w-3 h-3" />
                </span>
                {app.property.name}
              </p>
              <p className="flex items-center gap-3 text-gray-600 text-sm">
                <span className="flex items-center justify-center w-6 h-6 bg-red-400 text-white rounded-full">
                  <MapPin className="w-3 h-3" />
                </span>
                {app.property.address}
              </p>
            </div>

            {/* MESSAGE */}
            <div className="flex items-start gap-3 text-gray-700 bg-gray-50 p-4 rounded-xl shadow-inner border border-gray-200 transition hover:shadow-md">
              <span className="flex items-center justify-center w-7 h-7 bg-blue-200 text-blue-600 rounded-full">
                <MessageSquare className="w-4 h-4" />
              </span>
              <p className="text-sm">{app.message || "No message provided"}</p>
            </div>

            {/* ACTIONS */}
            {app.status === "pending" && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => updateStatus(app.id, "approved")}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-green-700 transition-all duration-200 transform hover:scale-105"
                >
                  <CheckCircle className="w-4 h-4 text-white" />
                  Approve
                </button>

                <button
                  onClick={() => updateStatus(app.id, "rejected")}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-red-600 px-4 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-50 transition-all duration-200 transform hover:scale-105"
                >
                  <XCircle className="w-4 h-4 text-red-600" />
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
