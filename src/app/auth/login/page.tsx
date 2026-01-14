"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";
import { Globe } from "lucide-react";
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

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Invalid login credentials");
      return;
    }

    alert("Login successful!");

    // 🎭 Role-based redirect
    if (data.role === "MANAGER") {
      router.push("/manager/dashboard");
    } else {
      router.push("/tenant/dashboard");
    }

  } catch (error) {
    console.error(error);
    alert("Server error. Please try again.");
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

              <div className="flex items-center gap-2 my-2">
                <hr className="flex-1 border-gray-300" />
                <span className="text-muted text-sm">OR</span>
                <hr className="flex-1 border-gray-300" />
              </div>

              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <Globe className="w-5 h-5" />
                Continue with Google
              </Button>

              <p className="text-center text-sm text-muted mt-4">
                Don’t have an account?{" "}
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
