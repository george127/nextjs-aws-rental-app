"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/* ------------------ Animations ------------------ */

const pageVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function ApplyPropertyPage() {
  const { id } = useParams();
  const router = useRouter();

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [tenantName, setTenantName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ------------------ Fetch Property ------------------ */
  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((res) => res.json())
      .then(setProperty)
      .finally(() => setLoading(false));
  }, [id]);

  /* ------------------ Submit Application ------------------ */
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertyId: id,
        tenantName,
        email,
        phone,
        message,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Handle specific error cases
      if (res.status === 409) {
        // Duplicate application
        const confirmRedirect = window.confirm(
          "You already have a pending application for this property. Would you like to view your existing applications?"
        );
        if (confirmRedirect) {
          router.push("/dashboard/tenant/applications");
        }
      } else if (res.status === 400) {
        // Validation error
        alert(data.error || "Please check your information and try again.");
      } else {
        // Other errors
        alert(data.error || "Something went wrong. Please try again.");
      }
      return;
    }

    // Success case
    const successMessage = `
      Application submitted successfully!
      \n\nProperty: ${data.application.property.name}
      \nApplication ID: ${data.application.id}
      \nStatus: ${data.application.status}
    `;
    
    const confirmRedirect = window.confirm(successMessage + "\n\nView your applications?");
    
    if (confirmRedirect) {
      router.push("/dashboard/tenant/applications");
    } else {
      // Clear form or redirect to property listing
      router.push("/properties");
    }

  } catch (error) {
    console.error("Submission error:", error);
    alert("Network error. Please check your connection and try again.");
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-muted-foreground">Loading property…</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <p className="text-muted-foreground">Property not found.</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <motion.section
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 px-4"
      >
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center space-y-2">
            <p className="flex items-center justify-center gap-2 text-sm uppercase tracking-wide text-muted-foreground">
              <FileText className="w-4 h-4" />
              Property Application
            </p>
            <h1 className="text-3xl font-bold">
              Apply for {property.name}
            </h1>
            <p className="text-muted-foreground">
              Your application will be reviewed by the property manager.
            </p>
          </div>

          {/* Form Card */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl shadow-sm p-8 space-y-6"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4" /> Full Name
                </label>
                <Input
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@email.com"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Phone Number
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 812 000 0000"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Message
                </label>
                <Textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell the manager about yourself..."
                />
              </div>

              <Button
                size="lg"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            </form>

            <p className="text-xs text-muted-foreground text-center">
              You will be notified once the manager reviews your application.
            </p>
          </motion.div>
        </div>
      </motion.section>

      <Footer />
    </>
  );
}
