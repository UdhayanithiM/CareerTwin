"use client"

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, ArrowRight, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

// Define types for our assessment objects
interface Assessment {
  id: number;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeEstimate: string;
  questions: number;
  type: string;
  link: string;
}

const assessments: Assessment[] = [
    {
        id: 1,
        title: "Technical Assessment",
        description: "Evaluate your technical skills through coding challenges and system design questions.",
        difficulty: "Hard",
        timeEstimate: "45 min",
        questions: 10,
        type: "Technical",
        link: "/assessment-list/assessment-tech"
    },
    {
        id: 2,
        title: "Problem Solving",
        description: "Test your ability to solve complex problems with efficient solutions and clear reasoning.",
        difficulty: "Medium",
        timeEstimate: "40 min",
        questions: 6,
        type: "Technical",
        link: "/assessment-list/assessment-problem"
    },
    {
        id: 3,
        title: "Behavioral Interview",
        description: "Assess your soft skills, cultural fit, and responses to workplace scenarios.",
        difficulty: "Medium",
        timeEstimate: "25 min",
        questions: 8,
        type: "Behavioral",
        link: "/take-interview" // Or a dedicated link
    },
];

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function AssessmentListPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container py-16 md:py-24">
        {/* --- Hero Section --- */}
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
        >
            <div className="inline-block bg-primary/10 p-4 rounded-xl mb-6">
                <ListChecks className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                FortiTwin Assessments
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Choose an assessment to demonstrate your skills and begin your interview journey.
            </p>
        </motion.div>

        {/* --- Assessments Grid --- */}
        <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {assessments.map((assessment) => (
            <motion.div variants={itemVariants} key={assessment.id}>
              <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-xl">{assessment.title}</CardTitle>
                    <Badge
                      className={cn(
                        assessment.difficulty === 'Easy' && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
                        assessment.difficulty === 'Medium' && 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
                        assessment.difficulty === 'Hard' && 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                      )}
                    >
                      {assessment.difficulty}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="flex-grow">
                  <p className="text-muted-foreground mb-4">{assessment.description}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>{assessment.timeEstimate} • {assessment.questions} questions</span>
                  </div>
                </CardContent>

                <CardFooter className="bg-muted/50 p-4">
                  <Button asChild className="w-full">
                    <Link href={assessment.link}>
                      Start Assessment
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.section>
      </main>
    </div>
  )
}