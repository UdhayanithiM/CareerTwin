// File: app/page.tsx
'use client';

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Star, UserCheck, Map, MessageSquare } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import Spline from "@splinetool/react-spline";

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5 },
        },
      }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="w-full"
    >
      <Card className="text-center h-full transition-shadow duration-300 hover:shadow-xl">
        <CardHeader>
          <div className="mx-auto h-14 w-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function LandingPage() {
  return (
    <MainLayout>
      {/* --- Hero Section --- */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-background via-background to-muted/40">
        <div className="container z-10 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              className="space-y-6 text-center md:text-left"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Your Personalized AI Career Co-pilot
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Transform career anxiety into an actionable plan. CareerTwin guides you from self-discovery and skill-building to job-readiness.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
                <Button size="lg" asChild>
                  <Link href="/analyze">
                    Analyze My Career <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              className="flex justify-center items-center h-[400px] md:h-[500px] relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeInOut" }}
            >
              <div className="w-full h-full rounded-lg overflow-hidden">
                <Spline scene="https://prod.spline.design/qIjHRYzrDY-SIfdj/scene.splinecode" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section id="features" className="py-16 md:py-24 bg-background">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-block bg-primary/10 p-3 rounded-lg mb-4">
              <Star className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How CareerTwin Empowers You
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Powerful, AI-driven tools to guide you from confusion to clarity and confidence.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } },
            }}
          >
            <FeatureCard
              icon={UserCheck}
              title="AI Skills Analysis"
              description="Get instant analysis of your resume to discover your strengths and best-fit career paths."
            />
            <FeatureCard
              icon={Map}
              title="Dynamic Career Roadmaps"
              description="Receive a personalized, step-by-step plan with courses to take and projects to build."
            />
            <FeatureCard
              icon={MessageSquare}
              title="Mock Interview Practice"
              description="Build confidence with our AI Interview Coach in a distraction-free 'Focus Mode'."
            />
          </motion.div>
        </div>
      </section>

      {/* --- Call to Action Section --- */}
      <section className="py-16 md:py-24 bg-muted/40">
        <div className="container">
          <Card className="bg-gradient-to-r from-primary to-purple-600 text-primary-foreground text-center p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Build Your Future?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
              Start with a free AI career analysis and take the first step towards the job you'll love.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/analyze">
                Get Your Free Analysis <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
}