"use client";

import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import Footer from "./Footer";
import AuthGuard from "./AuthGuard";

interface MainLayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

export default function MainLayout({
  children,
  hideFooter = false,
}: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar_collapsed") === "true";
    setSidebarCollapsed(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("sidebar_collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed, hydrated]);

  return (
    <AuthGuard>
      <div className="overflow-x-hidden">
        <Navbar
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
        />
        {/* Spacer for fixed navbar height */}
        <div className="h-16" />
        <div className="flex min-h-[calc(100vh-4rem)]">
          <Sidebar collapsed={sidebarCollapsed} />
          <div className="flex-1 min-w-0 flex flex-col">
            <main className={`flex-1 ${hideFooter ? "" : "pb-24 md:pb-0"}`} data-page>
              {children}
            </main>
            {!hideFooter && <Footer />}
          </div>
        </div>
        <BottomNav />
      </div>
    </AuthGuard>
  );
}
