"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "../lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    date_of_birth: "",
    gender: "",
    country: "",
    phone_number: "",
    preferred_language: "en",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    let mapped = "prefer_not_to_say";
    if (val === "Male") mapped = "male";
    if (val === "Female") mapped = "female";
    setFormData({ ...formData, gender: mapped });
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const map: Record<string, string> = {
      English: "en",
      Hindi: "hi",
      "Español": "es",
      "Français": "fr",
    };
    setFormData({ ...formData, preferred_language: map[val] || "en" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload: Record<string, string> = { ...formData };
      if (!payload.phone_number) delete payload.phone_number;

      await fetchAPI("/accounts/register/", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      // Redirect to OTP verification page
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 py-16">
      {/* Logo */}
      <Link href="/" className="mb-10">
        <img src="/bibleway-logo.png" alt="Bibleway" className="h-12 w-auto" />
      </Link>

      <div className="w-full max-w-md">
        <h1 className="font-headline text-4xl text-on-surface text-center mb-2">
          Join Bibleway
        </h1>
        <p className="text-on-surface-variant text-center mb-10">
          Create your free account to start your journey.
        </p>

        {error && (
          <div className="bg-red-500/10 text-red-600 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-primary mb-2 block">
              Email (Primary — cannot be changed)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              className="w-full bg-surface-container-high border-none rounded-xl px-4 py-4 focus:ring-1 focus:ring-tertiary-fixed-dim focus:bg-surface-container-lowest transition-all font-medium"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-primary mb-2 block">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              required
              minLength={8}
              className="w-full bg-surface-container-high border-none rounded-xl px-4 py-4 focus:ring-1 focus:ring-tertiary-fixed-dim focus:bg-surface-container-lowest transition-all font-medium"
            />
          </div>

          {/* Name */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-primary mb-2 block">
              Full Name
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Your full name"
              required
              className="w-full bg-surface-container-high border-none rounded-xl px-4 py-4 focus:ring-1 focus:ring-tertiary-fixed-dim focus:bg-surface-container-lowest transition-all font-medium"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-primary mb-2 block">
              Date of Birth
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              required
              className="w-full bg-surface-container-high border-none rounded-xl px-4 py-4 focus:ring-1 focus:ring-tertiary-fixed-dim focus:bg-surface-container-lowest transition-all font-medium"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-primary mb-2 block">
              Gender
            </label>
            <select 
              required
              onChange={handleGenderChange}
              className="w-full bg-surface-container-high border-none rounded-xl px-4 py-4 focus:ring-1 focus:ring-tertiary-fixed-dim focus:bg-surface-container-lowest transition-all appearance-none cursor-pointer font-medium"
            >
              <option value="">Select gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
              <option>Prefer not to say</option>
            </select>
          </div>

          {/* Country & Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-primary mb-2 block">
                Country
              </label>
              <select 
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                className="w-full bg-surface-container-high border-none rounded-xl px-4 py-4 focus:ring-1 focus:ring-tertiary-fixed-dim focus:bg-surface-container-lowest transition-all appearance-none cursor-pointer font-medium"
              >
                <option value="">Select</option>
                <option>India</option>
                <option>United States</option>
                <option>United Kingdom</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-primary mb-2 block">
                Phone (Optional)
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+91 XXXXXXXXXX"
                className="w-full bg-surface-container-high border-none rounded-xl px-4 py-4 focus:ring-1 focus:ring-tertiary-fixed-dim focus:bg-surface-container-lowest transition-all font-medium"
              />
            </div>
          </div>

          {/* Preferred Language */}
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-primary mb-2 block">
              Preferred App Language
            </label>
            <select 
              onChange={handleLanguageChange}
              className="w-full bg-surface-container-high border-none rounded-xl px-4 py-4 focus:ring-1 focus:ring-tertiary-fixed-dim focus:bg-surface-container-lowest transition-all appearance-none cursor-pointer font-medium"
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Español</option>
              <option>Français</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-br from-primary to-primary-container text-on-primary py-4 rounded-xl font-bold text-sm tracking-widest uppercase shadow-lg shadow-primary/20 hover:opacity-90 transition-all mt-4 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="mt-8 text-sm text-on-surface-variant text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-bold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
