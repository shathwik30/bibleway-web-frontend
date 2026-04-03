"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import NotificationDropdown from "./NotificationDropdown";
import GlobalSearch from "./GlobalSearch";
import { fetchAPI } from "../lib/api";

interface NavbarProps {
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

const ICON_BTN = "w-9 h-9 flex items-center justify-center rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all duration-200";

export default function Navbar({ sidebarCollapsed, onToggleSidebar }: NavbarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<{ full_name?: string; profile_photo?: string; follower_count?: number; following_count?: number } | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Load user data
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user");
        if (stored) setUser(JSON.parse(stored));
      } catch { /* ignore */ }
    }
    // Also fetch fresh data
    fetchAPI("/accounts/profile/")
      .then((res) => {
        const d = res?.data || res;
        if (d?.full_name) {
          const userData = { full_name: d.full_name, profile_photo: d.profile_photo, follower_count: d.follower_count || 0, following_count: d.following_count || 0 };
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    try {
      const refresh = localStorage.getItem("refresh_token");
      await fetchAPI("/accounts/logout/", { method: "POST", body: JSON.stringify({ refresh }) }).catch(() => {});
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      localStorage.removeItem("user_id");
      window.location.href = "/login";
    }
  }

  const firstName = user?.full_name?.split(" ")[0] || "friend";

  return (
    <header className="glass-header fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 hover:shadow-sm">
      <div className="flex justify-between items-center w-full px-6 h-16">
        {/* Left: Sidebar toggle + Logo */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className={`hidden lg:flex ${ICON_BTN}`}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <span
                className="material-symbols-outlined text-[22px] transition-transform duration-300"
                style={{ transform: sidebarCollapsed ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                menu_open
              </span>
            </button>
          )}
          <Link href="/" className="flex items-center">
            <img src="/bibleway-logo.png" alt="Bibleway" className="h-8 w-auto" />
          </Link>
        </div>

        {/* Center: Search */}
        <div className="flex-1 flex justify-center mx-4">
          <GlobalSearch />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          <Link href="/chat" className={ICON_BTN} aria-label="Messages" title="Chat">
            <span className="material-symbols-outlined text-[22px]">chat</span>
          </Link>

          <NotificationDropdown />

          {/* Profile Avatar + Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className={ICON_BTN}
              title="Profile"
            >
              <div className="w-7 h-7 rounded-full bg-surface-container-high overflow-hidden border-2 border-primary-fixed flex items-center justify-center hover:border-primary transition-colors">
                {user?.profile_photo ? (
                  <img src={user.profile_photo} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant text-[16px]">person</span>
                )}
              </div>
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-full mt-2 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/20 z-[100] overflow-hidden w-56">
                {/* Greeting */}
                <div className="px-5 pt-5 pb-3">
                  <p className="text-xs text-on-surface-variant/60 font-medium">Peace be with you,</p>
                  <p className="text-base font-headline text-on-surface mt-0.5">{firstName}</p>
                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-3 mt-2 text-xs text-on-surface-variant hover:text-primary transition-colors"
                  >
                    <span><span className="font-bold text-on-surface">{user?.follower_count ?? 0}</span> followers</span>
                    <span className="text-on-surface-variant/30">&middot;</span>
                    <span><span className="font-bold text-on-surface">{user?.following_count ?? 0}</span> following</span>
                  </Link>
                </div>
                <div className="border-t border-outline-variant/10">
                  <Link
                    href="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">person</span>
                    My Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">settings</span>
                    Settings
                  </Link>
                  <Link
                    href="/analytics"
                    onClick={() => setProfileOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">analytics</span>
                    Analytics
                  </Link>
                  <Link
                    href="/shop/purchases"
                    onClick={() => setProfileOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 text-on-surface hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">shopping_bag</span>
                    My Purchases
                  </Link>
                </div>
                <div className="border-t border-outline-variant/10">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
