"use client";


import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function HomePage() {
  return (  
    <>
      <Navbar />
 
      {/* HERO */}
      <section className="pt-32 pb-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold leading-tight"
          >
            Smarter Rental Management <br /> for Tenants & Managers
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-muted-foreground max-w-xl mx-auto"
          >
            Pay rent, track payments, manage properties, and handle maintenance
            — all in one secure platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex justify-center gap-4"
          >
            <Button size="lg">Get Started</Button>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Built for Everyone
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div whileHover={{ y: -8 }}>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">For Tenants</h3>
                  <ul className="text-muted-foreground space-y-2">
                    <li>✔ Pay rent online</li>
                    <li>✔ Track payment history</li>
                    <li>✔ Submit maintenance requests</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div whileHover={{ y: -8 }}>
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">For Managers</h3>
                  <ul className="text-muted-foreground space-y-2">
                    <li>✔ Manage properties</li>
                    <li>✔ Track tenant payments</li>
                    <li>✔ Handle maintenance efficiently</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* IMAGE PLACEHOLDER */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            A Modern, Intuitive Interface
          </h2>

          <div className="mt-10 h-64 rounded-xl border bg-white flex items-center justify-center text-muted-foreground">
            Image / App Preview Placeholder
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Simplify Rental Management?
          </h2>
          <Button size="lg">Create Your Account</Button>
        </div>
      </section>

      <Footer />
    </>
  );
}
