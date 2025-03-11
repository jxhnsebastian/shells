"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { inputClass } from "@/components/pages/LoginPage";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Successful registration - redirect to login
      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-start font-mono pt-[15rem] px-[10%]">
      <Card className="w-full max-w-md border-transparent bg-transparent">
        <CardHeader className="space-y-1 items-start">
          <CardTitle className="text-xl font-medium text-center">
            register
          </CardTitle>
          {/* <CardDescription className="text-center text-neutral-400">
            Enter your details to create a new account
          </CardDescription> */}
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-neutral-400" htmlFor="username">
                username
              </Label>
              <Input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={inputClass}
                required
                minLength={3}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-neutral-400" htmlFor="email">
                email
              </Label>
              <Input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-neutral-400" htmlFor="password">
                password
              </Label>
              <Input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={inputClass}
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-neutral-400" htmlFor="confirmPassword">
                confirm password
              </Label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={inputClass}
                required
                minLength={8}
              />
            </div>

            <Button
              type="submit"
              variant="ghost"
              disabled={loading}
              className="w-full cursor-pointer"
            >
              {loading ? "creating account..." : "register"}
            </Button>
          </form>

          <div className="mt-4 text-start text-sm">
            <p className="text-neutral-400">
              {/* Already have an account?{" "} */}
              <Link
                href="/login"
                className="text-white hover:text-white/80 transition-all"
              >
                login?
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
