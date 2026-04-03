"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import MainLayout from "../components/MainLayout";
import { fetchAPI } from "../lib/api";
import Shimmer from "../components/Shimmer";

interface Post {
  id: string;
  title?: string;
  content?: string;
  text?: string;
  reactions_count?: number;
  likes_count?: number;
  created_at?: string;
  created?: string;
}

const DURATIONS = [
  { days: 1, label: "1 Day", reach: "~500 people" },
  { days: 3, label: "3 Days", reach: "~1,500 people" },
  { days: 7, label: "7 Days", reach: "~4,000 people" },
];

const AUDIENCES = [
  { value: "everyone", label: "Everyone", icon: "public" },
  { value: "followers", label: "My Followers", icon: "group" },
  { value: "local", label: "Local Community", icon: "location_on" },
];

function BoostContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPostId = searchParams.get("post");

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(preselectedPostId);
  const [durationDays, setDurationDays] = useState(3);
  const [targetAudience, setTargetAudience] = useState("everyone");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPosts() {
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
          router.push("/login");
          return;
        }
        const res = await fetchAPI(`/social/posts/?author=${userId}`);
        const results = res?.data?.results ?? res?.results ?? res?.data ?? [];
        setPosts(results);
      } catch {
        setError("Failed to load your posts.");
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, [router]);

  async function handleSubmit() {
    if (!selectedPostId || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await fetchAPI("/analytics/boosts/", {
        method: "POST",
        body: JSON.stringify({
          post_id: selectedPostId,
          duration_days: durationDays,
          target_audience: targetAudience,
        }),
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Failed to create boost. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function getPostText(post: Post): string {
    const raw = post.content || post.text || "";
    return raw.length > 120 ? raw.slice(0, 120) + "..." : raw;
  }

  function formatDate(post: Post): string {
    const date = post.created_at || post.created;
    if (!date) return "";
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const selectedDuration = DURATIONS.find((d) => d.days === durationDays);

  if (success) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto px-4 py-8" data-page>
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-all press-effect"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <h1 className="font-headline text-3xl text-on-surface">Boost Post</h1>
          </div>

          <div className="bg-surface-container-lowest rounded-xl editorial-shadow p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-green-600 text-3xl">check_circle</span>
            </div>
            <h2 className="font-headline text-2xl text-on-surface mb-2">Boost Created!</h2>
            <p className="text-on-surface-variant mb-6">
              Your post will be boosted for {durationDays} day{durationDays > 1 ? "s" : ""} to{" "}
              {AUDIENCES.find((a) => a.value === targetAudience)?.label?.toLowerCase()}.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/boost/analytics"
                className="bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold press-effect inline-flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">analytics</span>
                View Boost Analytics
              </Link>
              <button
                onClick={() => router.push("/")}
                className="bg-surface-container-high text-on-surface px-6 py-3 rounded-xl font-semibold press-effect"
              >
                Back to Feed
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto px-4 py-8" data-page>
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface-container-high transition-all press-effect"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="font-headline text-3xl text-on-surface">Boost Post</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-red-700 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        )}

        {/* Step 1: Select a Post */}
        <div className="mb-8">
          <h2 className="font-headline text-xl text-on-surface mb-4">Select a Post to Boost</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl editorial-shadow p-6 text-center">
              <span className="material-symbols-outlined text-on-surface-variant text-4xl mb-2">edit_note</span>
              <p className="text-on-surface-variant">You don&apos;t have any posts yet.</p>
              <Link
                href="/feed"
                className="text-primary font-semibold text-sm mt-2 inline-block hover:underline"
              >
                Create your first post
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => setSelectedPostId(post.id)}
                  className={`w-full text-left bg-surface-container-lowest rounded-xl editorial-shadow p-5 transition-all ${
                    selectedPostId === post.id
                      ? "ring-2 ring-primary bg-primary/5"
                      : "hover:bg-surface-container-low"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {post.title && (
                        <h3 className="font-semibold text-on-surface mb-1 truncate">{post.title}</h3>
                      )}
                      <p className="text-sm text-on-surface-variant leading-relaxed">
                        {getPostText(post)}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-on-surface-variant">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">favorite</span>
                          {post.reactions_count ?? post.likes_count ?? 0}
                        </span>
                        <span>{formatDate(post)}</span>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                        selectedPostId === post.id
                          ? "border-primary bg-primary"
                          : "border-outline-variant"
                      }`}
                    >
                      {selectedPostId === post.id && (
                        <span className="material-symbols-outlined text-on-primary text-xs">check</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 2: Boost Configuration (shown when a post is selected) */}
        {selectedPostId && (
          <div className="space-y-6">
            {/* Duration */}
            <div className="bg-surface-container-lowest rounded-xl editorial-shadow p-6">
              <h2 className="font-headline text-xl text-on-surface mb-4">Boost Duration</h2>
              <div className="space-y-2">
                {DURATIONS.map((d) => (
                  <button
                    key={d.days}
                    onClick={() => setDurationDays(d.days)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between ${
                      durationDays === d.days
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-surface-container-high text-on-surface"
                    }`}
                  >
                    <span>{d.label}</span>
                    {durationDays === d.days && (
                      <span className="material-symbols-outlined text-sm">check</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Audience */}
            <div className="bg-surface-container-lowest rounded-xl editorial-shadow p-6">
              <h2 className="font-headline text-xl text-on-surface mb-4">Target Audience</h2>
              <div className="space-y-2">
                {AUDIENCES.map((a) => (
                  <button
                    key={a.value}
                    onClick={() => setTargetAudience(a.value)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between ${
                      targetAudience === a.value
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-surface-container-high text-on-surface"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-sm">{a.icon}</span>
                      {a.label}
                    </span>
                    {targetAudience === a.value && (
                      <span className="material-symbols-outlined text-sm">check</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Reach */}
            <div className="bg-surface-container-lowest rounded-xl editorial-shadow p-6">
              <h2 className="font-headline text-xl text-on-surface mb-3">Estimated Reach</h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-tertiary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary">trending_up</span>
                </div>
                <div>
                  <p className="font-semibold text-on-surface text-lg">{selectedDuration?.reach}</p>
                  <p className="text-xs text-on-surface-variant">
                    Based on {selectedDuration?.label?.toLowerCase()} boost to{" "}
                    {AUDIENCES.find((a) => a.value === targetAudience)?.label?.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-primary text-on-primary py-4 rounded-xl font-semibold text-lg disabled:opacity-50 press-effect flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-on-primary"></div>
                  Creating Boost...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">rocket_launch</span>
                  Boost Post
                </>
              )}
            </button>

            <p className="text-center">
              <Link
                href="/boost/analytics"
                className="text-sm text-primary font-medium hover:underline"
              >
                View existing boosts
              </Link>
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default function BoostPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Shimmer className="h-10 w-48 mb-8" />
          <Shimmer className="h-24 w-full mb-4" />
          <Shimmer className="h-24 w-full mb-4" />
          <Shimmer className="h-24 w-full" />
        </div>
      </MainLayout>
    }>
      <BoostContent />
    </Suspense>
  );
}
