"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AddPropertyModal from "@/components/manager/AddPropertyModal";
import EditPropertyModal from "@/components/manager/EditPropertyModal";

import {
  MapPin,
  Bed,
  Bath,
  Ruler,
  DollarSign,
  ShieldCheck,
  Home,
  Tag,
  CheckCircle,
} from "lucide-react";

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  rentAmount: number;
  securityDeposit: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet?: number;
  description?: string;
  propertyType: string;
  amenities?: string[];
  imageData?: string;
  status: string;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      const res = await fetch("/api/properties", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch properties");
      setProperties(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this property?")) return;

    try {
      const res = await fetch("/api/properties", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Delete failed");
      fetchProperties();
    } catch (err) {
      console.error(err);
      alert("Failed to delete property");
    }
  };

  const statusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-800";
      case "rented":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Properties</h1>
        <AddPropertyModal />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : properties.length === 0 ? (
        <div className="rounded-lg border p-4 text-muted-foreground">
          No properties added yet.
        </div>
      ) : (
        <div className=" ">
          {properties.map((prop) => (
            <div
              key={prop.id}
              className="flex bg-white rounded-xl overflow-hidden mb-6 shadow-sm"
            >
              {/* IMAGE */}
              <div className="">
                {prop.imageData ? (
                <img
                  src={prop.imageData}
                  alt={prop.name}
                  className="h-full w-100 object-cover rounded-3xl"
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-200 text-gray-500">
                  No Image
                </div>
              )}
              </div>

              {/* BODY */}
              <div className="w-full p-5  space-y-3">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Home className="w-5 h-5 text-blue-500 shadow-sm rounded-full p-1 bg-blue-100" />
                  {prop.name}
                </h2>

                {/* LOCATION */}
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-red-50 rounded-lg px-3 py-1 w-fit shadow-sm hover:shadow-md transition-all cursor-pointer">
                  <MapPin className="w-5 h-5 text-red-500 p-1 bg-red-100 rounded-full shadow" />
                  <span className="font-medium">
                    {prop.address}, {prop.city}, {prop.state} {prop.zipCode}
                  </span>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <span className="flex items-center gap-2 bg-purple-50 rounded-lg px-2 py-1 shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5">
                    <Bed className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">{prop.bedrooms} Beds</span>
                  </span>
                  <span className="flex items-center gap-2 bg-teal-50 rounded-lg px-2 py-1 shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5">
                    <Bath className="w-5 h-5 text-teal-500" />
                    <span className="font-medium">{prop.bathrooms} Baths</span>
                  </span>
                  <span className="flex items-center gap-2 bg-yellow-50 rounded-lg px-2 py-1 shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5">
                    <Ruler className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium">
                      {prop.squareFeet || "-"} sqft
                    </span>
                  </span>
                </div>

                {/* FINANCIALS */}
                <div className="space-y-2 mt-2 text-sm">
                  <p className="flex items-center gap-2 bg-green-50 rounded-lg px-2 py-1 shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <span className="font-medium">
                      Rent: ${prop.rentAmount}
                    </span>
                  </p>
                  <p className="flex items-center gap-2 bg-orange-50 rounded-lg px-2 py-1 shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5">
                    <ShieldCheck className="w-5 h-5 text-orange-500" />
                    <span className="font-medium">
                      Deposit: ${prop.securityDeposit}
                    </span>
                  </p>
                </div>

                {/* TYPE & STATUS */}
                <div className="flex justify-between items-center mt-2 text-sm">
                  <span className="flex items-center gap-2 bg-indigo-50 rounded-lg px-2 py-1 shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5">
                    <Tag className="w-5 h-5 text-indigo-500" />
                    <span className="font-medium">{prop.propertyType}</span>
                  </span>
                  <span
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${statusColor(
                      prop.status
                    )} hover:scale-105 transition-transform`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {prop.status}
                  </span>
                </div>

                {/* DESCRIPTION */}
                {prop.description && (
                  <p className="font-medium text-gray-500 mt-2 line-clamp-3">
                    {prop.description}
                  </p>
                )}

                {/* AMENITIES */}
                {prop.amenities && prop.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {prop.amenities.map((a, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 text-indigo-800 px-3 py-1 text-xs font-medium shadow-sm hover:scale-110 transform transition"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                )}

                {/* ACTIONS */}
                <div className="flex gap-2 pt-3">
                  <EditPropertyModal
                    property={prop}
                    onUpdated={fetchProperties}
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="hover:scale-105 transition"
                    onClick={() => handleDelete(prop.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
