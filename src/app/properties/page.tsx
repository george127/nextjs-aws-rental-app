"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Bed,
  Bath,
  Ruler,
  DollarSign,
  CheckCircle,
  Heart,
  Home,
  User,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05 },
  }),
};

export default function AvailablePropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapView, setMapView] = useState(false);

  // Filters
  const [city, setCity] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/properties/public")
      .then((res) => res.json())
      .then(setProperties)
      .finally(() => setLoading(false));

    const saved = localStorage.getItem("favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  const toggleFavorite = (id: string) => {
    const updated = favorites.includes(id)
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];

    setFavorites(updated);
    localStorage.setItem("favorites", JSON.stringify(updated));
  };

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      if (city && !p.city.toLowerCase().includes(city.toLowerCase()))
        return false;
      if (bedrooms && p.bedrooms < Number(bedrooms)) return false;
      if (maxPrice && p.rentAmount > Number(maxPrice)) return false;
      return true;
    });
  }, [properties, city, bedrooms, maxPrice]);

  /* Build a map centered on first result */
  const mapSrc = useMemo(() => {
    if (!filteredProperties.length) return "";
    const first = filteredProperties[0];
    const address = `${first.city}, ${first.state}`;
    return `https://www.google.com/maps?q=${encodeURIComponent(
      address
    )}&output=embed`;
  }, [filteredProperties]);

  if (loading) return <p>Loading properties...</p>;

  return (
    <>
      <Navbar />
      <div className="space-y-10 px-40 py-24">
        {/* HEADER */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold">Available Properties</h1>

          {/* FILTERS */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Input
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Min Bedrooms"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            <Button variant="outline" onClick={() => setMapView(!mapView)}>
              <Map className="w-4 h-4 mr-2" />
              {mapView ? "Grid View" : "Map View"}
            </Button>
          </div>
        </div>

        {/* =========================
            MAP VIEW
        ========================= */}
        {mapView ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* MAP */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden border h-[500px]">
              {mapSrc ? (
                <iframe
                  src={mapSrc}
                  className="w-full h-full"
                  loading="lazy"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No locations found
                </div>
              )}
            </div>

            {/* LOCATION LIST */}
            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
              {filteredProperties.map((p) => {
                const address = `${p.address}, ${p.city}, ${p.state}`;
                const mapLink = `https://www.google.com/maps?q=${encodeURIComponent(
                  address
                )}`;

                return (
                  <div
                    key={p.id}
                    className="rounded-xl border p-4 hover:bg-muted cursor-pointer transition"
                    onClick={() => window.open(mapLink, "_blank")}
                  >
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {address}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      ${p.rentAmount}/month
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* =========================
              GRID VIEW
          ========================= */
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((prop, index) => (
              <motion.div
                key={prop.id}
                onClick={() => router.push(`/properties/${prop.id}`)}
                className="cursor-pointer rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl transition"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                custom={index}
              >
                {/* IMAGE */}
                <div className="relative h-52 overflow-hidden">
                  {prop.imageData ? (
                    <img
                      src={prop.imageData}
                      alt={prop.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full bg-gray-200 flex items-center justify-center text-gray-500">
                      No Image
                    </div>
                  )}

                  {/* FAVORITE */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(prop.id);
                    }}
                    className="absolute top-3 right-3 rounded-full bg-white p-2 shadow"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favorites.includes(prop.id)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-500"
                      }`}
                    />
                  </button>

                  {/* PRICE */}
                  <div className="absolute bottom-3 left-3 bg-black/80 text-white px-4 py-1 rounded-full text-sm">
                    ${prop.rentAmount}/mo
                  </div>
                </div>

                {/* BODY */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-blue-500" />
                      <h4 className="font-semibold">{prop.name}</h4>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Available
                    </span>
                  </div>

                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {prop.city}, {prop.state}
                  </p>

                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Bed className="w-4 h-4" /> {prop.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-4 h-4" /> {prop.bathrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Ruler className="w-4 h-4" /> {prop.squareFeet || "-"} sqft
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs bg-gray-100 px-3 py-2 rounded-full w-fit">
                    <User className="w-4 h-4" />
                    Managed by Verified Landlord
                  </div>

                  <Button className="w-full rounded-xl">
                    View Details & Apply
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
