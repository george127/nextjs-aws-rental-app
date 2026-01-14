"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin,
  Bed,
  Bath,
  Ruler,
  DollarSign,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* =========================
   MOTION VARIANTS
========================= */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((res) => res.json())
      .then(setProperty)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-10">Loading property...</p>;
  if (!property) return <p className="p-10">Property not found.</p>;

  /* Build full address for the map */
  const fullAddress = useMemo(() => {
    return `${property.address}, ${property.city}, ${property.state}`;
  }, [property]);

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    fullAddress
  )}&output=embed`;

  return (
    <>
      <Navbar />

      {/* =========================
          HERO IMAGE
      ========================= */}
      <motion.div
        className="relative h-[420px] w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <img
          src={property.imageData || "/placeholder.jpg"}
          alt={property.name}
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {/* HERO TEXT */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-6xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <h1 className="text-4xl font-bold text-white">
            {property.name}
          </h1>
          <p className="flex items-center gap-2 text-white/80 mt-2">
            <MapPin className="w-4 h-4" />
            {fullAddress}
          </p>
        </motion.div>
      </motion.div>

      {/* =========================
          MAIN CONTENT
      ========================= */}
      <motion.div
        className="px-40 py-24 grid lg:grid-cols-3 gap-10"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* LEFT SIDE */}
        <motion.div
          className="lg:col-span-2 space-y-10"
          variants={fadeUp}
        >
          {/* STATS */}
          <motion.div
            className="grid grid-cols-3 gap-4"
            variants={stagger}
          >
            <Stat icon={<Bed />} label="Bedrooms" value={property.bedrooms} />
            <Stat icon={<Bath />} label="Bathrooms" value={property.bathrooms} />
            <Stat
              icon={<Ruler />}
              label="Size"
              value={`${property.squareFeet || "-"} sqft`}
            />
          </motion.div>

          {/* DESCRIPTION */}
          <motion.div className="space-y-3" variants={fadeUp}>
            <h2 className="text-xl font-semibold">About this property</h2>
            <p className="text-muted-foreground leading-relaxed">
              {property.description || "No description provided."}
            </p>
          </motion.div>

          {/* MAP SECTION */}
          <motion.div className="space-y-3" variants={fadeUp}>
            <h2 className="text-xl font-semibold">Location</h2>

            <div className="rounded-2xl overflow-hidden border h-[320px]">
              <iframe
                src={mapSrc}
                className="w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {fullAddress}
            </p>
          </motion.div>

          {/* MANAGER */}
          <motion.div
            className="flex items-center gap-3 rounded-xl border p-5 bg-muted/40"
            variants={fadeUp}
          >
            <div className="p-3 rounded-full bg-primary/10">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Managed by</p>
              <p className="font-semibold">
                {property.manager?.name || "Verified Manager"}
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* RIGHT ACTION CARD */}
        <motion.div
          className="sticky top-24 h-fit rounded-2xl border shadow-lg p-6 space-y-6 bg-white"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <div>
            <p className="text-sm text-muted-foreground">Monthly Rent</p>
            <p className="text-3xl font-bold flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-500" />
              {property.rentAmount}
            </p>
          </div>

          <Button
            size="lg"
            className="w-full rounded-xl text-lg"
            onClick={() => router.push(`/properties/${id}/apply`)}
          >
            Apply for this Property
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            No payment required to apply
          </p>
        </motion.div>
      </motion.div>

      <Footer />
    </>
  );
}

/* =========================
   STAT COMPONENT
========================= */
function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ scale: 1.05 }}
      className="rounded-xl border p-4 flex flex-col items-center gap-2 bg-white shadow-sm"
    >
      <div className="text-primary">{icon}</div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </motion.div>
  );
}
