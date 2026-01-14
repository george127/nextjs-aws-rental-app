"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";
import { Globe } from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";   

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"TENANT" | "MANAGER">("TENANT");

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password, role }), // ✅ include phone
      });

      if (res.ok) {
        alert("Account created successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Something went wrong!");
      }
    } catch (error) {
      console.error(error);
      alert("Server error, try again later.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md p-6 shadow-xl rounded-2xl">
            <CardHeader className="text-center mb-4">
              <CardTitle className="text-2xl font-bold text-primary">
                Create Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                type="text"
                placeholder="Full Name"
              />
              <Input
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                placeholder="Email"
              />
              <Input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                type="tel"
                placeholder="Phone Number"
              />
              <Input
                value={password}
                onChange={e => setPassword(e.target.value)}
                type="password"
                placeholder="Password"
              />
              <Input
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                type="password"
                placeholder="Confirm Password"
              />

              <div className="flex gap-4 mt-2">
                <label className="flex-1 flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="TENANT"
                    checked={role === "TENANT"}
                    onChange={() => setRole("TENANT")}
                    className="accent-primary"
                  />
                  Tenant
                </label>
                <label className="flex-1 flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value="MANAGER"
                    checked={role === "MANAGER"}
                    onChange={() => setRole("MANAGER")}
                    className="accent-primary"
                  />
                  Manager
                </label>
              </div>

              <Button className="w-full mt-2" onClick={handleSubmit}>
                Sign Up
              </Button>

              <div className="flex items-center gap-2 my-2">
                <hr className="flex-1 border-gray-300" />
                <span className="text-muted text-sm">OR</span>
                <hr className="flex-1 border-gray-300" />
              </div>

              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Globe className="w-5 h-5" /> Continue with Google
              </Button>

              <p className="text-center text-sm text-muted mt-4">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary font-medium">
                  Login
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
