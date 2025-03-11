"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const inputClass =
  "bg-transparent hover:bg-accent transition-all rounded-none hover:rounded border-x-0 border-t-0 focus-visible:ring-0 focus-visible:ring-offset-0";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/search";

  // Check for error parameter from NextAuth
  const authError = searchParams.get("error");
  if (authError && !error) {
    if (authError === "CredentialsSignin") {
      setError("Invalid username or password");
    } else {
      setError("An error occurred during sign in");
    }
  }

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
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        username: formData.username,
        password: formData.password,
      });

      if (result?.error) {
        setError("invalid username or password");
        setLoading(false);
        return;
      }

      // Successful login
      router.push(callbackUrl);
      router.refresh(); // Refresh to update auth state
    } catch (err: any) {
      setError(`An unexpected error occurred ${err?.message ?? ""}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-start font-mono pt-[15rem] px-[10%]">
      <Card className="w-full max-w-md border-transparent bg-transparent">
        <CardHeader className="space-y-1 items-start">
          <CardTitle className="text-xl font-medium  text-center">
            login to shells
          </CardTitle>
          {/* <CardDescription className="text-center text-neutral-400">
            enter your credentials to access your account
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
                type="string"
                id="username"
                name="username"
                value={formData.username}
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
              />
            </div>

            <Button
              type="submit"
              variant="ghost"
              disabled={loading}
              className="w-full cursor-pointer"
            >
              {loading ? "logging in..." : "login"}
            </Button>
          </form>

          <div className="mt-4 text-start text-sm">
            <p className="text-neutral-400">
              {/* Don&apos;t have an account?{" "} */}
              <Link
                href="/register"
                className="text-white hover:text-white/80 transition-all"
              >
                register?
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
