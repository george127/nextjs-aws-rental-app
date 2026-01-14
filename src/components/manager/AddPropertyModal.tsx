"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AddPropertyModal() {
  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    rentAmount: "",
    securityDeposit: "",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    description: "",
    propertyType: "",
    amenities: "", // comma separated
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Convert image to Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageData(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload = {
        name: form.name,
        address: form.address,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        rentAmount: Number(form.rentAmount),
        securityDeposit: Number(form.securityDeposit),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        squareFeet: form.squareFeet
          ? Number(form.squareFeet)
          : undefined,
        description: form.description || undefined,
        propertyType: form.propertyType,
        amenities: form.amenities
          ? form.amenities.split(",").map((a) => a.trim())
          : [],
        imageData,
      };

      const res = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // ✅ sends HTTP-only JWT cookie
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to add property");
        return;
      }

      alert("Property added successfully!");
      location.reload();
    } catch (error) {
      console.error(error);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Property</Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[93vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
        </DialogHeader>

<div className="flex flex-col gap-6">

  {/* Property Basic Info */}
  <div className="flex flex-col gap-3">

    <Input
      name="name"
      placeholder="Property Name"
      onChange={handleChange}
    />

    <Input
      name="address"
      placeholder="Street Address"
      onChange={handleChange}
    />

    <div className="flex flex-col md:flex-row gap-3">
      <Input
        name="city"
        placeholder="City"
        onChange={handleChange}
      />
      <Input
        name="state"
        placeholder="State"
        onChange={handleChange}
      />
      <Input
        name="zipCode"
        placeholder="Zip Code"
        onChange={handleChange}
      />
    </div>
  </div>

  {/* Pricing */}
  <div className="flex flex-col gap-3">
    <h3 className="text-lg font-semibold">Pricing</h3>

    <div className="flex flex-col md:flex-row gap-3">
      <Input
        name="rentAmount"
        placeholder="Rent Amount"
        type="number"
        onChange={handleChange}
      />

      <Input
        name="securityDeposit"
        placeholder="Security Deposit"
        type="number"
        onChange={handleChange}
      />
    </div>
  </div>

  {/* Property Details */}
  <div className="flex flex-col gap-3">
    <h3 className="text-lg font-semibold">Property Details</h3>

    <div className="flex flex-col md:flex-row gap-3">
      <Input
        name="bedrooms"
        placeholder="Bedrooms"
        type="number"
        onChange={handleChange}
      />

      <Input
        name="bathrooms"
        placeholder="Bathrooms"
        type="number"
        onChange={handleChange}
      />

      <Input
        name="squareFeet"
        placeholder="Square Feet"
        type="number"
        onChange={handleChange}
      />
    </div>

    <Input
      name="propertyType"
      placeholder="Property Type (Apartment, House, Condo)"
      onChange={handleChange}
    />
  </div>

  {/* Description & Amenities */}
  <div className="flex flex-col gap-3">
    <h3 className="text-lg font-semibold">Additional Details</h3>

    <Textarea
      name="description"
      placeholder="Property description"
      className="min-h-[100px]"
      onChange={handleChange}
    />

    <Input
      name="amenities"
      placeholder="Amenities (Parking, Pool, Gym)"
      onChange={handleChange}
    />
  </div>

  {/* Image Upload */}
  <div className="flex flex-col gap-2">
    <h3 className="text-lg font-semibold">Property Image</h3>

    <Input
      type="file"
      accept="image/*"
      onChange={handleImageUpload}
    />
  </div>

  {/* Action Button */}
  <Button
    onClick={handleSubmit}
    disabled={loading}
    className="w-full md:w-fit self-end"
  >
    {loading ? "Saving..." : "Save Property"}
  </Button>

</div>

      </DialogContent>
    </Dialog>
  );
}
