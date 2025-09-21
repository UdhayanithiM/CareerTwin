// app/signup/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ArrowRight, Lock, Mail, User, Gauge } from "lucide-react";
import { toast } from "sonner";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuthStore } from "@/stores/authStore";

const SignupIllustration = () => (
    <div className="w-full h-full">
        {/* ✨ FIX: Corrected image path */}
        <Image
            src="/assets/image1-optimized.webp"
            alt="A person planning their career path with an AI assistant"
            width={1200}
            height={1200}
            className="w-full h-full object-cover"
            priority
        />
    </div>
);

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(false);
    const router = useRouter();
    
    const { register, isLoading, error, clearError, user } = useAuthStore();

    // ✨ FIX: Use useEffect for reliable redirection after the user state is updated.
    useEffect(() => {
        if (user) {
            toast.success("Account Created!", { description: "Welcome to CareerTwin! Redirecting to your dashboard..." });
            router.push('/dashboard');
        }
    }, [user, router]);
    
    useEffect(() => {
        if (error) {
            toast.error("Registration Failed", { description: error });
            clearError();
        }
    }, [error, clearError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!acceptTerms) {
            toast.error("Please accept the terms and conditions to continue.");
            return;
        }
        // The register function will trigger the auth listener, updating the 'user'
        // state, and the useEffect above will handle the redirect.
        await register({ name, email, password });
    };

    return (
        <div className="w-full h-screen lg:grid lg:grid-cols-2 overflow-hidden">
            <div className="hidden lg:flex bg-muted items-center justify-center">
                <SignupIllustration />
            </div>
            <div className="flex flex-col items-center justify-center p-6 sm:p-8 overflow-y-auto">
                <div className="absolute top-6 right-6 flex items-center gap-4">
                    <ModeToggle />
                </div>
                
                <div className="w-full max-w-md my-auto">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card>
                            <CardHeader className="text-center">
                                {/* ✨ FIX: Updated branding to CareerTwin */}
                                <Link href="/" className="flex justify-center items-center gap-2 mb-4">
                                    <Gauge className="h-8 w-8 text-primary" />
                                    <h1 className="text-3xl font-bold">
                                        <span className="text-primary">Career</span>Twin
                                    </h1>
                                </Link>
                                <CardTitle className="text-2xl">Create Your Account</CardTitle>
                                <CardDescription>Start your personalized career journey today.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input id="name" placeholder="John Doe" className="pl-10" value={name} onChange={(e) => setName(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input id="email" type="email" placeholder="you@example.com" className="pl-10" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input id="password" type="password" placeholder="•••••••• (min 6 characters)" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} required />
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start space-x-2 pt-2">
                                        <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(checked: boolean) => setAcceptTerms(checked)} />
                                        <div className="grid gap-1.5 leading-none">
                                            <Label htmlFor="terms" className="text-sm font-medium leading-none cursor-pointer">
                                                I agree to the{" "}
                                                <Link href="#" className="text-primary hover:underline">Terms of Service</Link>
                                            </Label>
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? "Creating Account..." : "Create Account"}
                                        {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                                    </Button>
                                </form>
                            </CardContent>
                            <CardFooter>
                                <p className="w-full text-center text-sm text-muted-foreground">
                                    Already have an account?{" "}
                                    <Link href="/login" className="text-primary hover:underline font-semibold">Sign in</Link>
                                </p>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}