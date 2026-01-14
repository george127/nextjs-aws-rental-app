"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 z-50 w-full border-b bg-white/80 backdrop-blur"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold">
          Rentify
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm">
          <Link href="#features">Features</Link>
          <Link href="#how">How it works</Link>
          <Link href="#pricing">Pricing</Link>
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/auth/login">
              <LogIn className="h-5 w-5" />
            </Link>
          </Button>

          <Button size="icon" asChild>
            <Link href="/auth/register">
              <UserPlus className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}
