"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchAPI } from "../lib/api";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const resetSuccess = searchParams.get("message") === "reset_success";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetchAPI("/accounts/login/", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      
      // Django API wraps responses in { message, data }
      // Backend returns { access: "...", refresh: "..." }
      const tokenData = response.data || response;
      const accessToken = tokenData.access || tokenData.access_token;
      const refreshToken = tokenData.refresh || tokenData.refresh_token;
      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
        if (refreshToken) {
          localStorage.setItem("refresh_token", refreshToken);
        }
        if (tokenData.user) {
          localStorage.setItem("user", JSON.stringify(tokenData.user));
        }
        if (tokenData.user_id) {
          localStorage.setItem("user_id", tokenData.user_id);
        }
      }

      router.push("/");
    } catch (err: any) {
      const msg = err.message || "Invalid email or password.";
      if (msg.toLowerCase().includes("verify") || msg.toLowerCase().includes("not verified") || msg.toLowerCase().includes("email")) {
        setError("Please verify your email first. Check your inbox for the verification code.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <h1 className="font-headline text-4xl text-on-surface text-center mb-2">
        Welcome back
      </h1>
      <p className="text-on-surface-variant text-center mb-10">
        Sign in to continue your journey.
      </p>

      {registered && (
        <div className="bg-green-500/10 text-green-700 p-4 rounded-xl mb-6 text-sm text-center font-medium">
          Account verified successfully! Please log in.
        </div>
      )}

      {resetSuccess && (
        <div className="bg-green-500/10 text-green-700 p-4 rounded-xl mb-6 text-sm text-center font-medium">
          Password reset successfully! Please log in with your new password.
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 text-red-600 p-4 rounded-xl mb-6 text-sm text-center">
          {error}
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="text-[10px] uppercase tracking-widest font-bold text-primary mb-2 block">
            Email
          </label>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-surface-container-high border-none rounded-xl px-4 py-4 focus:ring-1 focus:ring-tertiary-fixed-dim focus:bg-surface-container-lowest transition-all font-medium"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-primary">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-surface-container-high border-none rounded-xl px-4 py-4 focus:ring-1 focus:ring-tertiary-fixed-dim focus:bg-surface-container-lowest transition-all font-medium"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-linear-to-br from-primary to-primary-container text-on-primary py-4 rounded-xl font-bold text-sm tracking-widest uppercase shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>



      <p className="mt-10 text-sm text-on-surface-variant text-center">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-primary font-bold hover:underline"
        >
          Create one — it&apos;s free
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <Link href="/" className="mb-12">
        <img src="/bibleway-logo.png" alt="Bibleway" className="h-12 w-auto" />
      </Link>
      
      <Suspense fallback={<div className="text-on-surface-variant">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
