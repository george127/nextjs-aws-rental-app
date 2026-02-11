"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail, Phone, User, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer"; 

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<"register" | "confirm">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [role, setRole] = useState<"TENANT" | "MANAGER">("TENANT");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Password strength checker
  const checkPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { score: 0, message: "" };
    if (pass.length < 8) return { score: 1, message: "Too short" };
    
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasLowerCase = /[a-z]/.test(pass);
    const hasNumbers = /\d/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    
    const score = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecial].filter(Boolean).length;
    
    const messages = [
      "Weak",
      "Fair",
      "Good",
      "Strong",
      "Very Strong"
    ];
    
    return { score, message: messages[score] };
  };

  const passwordStrength = checkPasswordStrength(password);

  const validateForm = () => {
    setError("");
    
    if (!email || !password) {
      setError("Email and password are required");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name: name.trim(), 
          email: email.trim().toLowerCase(), 
          phone: phone.trim(), 
          password, 
          role 
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage(data.message);
        setStep("confirm");
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Unable to connect to server. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

const handleConfirm = async () => {
  if (!confirmationCode.trim()) {
    setError("Please enter the confirmation code");
    return;
  }

  if (confirmationCode.length < 6) {
    setError("Confirmation code should be 6 characters");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const res = await fetch("/api/auth/register", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        email: email.trim().toLowerCase(), 
        confirmationCode: confirmationCode.trim(),
        role // <-- now sending the role
      }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      setSuccessMessage(data.message);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } else {
      setError(data.error || "Invalid confirmation code");
    }
  } catch (error) {
    console.error("Confirmation error:", error);
    setError("Unable to verify code. Please try again.");
  } finally {
    setLoading(false);
  }
};


  const handleResendCode = async () => {
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage(data.message);
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError(data.error || "Failed to resend code");
      }
    } catch (error) {
      console.error("Resend error:", error);
      setError("Unable to resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="w-full shadow-lg border-0">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center text-gray-800">
                {step === "register" ? "Create Account" : "Verify Email"}
              </CardTitle>
              <p className="text-sm text-center text-gray-600">
                {step === "register" 
                  ? "Enter your details to get started" 
                  : `Check your email for the verification code sent to ${email}`
                }
              </p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Success Message */}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center gap-2"
                >
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">{successMessage}</span>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm"
                >
                  {error}
                </motion.div>
              )}

              {step === "register" ? (
                <>
                  {/* Name Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name (Optional)</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Phone Number (Optional)</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a strong password"
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              passwordStrength.score === 0 ? "w-0" :
                              passwordStrength.score === 1 ? "w-1/4 bg-red-500" :
                              passwordStrength.score === 2 ? "w-1/2 bg-yellow-500" :
                              passwordStrength.score === 3 ? "w-3/4 bg-blue-500" :
                              "w-full bg-green-500"
                            }`}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {passwordStrength.message}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Account Type *</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole("TENANT")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          role === "TENANT"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-medium text-gray-800">Tenant</div>
                        <div className="text-xs text-gray-600 mt-1">Looking to rent</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("MANAGER")}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          role === "MANAGER"
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-medium text-gray-800">Manager</div>
                        <div className="text-xs text-gray-600 mt-1">Property management</div>
                      </button>
                    </div>
                  </div>

                  {/* Terms Agreement */}
                  <div className="text-xs text-gray-500">
                    <p>
                      By creating an account, you agree to our{" "}
                      <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.
                    </p>
                  </div>

                  {/* Register Button */}
                  <Button
                    type="button"
                    className="w-full py-6 text-base font-medium"
                    onClick={handleRegister}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Creating Account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </>
              ) : (
                // Confirmation Step
                <>
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
                      <Mail className="h-8 w-8 text-blue-600" />
                    </div>
                    
                    <p className="text-gray-600">
                      We sent a 6-digit verification code to:
                      <br />
                      <strong className="text-gray-900">{email}</strong>
                    </p>
                    <p className="text-sm text-gray-500">
                      Enter the code below to verify your email address.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Verification Code *</label>
                      <Input
                        value={confirmationCode}
                        onChange={(e) => {
                          // Only allow numbers
                          const value = e.target.value.replace(/\D/g, '');
                          setConfirmationCode(value.slice(0, 6));
                        }}
                        placeholder="000000"
                        className="text-center text-3xl font-mono tracking-widest h-14"
                        maxLength={6}
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setStep("register")}
                        disabled={loading}
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        className="flex-1"
                        onClick={handleConfirm}
                        disabled={loading || confirmationCode.length !== 6}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Verifying...
                          </span>
                        ) : (
                          "Verify Email"
                        )}
                      </Button>
                    </div>

                    <div className="text-center">
                      <button
                        onClick={handleResendCode}
                        disabled={loading}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        Didn't receive a code? Click to resend
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Login Link */}
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Debug info (remove in production) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
              <p>Cognito Client ID: {process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID?.substring(0, 10)}...</p>
              <p>Base URL: {process.env.NEXT_PUBLIC_BASE_API_URL}</p>
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
    </>
  );
}