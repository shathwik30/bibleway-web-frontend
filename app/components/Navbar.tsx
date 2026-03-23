"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationDropdown from "./NotificationDropdown";
import GlobalSearch from "./GlobalSearch";
import { useTranslation } from "../lib/i18n";

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navLinks = [
    { href: "/", label: t("feed.home") },
    { href: "/bible", label: t("bible.bible") },
    { href: "/shop", label: t("shop.shop") },
    { href: "/profile", label: t("profile.profile") },
  ];

  return (
    <header className="bg-stone-50/80 backdrop-blur-xl sticky top-0 z-50 transition-shadow duration-300 hover:shadow-sm">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="block">
          <img src="/bibleway-logo.png" alt="Bibleway" className="h-8 w-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium nav-link ${
                  isActive
                    ? "text-primary active"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <Link href="/chat" className="p-2 text-on-surface-variant hover:text-primary transition-colors relative" aria-label="Messages">
            <span className="material-symbols-outlined">chat</span>
          </Link>
          <GlobalSearch />
          <NotificationDropdown />
          <Link 
            href="/profile"
            className="w-9 h-9 rounded-full bg-surface-container-high overflow-hidden border-2 border-primary-fixed flex items-center justify-center cursor-pointer hover:border-primary hover:scale-105 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-on-surface-variant">
              person
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
