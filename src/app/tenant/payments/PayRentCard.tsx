"use client";

import { useState } from "react";

export default function PayRentCard() {
  const [loading, setLoading] = useState(false);

  const handlePayRent = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        credentials: "include", // 🔑 cookie auth
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Payment initiation failed");
      }

      const data = await res.json();

      // Redirect to Stripe / Paystack
      window.location.href = data.paymentUrl;
    } catch (error) {
      alert("Unable to start payment. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border p-5 shadow-sm bg-white">
      <h2 className="text-lg font-semibold">Pay Rent</h2>

      <p className="text-sm text-gray-600 mt-1">
        Click below to pay your monthly rent securely.
      </p>

      <button
        onClick={handlePayRent}
        disabled={loading}
        className="mt-4 w-full rounded-lg bg-black text-white py-2 hover:bg-gray-800 disabled:opacity-50"
      >
        {loading ? "Redirecting..." : "Pay Rent"}
      </button>
    </div>
  );
}
