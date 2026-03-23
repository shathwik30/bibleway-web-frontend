"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sideLinks = [
  { href: "/", label: "Daily Verse", icon: "auto_awesome" },
  { href: "/bible", label: "Bible Hub", icon: "menu_book" },
  { href: "/shop", label: "Shop", icon: "shopping_bag" },
  { href: "/games", label: "Games", icon: "sports_esports", isComingSoon: true },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-0 h-full py-8 bg-stone-100 pt-24 z-40 overflow-y-auto">
      <div className="px-6 mb-8">
        <h3 className="text-xs font-label uppercase tracking-[0.2em] text-on-surface-variant/60 mb-6">
          Navigation
        </h3>
        <nav className="space-y-2">
          {sideLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-4 py-2 transition-all rounded-r-lg ${
                  isActive
                    ? "text-primary font-bold border-l-4 border-tertiary-fixed-dim pl-4 bg-stone-200/50"
                    : "text-stone-600 pl-5 hover:bg-stone-200"
                } ${link.isComingSoon ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={(e) => link.isComingSoon && e.preventDefault()}
              >
                <div className="relative">
                  <span className="material-symbols-outlined">{link.icon}</span>
                  {link.isComingSoon && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-tertiary rounded-full"></span>
                  )}
                </div>
                <span className="font-headline text-lg">
                  {link.label}
                  {link.isComingSoon && <span className="ml-2 text-[8px] font-label uppercase tracking-widest opacity-60">Soon</span>}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto px-6">
        <Link
          href="/settings"
          className="flex items-center gap-4 text-stone-500 hover:text-primary transition-colors py-3 pl-5"
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-sm font-medium">Settings</span>
        </Link>
        <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
          <p className="text-[10px] font-label uppercase tracking-widest text-primary mb-2">
            Today&apos;s Reflection
          </p>
          <p className="text-sm italic font-headline text-on-surface-variant">
            &ldquo;Be still, and know that I am God.&rdquo;
          </p>
        </div>
      </div>
    </aside>
  );
}
