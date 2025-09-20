/**
 * CareerTwin Student Dashboard
 *
 * This is the central hub for the student's journey. It has been refactored
 * to remove the old assessment-list model and now serves as a launchpad for
 * the core CareerTwin features: Resume Analysis, Roadmap Generation, and
 * Mock Interviews.
 */
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Map, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";

// Animation variants for a staggered fade-in effect
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function StudentDashboard() {
  const { user } = useAuthStore();
  // Provides a friendly greeting, defaulting to "Student" if the name isn't available.
  const userName = user?.name?.split(" ")[0] || "Student";

  return (
    // The main container uses Framer Motion for a smooth entry animation.
    <motion.div
      className="container py-8 space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* --- Welcome Header --- */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {userName}!
        </h1>
        <p className="text-muted-foreground text-lg">
          Ready to build your future? Let's get started.
        </p>
      </motion.div>

      {/* --- Core Feature Cards --- */}
      {/* The grid layout is responsive, stacking on mobile and going side-by-side on larger screens. */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Analyze Resume */}
        <motion.div variants={itemVariants}>
          <Card className="flex flex-col h-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">AI Skills Analysis</CardTitle>
                  <CardDescription>Step 1: Discover Yourself</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">
                Upload your resume or connect your LinkedIn to let our AI
                analyze your unique strengths and identify your best-fit career
                paths.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/analyze">
                  {/* [FIXED] Wrapped content in a span */}
                  <span>
                    Analyze Your Resume <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Card 2: Generate Roadmap */}
        <motion.div variants={itemVariants}>
          <Card className="flex flex-col h-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <Map className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Dynamic Career Roadmap</CardTitle>
                  <CardDescription>Step 2: Chart Your Course</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">
                Once you have a goal, our AI Strategist will build a
                personalized, step-by-step plan with courses to take and
                projects to build.
              </p>
            </CardContent>
            <CardFooter>
              {/* [FIXED] Changed to a standard disabled button */}
              <Button className="w-full" disabled>
                Generate Your Roadmap <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Card 3: Mock Interview */}
        <motion.div variants={itemVariants}>
          <Card className="flex flex-col h-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">AI Interview Coach</CardTitle>
                  <CardDescription>Step 3: Build Confidence</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-muted-foreground">
                Practice realistic mock interviews in our distraction-free
                'Focus Mode' and get instant, actionable feedback to improve
                your skills.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/take-interview">
                  {/* [FIXED] Wrapped content in a span */}
                  <span>
                    Start a Mock Interview{" "}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}