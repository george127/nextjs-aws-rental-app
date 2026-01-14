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

interface Props {
  property: any;
  onUpdated: () => void;
}

export default function EditPropertyModal({ property, onUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [imageData, setImageData] = useState<string | null>(property.imageData);

  const [form, setForm] = useState({
    name: property.name,
    address: property.address,
    city: property.city,
    state: property.state,
    zipCode: property.zipCode,
    rentAmount: property.rentAmount,
    securityDeposit: property.securityDeposit,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    squareFeet: property.squareFeet || "",
    description: property.description || "",
    propertyType: property.propertyType,
    amenities: property.amenities?.join(", ") || "",
    status: property.status,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImageData(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/properties", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          id: property.id,
          ...form,
          amenities: form.amenities
            .split(",")
            .map((a: string) => a.trim()),
          imageData,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      onUpdated();
    } catch (err) {
      console.error(err);
      alert("Failed to update property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Edit</Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg h-[96vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Input name="name" value={form.name} onChange={handleChange} />
          <Input name="address" value={form.address} onChange={handleChange} />

          <div className="flex gap-2">
            <Input name="city" value={form.city} onChange={handleChange} />
            <Input name="state" value={form.state} onChange={handleChange} />
            <Input name="zipCode" value={form.zipCode} onChange={handleChange} />
          </div>

          <div className="flex gap-2">
            <Input name="rentAmount" type="number" value={form.rentAmount} onChange={handleChange} />
            <Input name="securityDeposit" type="number" value={form.securityDeposit} onChange={handleChange} />
          </div>

          <div className="flex gap-2">
            <Input name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} />
            <Input name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} />
            <Input name="squareFeet" type="number" value={form.squareFeet} onChange={handleChange} />
          </div>

          <Input name="propertyType" value={form.propertyType} onChange={handleChange} />
          <Textarea name="description" value={form.description} onChange={handleChange} />
          <Input name="amenities" value={form.amenities} onChange={handleChange} />

          <Input type="file" accept="image/*" onChange={handleImageUpload} />

          {imageData && (
            <img src={imageData} className="w-full max-w-sm rounded" />
          )}

          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Update Property"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}