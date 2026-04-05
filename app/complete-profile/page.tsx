"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "../lib/api";

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Nigeria",
  "Ghana", "Kenya", "South Africa", "India", "Philippines", "Brazil",
  "Mexico", "Germany", "France", "Italy", "Spain", "Netherlands",
  "Sweden", "Norway", "Denmark", "Finland", "Ireland", "New Zealand",
  "Singapore", "Japan", "South Korea", "Indonesia", "Malaysia",
  "Colombia", "Argentina", "Chile", "Peru", "Egypt", "Ethiopia",
  "Tanzania", "Uganda", "Cameroon", "Zimbabwe", "Jamaica", "Trinidad and Tobago",
];

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [country, setCountry] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchAPI("/accounts/profile/")
      .then((res) => {
        const d = res.data || res;
        if (d.full_name && d.date_of_birth && d.country) {
          router.replace("/");
          return;
        }
        if (d.full_name) setFullName(d.full_name);
        if (d.username) setUsername(d.username);
        if (d.date_of_birth) setDateOfBirth(d.date_of_birth);
        if (d.country) setCountry(d.country);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [router]);

  const checkUsername = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value || value.length < 3) {
      setUsernameStatus("idle");
      return;
    }
    setUsernameStatus("checking");
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetchAPI(`/accounts/users/search/?q=${encodeURIComponent(value)}`);
        const results = res?.data?.results ?? res?.results ?? [];
        const taken = results.some((u: any) => u.username?.toLowerCase() === value.toLowerCase());
        setUsernameStatus(taken ? "taken" : "available");
      } catch {
        setUsernameStatus("idle");
      }
    }, 500);
  }, []);

  function handleUsernameChange(value: string) {
    setUsername(value);
    checkUsername(value);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) { setError("Full name is required."); return; }
    if (!username.trim() || username.length < 3) { setError("Username must be at least 3 characters."); return; }
    if (usernameStatus === "taken") { setError("That username is already taken."); return; }
    if (!dateOfBirth) { setError("Date of birth is required."); return; }
    if (!country) { setError("Please select your country."); return; }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("full_name", fullName.trim());
      formData.append("username", username.trim());
      formData.append("date_of_birth", dateOfBirth);
      formData.append("country", country);
      if (photo) formData.append("profile_photo", photo);

      await fetchAPI("/accounts/profile/", {
        method: "PATCH",
        body: formData,
      });
      router.replace("/");
    } catch (err: any) {
      setError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-start justify-center px-4 py-12">
      <div className="bg-surface-container-lowest rounded-2xl editorial-shadow p-8 max-w-lg w-full mt-4">
        <div className="text-center mb-8">
          <h1 className="font-headline text-4xl text-primary mb-2">Bibleway</h1>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Almost there! Complete your profile to join the community.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Profile Photo */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-full bg-surface-container-high border-2 border-dashed border-outline-variant flex items-center justify-center overflow-hidden hover:border-primary transition-colors group"
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary text-3xl">
                  add_a_photo
                </span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3 rounded-xl bg-surface-container text-on-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">Username</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                placeholder="Choose a username"
                className="w-full px-4 py-3 rounded-xl bg-surface-container text-on-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {usernameStatus === "checking" && (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary" />
                )}
                {usernameStatus === "available" && (
                  <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
                )}
                {usernameStatus === "taken" && (
                  <span className="material-symbols-outlined text-red-500 text-lg">cancel</span>
                )}
              </div>
            </div>
            {usernameStatus === "taken" && (
              <p className="text-xs text-red-500 mt-1">This username is already taken.</p>
            )}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-container text-on-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1.5">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-surface-container text-on-surface border border-outline-variant/30 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm appearance-none"
            >
              <option value="">Select your country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-sm text-error bg-error-container/20 px-4 py-3 rounded-xl">
              <span className="material-symbols-outlined text-sm">error</span>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-on-primary py-3 rounded-xl font-semibold text-sm disabled:opacity-50 press-effect transition-all hover:opacity-90"
          >
            {submitting ? "Saving..." : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
