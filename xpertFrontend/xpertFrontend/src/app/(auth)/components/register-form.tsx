"use client";

import { useState } from "react";
import Link from "next/link";
import { useRegister } from "@/lib/hooks/use-register";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function RegisterForm() {
  const { register, isLoading, error } = useRegister();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    register({ email, password });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create an account</h1>
        <p className="text-sm text-gray-500">
          Enter your email and password to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Input
            id="password"
            type="password"
            label="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>
        
        {error && (
          <div className="text-sm text-red-500 font-medium">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Sign Up"}
        </Button>
        
        <div className="text-center mt-4">
          <span className="text-sm text-gray-500">Already have an account? </span>
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            Log in
          </Link>
        </div>
      </form>
    </div>
  );
}
