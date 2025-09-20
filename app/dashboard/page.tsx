/**
 * CareerTwin Student Dashboard - Redesigned
 *
 * This dashboard is the central hub for the student's journey, redesigned
 * to be a guided, linear progression rather than a simple feature launchpad.
 * It presents the user's path as a series of steps, with only the
 * current step being active, creating a unique and professional UX.
 */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Map, MessageSquare, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

// Animation variants for a staggered fade-in effect
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } },
};

// Define the steps in the user's journey
const journeySteps = [
  {
    title: "AI Skills Analysis",
    description: "Start by letting our AI analyze your resume to discover your core strengths and best-fit career paths.",
    icon: FileText,
    href: "/analyze",
    status: "active",
  },
  {
    title: "Dynamic Career Roadmap",
    description: "Once your skills are analyzed, the AI Strategist will build a personalized, step-by-step plan for you.",
    icon: Map,
    href: "#", // No link for disabled steps
    status: "locked",
  },
  {
    title: "AI Interview Coach",
    description: "With your roadmap in hand, practice mock interviews in our 'Focus Mode' to build confidence and skill.",
    icon: MessageSquare,
    href: "#",
    status: "locked",
  },
];

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const userName = user?.name?.split(" ")[0] || "Student";

  return (
    <motion.div
      className="container py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* --- Welcome Header --- */}
      <motion.div variants={itemVariants} className="space-y-1 mb-12">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome back, {userName}!
        </h1>
        <p className="text-muted-foreground text-xl">
          Your personalized career journey starts here.
        </p>
      </motion.div>

      {/* --- Career Journey Steps --- */}
      <motion.div variants={containerVariants} className="space-y-4">
        {journeySteps.map((step, index) => {
          const isActive = step.status === "active";
          return (
            <motion.div key={index} variants={itemVariants}>
              <Card
                className={cn(
                  "transition-all",
                  isActive
                    ? "border-primary shadow-lg hover:shadow-xl"
                    : "bg-muted/50 border-dashed"
                )}
              >
                <div className="flex items-center p-6">
                  {/* Step Number and Icon */}
                  <div className="flex items-center mr-6">
                    <div
                      className={cn(
                        "flex items-center justify-center h-12 w-12 rounded-full border-2",
                        isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-muted-foreground/30 text-muted-foreground/50"
                      )}
                    >
                      <step.icon className="h-6 w-6" />
                    </div>
                  </div>

                  {/* Step Details */}
                  <div className="flex-grow">
                    <h2 className="text-xl font-semibold">
                      Step {index + 1}: {step.title}
                    </h2>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>

                  {/* Action Button */}
                  <div className="ml-6">
                    {isActive ? (
                      <Button asChild>
                        <Link href={step.href}>
                          Start Now <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="secondary" disabled>
                        <Lock className="mr-2 h-4 w-4" /> Locked
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}