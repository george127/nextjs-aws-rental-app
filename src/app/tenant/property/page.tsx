"use client";

import { useEffect, useState } from "react";
import { 
  Home, MapPin, DollarSign, Shield, Bed, Bath, 
  Square, Building, CheckCircle, Wifi, Car, 
  Dumbbell, Coffee, Wind, Loader2
} from "lucide-react";

export default function MyPropertyPage() {
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tenant/property", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setProperty(data.property);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  );

  if (!property)
    return (
      <div className="text-center py-12">
        <div className="inline-block p-4 bg-blue-50 rounded-full mb-4">
          <Home className="h-12 w-12 text-blue-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-700">Application Pending</h3>
        <p className="text-gray-500 mt-2">Your property application is awaiting approval.</p>
      </div>
    );

  // Safely parse amenities - handle different formats
  const getAmenitiesList = () => {
    if (!property.amenities) return [];
    
    if (Array.isArray(property.amenities)) {
      return property.amenities;
    }
    
    if (typeof property.amenities === 'string') {
      return property.amenities.split(",").map((a: string) => a.trim());
    }
    
    return [];
  };

  const amenitiesList = getAmenitiesList();

  // Common amenities icons mapping
  const amenityIcons: Record<string, any> = {
    "wifi": Wifi,
    "parking": Car,
    "gym": Dumbbell,
    "pool": Coffee,
    "ac": Wind,
    "furnished": Home,
    "laundry": Coffee,
    "kitchen": Coffee,
    "balcony": Wind,
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Hero Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
          <Home className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Home</h1>
          <p className="text-gray-500">Your rented property details</p>
        </div>
      </div>

      {/* Property Card */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Property Image */}
        {property.imageData && (
          <div className="relative h-72 md:h-80">
            <img
              src={property.imageData}
              alt={property.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${property.status === "occupied" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                {property.status?.toUpperCase() || "VACANT"}
              </span>
            </div>
          </div>
        )}

        <div className="p-6 md:p-8">
          {/* Property Title & Address */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{property.name}</h2>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-5 w-5 mr-2 flex-shrink-0" />
              <span>{property.address}, {property.city}, {property.state} {property.zipCode}</span>
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <p className="text-gray-700 mb-8 bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
              {property.description}
            </p>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard 
              icon={DollarSign} 
              label="Monthly Rent" 
              value={`$${property.rentAmount || 0}`}
              color="text-green-600"
            />
            <StatCard 
              icon={Shield} 
              label="Deposit" 
              value={`$${property.securityDeposit || 0}`}
              color="text-amber-600"
            />
            <StatCard 
              icon={Bed} 
              label="Bedrooms" 
              value={property.bedrooms || 0}
              color="text-blue-600"
            />
            <StatCard 
              icon={Bath} 
              label="Bathrooms" 
              value={property.bathrooms || 0}
              color="text-purple-600"
            />
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <DetailItem 
              icon={Square} 
              label="Square Feet" 
              value={property.squareFeet || "N/A"}
            />
            <DetailItem 
              icon={Building} 
              label="Property Type" 
              value={property.propertyType || "N/A"}
            />
          </div>

          {/* Amenities Section */}
          {amenitiesList.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                Amenities Included
              </h3>
              <div className="flex flex-wrap gap-3">
                {amenitiesList.map((amenity: string, index: number) => {
                  const amenityKey = amenity.toLowerCase();
                  const Icon = amenityIcons[amenityKey] || Coffee;
                  return (
                    <div 
                      key={index} 
                      className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border"
                    >
                      <Icon className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium capitalize">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

// Reusable Detail Item Component
function DetailItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-gray-500" />
        <span className="text-gray-700">{label}</span>
      </div>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}