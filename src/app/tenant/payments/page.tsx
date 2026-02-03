"use client";

import { useEffect, useState } from "react";
import RentSummary from "./RentSummary";
import PayRentCard from "./PayRentCard";
import PaymentHistory from "./PaymentHistory";

export default function TenantPaymentsPage() {
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tenant/property", {
      credentials: "include", // 🔑 IMPORTANT (cookies)
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Not approved yet");
        }
        return res.json();
      })
      .then((data) => {
        setProperty(data.property);
        setLoading(false);
      })
      .catch(() => {
        setProperty(null);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading rent details...</p>;

  if (!property) {
    return (
      <div className="text-center text-gray-500">
        <p>Your application has not been approved yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold">Rent & Payments</h1>

      <RentSummary
        propertyName={property.name}
        rentAmount={property.rentAmount}
      />

      <PayRentCard />

      <PaymentHistory payments={[]} />
    </div>
  );
}
