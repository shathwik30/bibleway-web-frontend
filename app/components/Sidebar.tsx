"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "../lib/i18n";
import { useTheme } from "../lib/ThemeContext";
import { fetchAPI } from "../lib/api";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "sw", label: "Kiswahili", flag: "🇰🇪" },
];

const sideLinks = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/bible", label: "Bible", icon: "menu_book" },
  { href: "/shop", label: "Shop", icon: "shopping_bag" },
  { href: "/chat", label: "Chat", icon: "chat" },
  { href: "/games", label: "Games", icon: "sports_esports" },
];

interface SidebarProps {
  collapsed: boolean;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const pathname = usePathname();
  const { locale, setLocale } = useTranslation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [langOpen, setLangOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  const themeIcon = theme === "system" ? "brightness_auto" : resolvedTheme === "dark" ? "dark_mode" : "light_mode";
  const themeLabel = theme === "system" ? "System" : resolvedTheme === "dark" ? "Dark" : "Light";

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setThemeOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleLanguageChange(code: string) {
    setLocale(code);
    setLangOpen(false);
    fetchAPI("/accounts/profile/", { method: "PATCH", body: JSON.stringify({ preferred_language: code }) }).catch(() => {});
  }

  const currentLang = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] pt-6 pb-8 bg-surface-container z-40 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out border-r border-outline-variant/10 ${
          collapsed ? "w-[72px]" : "w-64"
        }`}
      >
        <div className={`mb-8 transition-all duration-300 ${collapsed ? "px-2" : "px-6"}`}>
          {!collapsed && (
            <h3 className="text-xs font-label uppercase tracking-[0.2em] text-on-surface-variant/60 mb-6 transition-opacity duration-200">
              Navigation
            </h3>
          )}
          <nav className="space-y-1">
            {sideLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  title={collapsed ? link.label : undefined}
                  className={`flex items-center gap-4 py-2.5 transition-all duration-200 rounded-xl ${
                    isActive
                      ? collapsed
                        ? "text-primary font-bold bg-primary/10 justify-center px-2"
                        : "text-primary font-bold border-l-4 border-tertiary-fixed-dim pl-4 bg-surface-container-high/50"
                      : collapsed
                        ? "text-on-surface-variant hover:bg-surface-container-high justify-center px-2"
                        : "text-on-surface-variant pl-5 hover:bg-surface-container-high"
                  } ${link.isComingSoon ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={(e) => link.isComingSoon && e.preventDefault()}
                >
                  <div className="relative shrink-0">
                    <span className="material-symbols-outlined">{link.icon}</span>
                    {link.isComingSoon && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-tertiary rounded-full"></span>
                    )}
                  </div>
                  {!collapsed && (
                    <span className="font-headline text-lg whitespace-nowrap overflow-hidden">
                      {link.label}
                      {link.isComingSoon && <span className="ml-2 text-[8px] font-label uppercase tracking-widest opacity-60">Soon</span>}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className={`mt-auto space-y-1 transition-all duration-300 ${collapsed ? "px-2" : "px-6"}`}>
          {/* Language Selector */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              title={collapsed ? `Language: ${currentLang.label}` : undefined}
              className={`flex items-center gap-4 text-on-surface-variant hover:text-primary transition-colors duration-200 py-3 rounded-xl w-full ${
                collapsed ? "justify-center px-2" : "pl-5"
              }`}
            >
              <span className="text-lg shrink-0">{currentLang.flag}</span>
              {!collapsed && <span className="text-sm font-medium">{currentLang.label}</span>}
            </button>
            {langOpen && (
              <div className={`absolute bottom-full mb-2 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/20 z-50 overflow-hidden ${
                collapsed ? "left-full ml-2 w-44" : "left-0 right-0"
              }`}>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                      locale === lang.code
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-on-surface hover:bg-surface-container-low"
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                    {locale === lang.code && <span className="material-symbols-outlined text-[16px] ml-auto">check</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Picker */}
          <div className="relative" ref={themeRef}>
            <button
              onClick={() => setThemeOpen(!themeOpen)}
              title={collapsed ? `Theme: ${themeLabel}` : undefined}
              className={`flex items-center gap-4 text-on-surface-variant hover:text-primary transition-colors duration-200 py-3 rounded-xl w-full ${
                collapsed ? "justify-center px-2" : "pl-5"
              }`}
            >
              <span className="material-symbols-outlined shrink-0">{themeIcon}</span>
              {!collapsed && <span className="text-sm font-medium">{themeLabel}</span>}
            </button>
            {themeOpen && (
              <div className={`absolute bottom-full mb-2 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/20 z-50 overflow-hidden ${
                collapsed ? "left-full ml-2 w-40" : "left-0 right-0"
              }`}>
                {([
                  { value: "light" as const, icon: "light_mode", label: "Light" },
                  { value: "dark" as const, icon: "dark_mode", label: "Dark" },
                  { value: "system" as const, icon: "brightness_auto", label: "System" },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setTheme(opt.value); setThemeOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                      theme === opt.value
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-on-surface hover:bg-surface-container-low"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
                    {opt.label}
                    {theme === opt.value && <span className="material-symbols-outlined text-[16px] ml-auto">check</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <Link
            href="/settings"
            title={collapsed ? "Settings" : undefined}
            className={`flex items-center gap-4 text-on-surface-variant hover:text-primary transition-colors duration-200 py-3 rounded-xl ${
              collapsed ? "justify-center px-2" : "pl-5"
            }`}
          >
            <span className="material-symbols-outlined shrink-0">settings</span>
            {!collapsed && <span className="text-sm font-medium">Settings</span>}
          </Link>
        </div>
      </aside>

      {/* Spacer to push main content */}
      <div
        className={`hidden lg:block shrink-0 transition-all duration-300 ease-in-out ${
          collapsed ? "w-[72px]" : "w-64"
        }`}
      />
    </>
  );
}
