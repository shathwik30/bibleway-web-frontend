"use client";

import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import Footer from "./Footer";

interface MainLayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

export default function MainLayout({
  children,
  hideFooter = false,
}: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar_collapsed") === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("sidebar_collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
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
          <main className="flex-1" data-page>
            {children}
          </main>
          {!hideFooter && <Footer />}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
