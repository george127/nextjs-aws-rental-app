"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ApplyPropertyPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((res) => res.json())
      .then(setProperty);
  }, [id]);

  if (!property) return <p>Loading...</p>;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">
        Apply for {property.name}
      </h1>

      <form className="space-y-4">
        <Input placeholder="Full Name" required />
        <Input type="email" placeholder="Email Address" required />
        <Input placeholder="Phone Number" />
        <Textarea
          placeholder="Tell the manager about yourself..."
          rows={5}
        />

        <Button size="lg" className="w-full">
          Submit Application
        </Button>
      </form>

      <p className="text-xs text-muted-foreground text-center">
        Your details will be sent to the property manager.
      </p>
    </div>
  );
}
