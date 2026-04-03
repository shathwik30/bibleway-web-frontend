"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MainLayout from "../../components/MainLayout";
import { fetchAPI } from "../../lib/api";

interface Boost {
  id: string;
  post_id?: string;
  post?: {
    id: string;
    title?: string;
    content?: string;
    text?: string;
  };
  post_title?: string;
  post_content?: string;
  status: "active" | "completed" | "pending";
  views?: number;
  clicks?: number;
  impressions?: number;
  engagements?: number;
  engagement_rate?: number;
  duration_days?: number;
  target_audience?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  active: { bg: "bg-green-100", text: "text-green-700", label: "Active" },
  completed: { bg: "bg-gray-100", text: "text-gray-600", label: "Completed" },
  pending: { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pending" },
};

export default function BoostAnalyticsPage() {
  const router = useRouter();
  const [boosts, setBoosts] = useState<Boost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<Record<string, Boost>>({});
  const [detailLoading, setDetailLoading] = useState<string | null>(null);

  useEffect(() => {
    async function loadBoosts() {
      try {
        const res = await fetchAPI("/analytics/boosts/");
        const results = res?.data?.results ?? res?.results ?? res?.data ?? [];
        setBoosts(Array.isArray(results) ? results : []);
      } catch {
        setError("Failed to load boost analytics.");
      } finally {
        setLoading(false);
      }
    }
    loadBoosts();
  }, []);

  async function loadDetail(boostId: string) {
    if (detailData[boostId]) return;
    setDetailLoading(boostId);
    try {
      const res = await fetchAPI(`/analytics/boosts/${boostId}/analytics/`);
      const data = res?.data ?? res;
      setDetailData((prev) => ({ ...prev, [boostId]: data }));
    } catch {
      // Silently fail, we still show the summary data
    } finally {
      setDetailLoading(null);
    }
  }

  function toggleExpand(boostId: string) {
    const opening = expandedId !== boostId;
    setExpandedId(opening ? boostId : null);
    if (opening) loadDetail(boostId);
  }

  function getPostPreview(boost: Boost): string {
    const text =
      boost.post?.content ||
      boost.post?.text ||
      boost.post_content ||
      boost.post_title ||
      "Untitled post";
    return text.length > 100 ? text.slice(0, 100) + "..." : text;
  }

  function getPostTitle(boost: Boost): string {
    return boost.post?.title || boost.post_title || "Boosted Post";
  }

  function formatDate(dateStr?: string): string {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function getEngagementRate(boost: Boost): string {
    if (boost.engagement_rate != null) return (boost.engagement_rate * 100).toFixed(1);
    const views = boost.views || boost.impressions || 0;
    const clicks = boost.clicks || boost.engagements || 0;
    if (views === 0) return "0.0";
    return ((clicks / views) * 100).toFixed(1);
  }

  function getBarWidth(value: number, max: number): number {
    if (max === 0) return 0;
    return Math.min(Math.round((value / max) * 100), 100);
  }

  if (loading) {
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
            <h1 className="font-headline text-3xl text-on-surface">Boost Analytics</h1>
          </div>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-primary"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const maxViews = Math.max(...boosts.map((b) => b.views || b.impressions || 0), 1);

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
          <h1 className="font-headline text-3xl text-on-surface">Boost Analytics</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-red-700 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        )}

        {boosts.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl editorial-shadow p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-on-surface-variant text-3xl">
                rocket_launch
              </span>
            </div>
            <h2 className="font-headline text-xl text-on-surface mb-2">No Boosts Yet</h2>
            <p className="text-on-surface-variant mb-6">
              You haven&apos;t boosted any posts yet. Boost a post to reach more people.
            </p>
            <Link
              href="/boost"
              className="bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold press-effect inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">rocket_launch</span>
              Boost a Post
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-surface-container-lowest rounded-xl p-4 editorial-shadow text-center">
                <p className="text-2xl font-bold text-on-surface">{boosts.length}</p>
                <p className="text-xs text-on-surface-variant mt-1">Total Boosts</p>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-4 editorial-shadow text-center">
                <p className="text-2xl font-bold text-on-surface">
                  {boosts.filter((b) => b.status === "active").length}
                </p>
                <p className="text-xs text-on-surface-variant mt-1">Active</p>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-4 editorial-shadow text-center">
                <p className="text-2xl font-bold text-on-surface">
                  {boosts.reduce((sum, b) => sum + (b.views || b.impressions || 0), 0).toLocaleString()}
                </p>
                <p className="text-xs text-on-surface-variant mt-1">Total Views</p>
              </div>
            </div>

            {/* Boost Cards */}
            {boosts.map((boost) => {
              const status = STATUS_STYLES[boost.status] || STATUS_STYLES.pending;
              const detail = detailData[boost.id];
              const displayBoost = detail || boost;
              const views = displayBoost.views || displayBoost.impressions || 0;
              const clicks = displayBoost.clicks || displayBoost.engagements || 0;

              return (
                <div
                  key={boost.id}
                  className="bg-surface-container-lowest rounded-xl editorial-shadow overflow-hidden"
                >
                  <button
                    onClick={() => toggleExpand(boost.id)}
                    className="w-full text-left p-5 hover:bg-surface-container-low/50 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-on-surface truncate">
                            {getPostTitle(boost)}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${status.bg} ${status.text} flex-shrink-0`}
                          >
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {getPostPreview(boost)}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-2">
                          {formatDate(boost.start_date || boost.created_at)} &mdash;{" "}
                          {formatDate(boost.end_date)}
                        </p>
                      </div>
                      <span
                        className={`material-symbols-outlined text-on-surface-variant/40 text-sm transition-transform duration-200 flex-shrink-0 mt-1 ${
                          expandedId === boost.id ? "rotate-90" : ""
                        }`}
                      >
                        chevron_right
                      </span>
                    </div>
                  </button>

                  {expandedId === boost.id && (
                    <div className="px-5 pb-5 pt-0">
                      {detailLoading === boost.id ? (
                        <div className="flex justify-center py-4">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-primary"></div>
                        </div>
                      ) : (
                        <>
                          {/* Metrics Grid */}
                          <div className="grid grid-cols-3 gap-3 mb-5">
                            <div className="bg-surface-container-low rounded-xl p-4 text-center">
                              <p className="text-xl font-bold text-on-surface">
                                {views.toLocaleString()}
                              </p>
                              <p className="text-xs text-on-surface-variant mt-1">Views</p>
                            </div>
                            <div className="bg-surface-container-low rounded-xl p-4 text-center">
                              <p className="text-xl font-bold text-on-surface">
                                {clicks.toLocaleString()}
                              </p>
                              <p className="text-xs text-on-surface-variant mt-1">Clicks</p>
                            </div>
                            <div className="bg-surface-container-low rounded-xl p-4 text-center">
                              <p className="text-xl font-bold text-on-surface">
                                {getEngagementRate(displayBoost)}%
                              </p>
                              <p className="text-xs text-on-surface-variant mt-1">Engagement</p>
                            </div>
                          </div>

                          {/* Bar Chart */}
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-on-surface-variant">Views</span>
                                <span className="text-xs font-medium text-on-surface">
                                  {views.toLocaleString()}
                                </span>
                              </div>
                              <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full transition-all duration-500"
                                  style={{ width: `${getBarWidth(views, maxViews)}%` }}
                                ></div>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-on-surface-variant">Clicks</span>
                                <span className="text-xs font-medium text-on-surface">
                                  {clicks.toLocaleString()}
                                </span>
                              </div>
                              <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-tertiary rounded-full transition-all duration-500"
                                  style={{ width: `${getBarWidth(clicks, maxViews)}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>

                          {/* Duration & Audience Info */}
                          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-outline-variant/10 text-xs text-on-surface-variant">
                            {displayBoost.duration_days && (
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">schedule</span>
                                {displayBoost.duration_days} day
                                {displayBoost.duration_days > 1 ? "s" : ""}
                              </span>
                            )}
                            {displayBoost.target_audience && (
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">group</span>
                                {displayBoost.target_audience === "everyone"
                                  ? "Everyone"
                                  : displayBoost.target_audience === "followers"
                                    ? "Followers"
                                    : displayBoost.target_audience === "local"
                                      ? "Local Community"
                                      : displayBoost.target_audience}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="text-center pt-2">
              <Link
                href="/boost"
                className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Create New Boost
              </Link>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
