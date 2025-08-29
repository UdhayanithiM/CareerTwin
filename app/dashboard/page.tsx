"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight, Code, Gauge, MessageSquare, Play, User, BookOpen, BarChart2, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModeToggle } from "@/components/mode-toggle"

// --- Animation Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// --- Empty State Component ---
const EmptyState = ({ title, description, buttonText, buttonLink }: { title: string, description: string, buttonText: string, buttonLink: string }) => (
    <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <div className="inline-block bg-muted p-4 rounded-full mb-4">
            <CalendarClock className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground mt-2">{description}</p>
        <Button asChild variant="outline" className="mt-4">
            <Link href={buttonLink}>{buttonText}</Link>
        </Button>
    </div>
);


export default function StudentDashboard() {
  const [progress] = useState(42);
  const userName = "Alex"; // This would typically come from user auth state

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
        {/* --- Header --- */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Gauge className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg hidden sm:inline">
                        <span className="text-primary">Forti</span>Twin
                    </span>
                </Link>
                
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="/dashboard" className="text-primary font-semibold">Dashboard</Link>
                    <Link href="/assessment-list" className="text-muted-foreground hover:text-primary transition-colors">Assessments</Link>
                    <Link href="/report" className="text-muted-foreground hover:text-primary transition-colors">Reports</Link>
                </nav>
                
                <div className="flex items-center gap-4">
                    <ModeToggle />
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/dashboard/settings">
                            <User className="h-4 w-4" />
                            <span className="sr-only">Settings</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </header>

        {/* --- Main Content --- */}
        <main className="flex-1">
            <motion.div 
                className="container py-8 space-y-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* --- Welcome Header --- */}
                <motion.div variants={itemVariants}>
                    <h1 className="text-3xl font-bold">Welcome back, {userName}!</h1>
                    <p className="text-muted-foreground">Here's your progress. Let's keep the momentum going.</p>
                </motion.div>

                <div className="grid gap-8 lg:grid-cols-3">
                    {/* --- Left Column --- */}
                    <motion.div variants={containerVariants} className="lg:col-span-2 space-y-8">

                        {/* --- Primary CTA Card --- */}
                        <motion.div variants={itemVariants}>
                            <Card className="bg-gradient-to-br from-primary via-primary to-purple-600 text-primary-foreground shadow-lg">
                                <CardHeader>
                                    <CardTitle className="text-2xl">Start Your Next Session</CardTitle>
                                    <CardDescription className="text-primary-foreground/80">
                                        Choose from our technical or behavioral assessments to get started.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <div className="rounded-full bg-primary-foreground/20 p-2"><Play className="h-4 w-4" /></div>
                                            <span>Behavioral</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="rounded-full bg-primary-foreground/20 p-2"><Code className="h-4 w-4" /></div>
                                            <span>Technical</span>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                     <Button variant="secondary" size="lg" asChild>
                                        <Link href="/assessment-list">
                                            Browse Assessments <ArrowRight className="ml-2 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>

                        {/* --- Recent Activity Tabs --- */}
                        <motion.div variants={itemVariants}>
                            <Tabs defaultValue="upcoming">
                                <TabsList>
                                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                                    <TabsTrigger value="completed">Completed</TabsTrigger>
                                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                                </TabsList>
                                <TabsContent value="upcoming" className="pt-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Mock Technical Interview</CardTitle>
                                            <CardDescription>Scheduled for August 28, 2025 • 2:00 PM</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Code className="h-4 w-4" />
                                                <span>Focus: Data Structures & Algorithms</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-end gap-2">
                                            <Button variant="outline">Reschedule</Button>
                                            <Button asChild>
                                                <Link href="/take-interview">Prepare Now</Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="completed" className="pt-4">
                                     <Card>
                                        <CardHeader>
                                            <CardTitle>Behavioral Interview Practice</CardTitle>
                                            <CardDescription>Completed on August 3, 2025</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between font-medium">
                                                    <span>Overall Score:</span>
                                                    <span>85/100</span>
                                                </div>
                                                <Progress value={85} className="h-2" />
                                                <p className="text-sm text-muted-foreground pt-2">
                                                    Strong communication skills demonstrated. Work on providing more specific examples.
                                                </p>
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button variant="secondary" className="w-full" asChild>
                                                <Link href="/report">View Detailed Feedback</Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="feedback" className="pt-4">
                                    <EmptyState 
                                        title="No Feedback Yet"
                                        description="Complete an interview to see your personalized feedback and growth areas."
                                        buttonText="Start an Assessment"
                                        buttonLink="/assessment-list"
                                    />
                                </TabsContent>
                            </Tabs>
                        </motion.div>
                    </motion.div>
                    
                    {/* --- Right Column --- */}
                    <motion.div variants={containerVariants} className="lg:col-span-1 space-y-8">
                        <motion.div variants={itemVariants}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Progress</CardTitle>
                                    <CardDescription>Interview readiness score.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                     <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-muted-foreground">Overall Readiness</span>
                                        <span className="text-lg font-bold text-primary">{progress}%</span>
                                    </div>
                                    <Progress value={progress} />
                                    <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                                        <div>
                                            <p className="text-2xl font-bold">3</p>
                                            <p className="text-xs text-muted-foreground">Completed</p>
                                        </div>
                                         <div>
                                            <p className="text-2xl font-bold">2</p>
                                            <p className="text-xs text-muted-foreground">Upcoming</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Access</CardTitle>
                                    <CardDescription>Jump right back into your journey.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                     <Button variant="ghost" className="w-full justify-start" asChild>
                                         <Link href="/dashboard/interviews">
                                            <CalendarClock className="mr-2 h-4 w-4" /> My Interviews
                                        </Link>
                                     </Button>
                                      <Button variant="ghost" className="w-full justify-start" asChild>
                                         <Link href="/dashboard/analytics">
                                            <BarChart2 className="mr-2 h-4 w-4" /> My Analytics
                                        </Link>
                                     </Button>
                                      <Button variant="ghost" className="w-full justify-start" asChild>
                                         <Link href="/assessment-list">
                                            <BookOpen className="mr-2 h-4 w-4" /> All Assessments
                                        </Link>
                                     </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
        </main>
    </div>
  )
}