import { describe, it, expect } from "vitest";
import { CACHE_DURATIONS } from "../app/lib/cache";

describe("Cache Durations", () => {
  it("feed has 30s stale time", () => {
    expect(CACHE_DURATIONS.feed.staleTime).toBe(30_000);
  });

  it("feed has 5m gc time", () => {
    expect(CACHE_DURATIONS.feed.gcTime).toBe(5 * 60_000);
  });

  it("profile has 5m stale time", () => {
    expect(CACHE_DURATIONS.profile.staleTime).toBe(5 * 60_000);
  });

  it("profile has 30m gc time", () => {
    expect(CACHE_DURATIONS.profile.gcTime).toBe(30 * 60_000);
  });

  it("verseOfDay has 1h stale time", () => {
    expect(CACHE_DURATIONS.verseOfDay.staleTime).toBe(60 * 60_000);
  });

  it("bibleVersions has 24h stale time", () => {
    expect(CACHE_DURATIONS.bibleVersions.staleTime).toBe(24 * 60 * 60_000);
  });

  it("bibleContent has 7d stale time", () => {
    expect(CACHE_DURATIONS.bibleContent.staleTime).toBe(7 * 24 * 60 * 60_000);
  });

  it("segregatedPages has 30m stale time", () => {
    expect(CACHE_DURATIONS.segregatedPages.staleTime).toBe(30 * 60_000);
  });

  it("shopProducts has 10m stale time", () => {
    expect(CACHE_DURATIONS.shopProducts.staleTime).toBe(10 * 60_000);
  });

  it("notifications has 0 stale time (always fresh)", () => {
    expect(CACHE_DURATIONS.notifications.staleTime).toBe(0);
  });

  it("unreadCount has 0 stale time", () => {
    expect(CACHE_DURATIONS.unreadCount.staleTime).toBe(0);
  });

  it("all durations match mobile app config", () => {
    // Mobile src/constants/api.ts matching values
    const expected = {
      feed: { stale: 30_000, gc: 300_000 },
      profile: { stale: 300_000, gc: 1_800_000 },
      verseOfDay: { stale: 3_600_000, gc: 86_400_000 },
      bibleVersions: { stale: 86_400_000, gc: 604_800_000 },
      bibleContent: { stale: 604_800_000, gc: 2_592_000_000 },
      segregatedPages: { stale: 1_800_000, gc: 7_200_000 },
      shopProducts: { stale: 600_000, gc: 3_600_000 },
      notifications: { stale: 0, gc: 300_000 },
      unreadCount: { stale: 0, gc: 60_000 },
    };

    for (const [key, val] of Object.entries(expected)) {
      const duration = CACHE_DURATIONS[key as keyof typeof CACHE_DURATIONS];
      expect(duration.staleTime, `${key} staleTime`).toBe(val.stale);
      expect(duration.gcTime, `${key} gcTime`).toBe(val.gc);
    }
  });
});
