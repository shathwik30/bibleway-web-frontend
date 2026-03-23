"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "../lib/i18n";

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const bottomLinks = [
    { href: "/", label: t("feed.home"), icon: "home" },
    { href: "/bible", label: t("bible.bible"), icon: "menu_book" },
    { href: "/bible?tab=study", label: t("bible.study"), icon: "school" },
    { href: "/chat", label: "Chat", icon: "chat" },
    { href: "/profile", label: t("profile.profile"), icon: "person" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-2 bg-stone-50/90 backdrop-blur-2xl rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
      {bottomLinks.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center px-3 py-1.5 transition-transform hover:scale-105 ${
              isActive
                ? "bg-primary/10 text-primary rounded-xl"
                : "text-stone-400"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={
                isActive
                  ? { fontVariationSettings: "'FILL' 1" }
                  : undefined
              }
            >
              {link.icon}
            </span>
            <span className="font-sans uppercase tracking-widest text-[10px] font-bold mt-1">
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
