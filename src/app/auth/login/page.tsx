"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      // Direct login to your own API
      const res = await fetch("/api/auth/me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: email.trim().toLowerCase(), 
          password 
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Store token if you're using JWT
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        
        // Role-based redirect
        if (data.user?.role === "MANAGER") {
          router.push("/manager/dashboard");
        } else {
          router.push("/tenant/dashboard");
        }
      } else {
        alert(data.error || "Login failed");
      }
    } catch (error: any) {
      console.error(error);
      alert("Login failed. Please try again.");
    } finally {
      setLoading(false);
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
                Welcome Back
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                className="w-full mt-2"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
              <p className="text-center text-sm text-muted mt-4">
                Don't have an account?{" "}
                <Link href="/auth/register" className="text-primary font-medium">
                  Sign Up
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